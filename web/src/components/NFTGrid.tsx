/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { formatEther, getAddress, parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useCoFHE } from "@/hooks/useCoFHE";
import { shortAddress, type MarketplaceNFT } from "@/hooks/useStealthMarketplace";
import { APP_CHAIN_ID, MARKETPLACE_ABI, MARKETPLACE_ADDRESS, MAX_ENCRYPTED_WEI } from "@/lib/contracts";

interface NFTGridProps {
  nfts: MarketplaceNFT[];
  onRefresh?: () => Promise<void> | void;
}

type RevealedSettlement = {
  buyer: `0x${string}`;
  offer: bigint;
};

export function NFTGrid({ nfts, onRefresh }: NFTGridProps) {
  const [selected, setSelected] = useState<MarketplaceNFT | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [revealed, setRevealed] = useState<RevealedSettlement | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: APP_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();
  const { encryptUint64, decryptAddressForTx, decryptUint64ForTx, busy, status } = useCoFHE();

  const selectedIsSeller = useMemo(
    () => Boolean(selected && address && selected.seller.toLowerCase() === address.toLowerCase()),
    [address, selected]
  );

  const waitAndRefresh = async (hash: `0x${string}`) => {
    if (!publicClient) {
      return;
    }

    await publicClient.waitForTransactionReceipt({ hash });
    await onRefresh?.();
  };

  const submitOffer = async (nft: MarketplaceNFT) => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first.");
      return;
    }

    if (!nft.listingActive) {
      toast.error("This NFT is not actively listed.");
      return;
    }

    let offerWei: bigint;
    try {
      offerWei = parseEther(offerAmount || "0");
    } catch {
      toast.error("Enter a valid offer amount.");
      return;
    }

    if (offerWei <= 0n) {
      toast.error("Offer amount must be greater than zero.");
      return;
    }

    if (offerWei > MAX_ENCRYPTED_WEI) {
      toast.error("Encrypted uint64 offers support up to about 18.44 ETH.");
      return;
    }

    setAction("Encrypting sealed offer");
    try {
      const encryptedOffer = await encryptUint64(offerWei);
      const contractOffer = { ...encryptedOffer, signature: encryptedOffer.signature as `0x${string}` };
      setAction("Submitting sealed offer");
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "submitSealedOffer",
        args: [BigInt(nft.tokenId), contractOffer],
      });
      await waitAndRefresh(hash);
      toast.success("Sealed offer submitted.");
      setOfferAmount("");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Offer submission failed.");
    } finally {
      setAction(null);
    }
  };

  const prepareReveal = async (nft: MarketplaceNFT) => {
    setAction("Preparing reveal");
    try {
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "prepareSaleReveal",
        args: [BigInt(nft.tokenId)],
      });
      await waitAndRefresh(hash);
      toast.success("Winning buyer and offer are ready for threshold decryption.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Reveal preparation failed.");
    } finally {
      setAction(null);
    }
  };

  const cancelListing = async (nft: MarketplaceNFT) => {
    setAction("Cancelling listing");
    try {
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "cancelListing",
        args: [BigInt(nft.tokenId)],
      });
      await waitAndRefresh(hash);
      toast.success("Listing cancelled.");
      setSelected(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Cancel failed.");
    } finally {
      setAction(null);
    }
  };

  const finalizeSale = async (nft: MarketplaceNFT) => {
    if (!address) {
      toast.error("Connect your wallet first.");
      return;
    }

    if (!nft.revealPrepared) {
      toast.error("Seller must prepare the sale reveal first.");
      return;
    }

    setAction("Decrypting settlement proof");
    try {
      const [buyerResult, offerResult] = await Promise.all([
        decryptAddressForTx(nft.pendingBuyerHandle),
        decryptUint64ForTx(nft.highestOfferHandle),
      ]);

      const buyer = getAddress(buyerResult.decryptedValue) as `0x${string}`;
      const offer = offerResult.decryptedValue;
      setRevealed({ buyer, offer });

      if (buyer.toLowerCase() !== address.toLowerCase()) {
        toast.error(`Winning buyer is ${shortAddress(buyer)}.`);
        return;
      }

      setAction("Finalizing sale");
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "finalizeSale",
        args: [BigInt(nft.tokenId), buyer, buyerResult.signature as `0x${string}`, offer, offerResult.signature as `0x${string}`],
        value: offer,
      });
      await waitAndRefresh(hash);
      toast.success("Sale finalized on-chain.");
      setSelected(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Settlement failed.");
    } finally {
      setAction(null);
    }
  };

  if (nfts.length === 0) {
    return (
      <div className="panel px-6 py-14 text-center">
        <h3 className="text-3xl text-[rgb(var(--ink))]">No on-chain NFTs found yet.</h3>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[rgb(var(--muted))]">
          Mint and list a collectible to populate the live marketplace index.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {nfts.map((nft) => (
          <article key={nft.tokenId} className="panel group overflow-hidden transition-transform duration-200 hover:-translate-y-1">
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => {
                setSelected(nft);
                setRevealed(null);
                setOfferAmount("");
              }}
            >
              <div className="relative aspect-square overflow-hidden border-b border-[rgb(var(--line))] bg-[rgb(var(--surface))]">
                <img src={nft.image} alt={nft.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span className="status-pill bg-[rgb(var(--surface)/0.92)]">{nft.listingActive ? "Listed" : "Owned"}</span>
                  {nft.encrypted ? <span className="status-pill bg-[rgb(var(--surface)/0.92)]">Encrypted</span> : null}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl text-[rgb(var(--ink))]">{nft.name}</h3>
                    <p className="mt-1 text-sm font-bold text-[rgb(var(--muted))]">Token #{nft.tokenId}</p>
                  </div>
                  <span className="rounded-lg bg-[rgb(var(--gold)/0.18)] px-3 py-1 text-sm font-extrabold text-[rgb(var(--ink))]">
                    {nft.displayPrice}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[rgb(var(--muted))]">{nft.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[rgb(var(--line))] pt-4 text-sm">
                  <p>
                    <span className="block font-extrabold text-[rgb(var(--ink))]">{nft.bidCount}</span>
                    <span className="text-[rgb(var(--muted))]">sealed offers</span>
                  </p>
                  <p>
                    <span className="block font-extrabold text-[rgb(var(--ink))]">{shortAddress(nft.seller)}</span>
                    <span className="text-[rgb(var(--muted))]">seller</span>
                  </p>
                </div>
              </div>
            </button>
          </article>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(var(--ink)/0.35)] p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="panel max-h-[92vh] w-full max-w-5xl overflow-auto" onClick={(event) => event.stopPropagation()}>
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="relative min-h-[320px] bg-[rgb(var(--surface))]">
                <img src={selected.image} alt={selected.name} className="h-full max-h-[720px] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--surface)/0.92)] font-extrabold text-[rgb(var(--ink))]"
                  aria-label="Close"
                >
                  X
                </button>
              </div>

              <div className="flex flex-col gap-5 p-5">
                <div>
                  <span className="eyebrow">{selected.listingActive ? "Private listing" : "Collection item"}</span>
                  <h2 className="mt-4 text-4xl text-[rgb(var(--ink))]">{selected.name}</h2>
                  <p className="mt-3 text-base leading-7 text-[rgb(var(--muted))]">{selected.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="metric-card">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--muted))]">Price</p>
                    <p className="mt-2 text-xl font-extrabold text-[rgb(var(--ink))]">{selected.displayPrice}</p>
                  </div>
                  <div className="metric-card">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--muted))]">Offers</p>
                    <p className="mt-2 text-xl font-extrabold text-[rgb(var(--ink))]">{selected.bidCount}</p>
                  </div>
                  <div className="metric-card">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--muted))]">Seller</p>
                    <p className="mt-2 text-base font-extrabold text-[rgb(var(--ink))]">{shortAddress(selected.seller)}</p>
                  </div>
                  <div className="metric-card">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--muted))]">Reveal</p>
                    <p className="mt-2 text-base font-extrabold text-[rgb(var(--ink))]">{selected.revealPrepared ? "Prepared" : "Sealed"}</p>
                  </div>
                </div>

                {revealed ? (
                  <div className="border border-[rgb(var(--line))] bg-[rgb(var(--paper))] p-4">
                    <p className="text-sm font-extrabold text-[rgb(var(--ink))]">Latest decrypt result</p>
                    <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                      Buyer {shortAddress(revealed.buyer)} at {formatEther(revealed.offer)} ETH
                    </p>
                  </div>
                ) : null}

                {!isConnected ? (
                  <div className="border-t border-[rgb(var(--line))] pt-5">
                    <ConnectButton showBalance={false} />
                  </div>
                ) : selectedIsSeller ? (
                  <div className="grid gap-3 border-t border-[rgb(var(--line))] pt-5">
                    <button disabled={!selected.bidReceived || selected.revealPrepared || busy || Boolean(action)} onClick={() => prepareReveal(selected)} className="btn-primary disabled:opacity-55">
                      Prepare winning reveal
                    </button>
                    <button disabled={selected.bidReceived || busy || Boolean(action)} onClick={() => cancelListing(selected)} className="btn-danger disabled:opacity-55">
                      Cancel listing
                    </button>
                  </div>
                ) : selected.listingActive ? (
                  <div className="grid gap-3 border-t border-[rgb(var(--line))] pt-5">
                    <label className="field-label">Sealed offer</label>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div className="relative">
                        <input value={offerAmount} onChange={(event) => setOfferAmount(event.target.value)} placeholder="0.18" type="number" min="0" step="0.001" className="field pr-16" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[rgb(var(--muted))]">ETH</span>
                      </div>
                      <button disabled={busy || Boolean(action)} onClick={() => submitOffer(selected)} className="btn-primary disabled:opacity-55">
                        Place offer
                      </button>
                    </div>
                    <button disabled={!selected.revealPrepared || busy || Boolean(action)} onClick={() => finalizeSale(selected)} className="btn-secondary disabled:opacity-55">
                      Finalize if winning
                    </button>
                  </div>
                ) : null}

                <p className="min-h-6 text-sm font-semibold text-[rgb(var(--muted))]">{action || status?.label || ""}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
