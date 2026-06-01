/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatEther, getAddress, parseEther, zeroAddress } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useCoFHE } from "@/hooks/useCoFHE";
import { shortAddress, type MarketplaceNFT } from "@/hooks/useStealthMarketplace";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { APP_CHAIN_ID, BID_BOND_WEI, MARKETPLACE_ABI, MARKETPLACE_ADDRESS, MAX_ENCRYPTED_WEI } from "@/lib/contracts";

interface NFTGridProps {
  nfts: MarketplaceNFT[];
  onRefresh?: () => Promise<void> | void;
}

type RevealedSettlement = {
  buyer: `0x${string}`;
  offer: bigint;
};

export function NFTGrid({ nfts, onRefresh }: NFTGridProps) {
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [revealed, setRevealed] = useState<RevealedSettlement | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: APP_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();
  const { encryptUint64, decryptAddressForTx, decryptUint64ForTx, busy, status } = useCoFHE();
  const selected = useMemo(
    () => (selectedTokenId === null ? null : nfts.find((nft) => nft.tokenId === selectedTokenId) || null),
    [nfts, selectedTokenId]
  );

  const selectedIsSeller = useMemo(
    () => Boolean(selected && address && selected.seller.toLowerCase() === address.toLowerCase()),
    [address, selected]
  );

  const waitAndRefresh = async (hash: `0x${string}`, closeModal = false) => {
    if (!publicClient) {
      return;
    }

    await publicClient.waitForTransactionReceipt({ hash });
    await onRefresh?.();
    if (closeModal) {
      setSelectedTokenId(null);
    }
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

    if (nft.revealPrepared) {
      toast.error("The seller already prepared settlement reveal for this listing.");
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
      const bondTopUp = nft.myBidBond >= BID_BOND_WEI ? 0n : BID_BOND_WEI - nft.myBidBond;
      setAction("Submitting sealed offer");
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "submitSealedOffer",
        args: [BigInt(nft.tokenId), contractOffer],
        value: bondTopUp,
      });
      await waitAndRefresh(hash);
      toast.success(bondTopUp > 0n ? "Sealed offer submitted with refundable bid bond." : "Sealed offer submitted.");
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
      await waitAndRefresh(hash, true);
      toast.success("Listing cancelled.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Cancel failed.");
    } finally {
      setAction(null);
    }
  };

  const closeNoSale = async (nft: MarketplaceNFT) => {
    setAction("Checking revealed buyer");
    try {
      const buyerResult = await decryptAddressForTx(nft.pendingBuyerHandle);
      const buyer = getAddress(buyerResult.decryptedValue) as `0x${string}`;
      setRevealed({ buyer, offer: 0n });

      if (buyer.toLowerCase() !== zeroAddress) {
        toast.error(`A winning buyer exists: ${shortAddress(buyer)}.`);
        return;
      }

      setAction("Closing no-sale reveal");
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "closeNoSale",
        args: [BigInt(nft.tokenId), buyer, buyerResult.signature as `0x${string}`],
      });
      await waitAndRefresh(hash, true);
      toast.success("No-sale reveal closed and NFT returned.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "No-sale close failed.");
    } finally {
      setAction(null);
    }
  };

  const reclaimExpiredReveal = async (nft: MarketplaceNFT) => {
    setAction("Decrypting expired winner");
    try {
      const buyerResult = await decryptAddressForTx(nft.pendingBuyerHandle);
      const buyer = getAddress(buyerResult.decryptedValue) as `0x${string}`;
      setRevealed({ buyer, offer: 0n });

      if (buyer.toLowerCase() === zeroAddress) {
        toast.error("No winning buyer exists. Use the no-sale close action instead.");
        return;
      }

      setAction("Reclaiming expired reveal");
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "reclaimExpiredReveal",
        args: [BigInt(nft.tokenId), buyer, buyerResult.signature as `0x${string}`],
      });
      await waitAndRefresh(hash, true);
      toast.success("Expired reveal reclaimed, bond forfeited, and NFT returned.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Reclaim failed.");
    } finally {
      setAction(null);
    }
  };

  const withdrawBidBond = async (nft: MarketplaceNFT) => {
    setAction("Withdrawing bid bond");
    try {
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "withdrawBidBond",
        args: [BigInt(nft.tokenId)],
      });
      await waitAndRefresh(hash, true);
      toast.success("Bid bond withdrawn.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Bond withdrawal failed.");
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
      await waitAndRefresh(hash, true);
      toast.success("Sale finalized on-chain.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Settlement failed.");
    } finally {
      setAction(null);
    }
  };

  if (nfts.length === 0) {
    return (
      <div className="empty-state">
        <h3>No matching NFTs</h3>
        <p>Mint a token or adjust the marketplace filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {nfts.map((nft) => (
          <article key={nft.tokenId} className="group hero-media transition-transform duration-200 hover:-translate-y-1">
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => {
                setSelectedTokenId(nft.tokenId);
                setRevealed(null);
                setOfferAmount("");
              }}
            >
              <div className="relative aspect-square overflow-hidden border-b border-[var(--color-rule)] bg-[var(--color-paper-soft)]">
                <img src={nft.image} alt={nft.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <div className="absolute left-3 top-3">
                  <span className="status-pill bg-[var(--color-surface)]" data-tone={listingTone(nft)}>
                    {listingLabel(nft)}
                  </span>
                </div>
              </div>
              <div className="grid gap-4 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl">{nft.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">{nft.description}</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-[var(--color-action)]">{nft.displayPrice}</p>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm text-[var(--color-muted)]">
                  <span>#{nft.tokenId}</span>
                  <span>{nft.bidCount} offers</span>
                </div>
              </div>
            </button>
          </article>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-backdrop)] p-3 backdrop-blur-sm" onClick={() => setSelectedTokenId(null)}>
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[var(--radius-md)] border border-[var(--color-rule)] bg-[var(--color-surface)] shadow-[var(--shadow-float)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid lg:grid-cols-[minmax(0,1fr)_25rem]">
              <div className="relative min-h-[20rem] bg-[var(--color-paper-soft)]">
                <img src={selected.image} alt={selected.name} className="h-full max-h-[45rem] w-full object-cover" />
                <button type="button" onClick={() => setSelectedTokenId(null)} className="btn-secondary absolute right-3 top-3 min-h-0 px-3 py-2">
                  Close
                </button>
              </div>

              <div className="flex flex-col gap-5 p-5">
                <div>
                  <span className="status-pill" data-tone={listingTone(selected)}>
                    {listingLabel(selected)}
                  </span>
                  <h2 className="mt-3 text-3xl">{selected.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{selected.description}</p>
                </div>

                <div className="summary-list">
                  <div className="summary-row">
                    <span>Price</span>
                    <strong>{selected.displayPrice}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Offers</span>
                    <strong>{selected.bidCount}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Seller</span>
                    <strong>{shortAddress(selected.seller)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Reveal</span>
                    <strong>{revealLabel(selected)}</strong>
                  </div>
                  {isConnected ? (
                    <div className="summary-row">
                      <span>Your bond</span>
                      <strong>{selected.myBidBond > 0n ? `${formatEther(selected.myBidBond)} ETH` : "none"}</strong>
                    </div>
                  ) : null}
                </div>

                {revealed ? (
                  <div className="muted-panel p-4">
                    <p className="text-sm leading-6 text-[var(--color-muted)]">
                      Buyer {shortAddress(revealed.buyer)}
                      {revealed.offer > 0n ? ` at ${formatEther(revealed.offer)} ETH` : ""}
                    </p>
                  </div>
                ) : null}

                {!isConnected ? (
                  <div className="border-t border-[var(--color-rule)] pt-5">
                    <WalletConnectButton />
                  </div>
                ) : selectedIsSeller ? (
                  <div className="grid gap-3 border-t border-[var(--color-rule)] pt-5">
                    <button
                      disabled={!selected.listingActive || !selected.bidReceived || selected.revealPrepared || busy || Boolean(action)}
                      onClick={() => prepareReveal(selected)}
                      className="btn-primary"
                    >
                      Prepare winning reveal
                    </button>
                    <button disabled={!selected.listingActive || !selected.revealPrepared || busy || Boolean(action)} onClick={() => closeNoSale(selected)} className="btn-secondary">
                      Close if no winner
                    </button>
                    <button disabled={!selected.listingActive || !selected.settlementExpired || busy || Boolean(action)} onClick={() => reclaimExpiredReveal(selected)} className="btn-danger">
                      Reclaim expired reveal
                    </button>
                    <button disabled={!selected.listingActive || selected.bidReceived || busy || Boolean(action)} onClick={() => cancelListing(selected)} className="btn-danger">
                      Cancel listing
                    </button>
                    {selected.revealPrepared && selected.settlementDeadline > 0n ? (
                      <p className="text-xs font-semibold text-[var(--color-muted)]">
                        Settlement deadline: {new Date(Number(selected.settlementDeadline) * 1000).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                ) : selected.listingActive ? (
                  <div className="grid gap-3 border-t border-[var(--color-rule)] pt-5">
                    <label className="field-label" htmlFor="sealed-offer">
                      Sealed offer
                    </label>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div className="relative">
                        <input
                          id="sealed-offer"
                          value={offerAmount}
                          onChange={(event) => setOfferAmount(event.target.value)}
                          placeholder="0.18"
                          type="number"
                          min="0"
                          step="0.001"
                          className="field pr-16"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[var(--color-muted)]">ETH</span>
                      </div>
                      <button disabled={selected.revealPrepared || busy || Boolean(action)} onClick={() => submitOffer(selected)} className="btn-primary">
                        Place offer
                      </button>
                    </div>
                    <button disabled={!selected.revealPrepared || busy || Boolean(action)} onClick={() => finalizeSale(selected)} className="btn-secondary">
                      Finalize if winning
                    </button>
                    <p className="text-xs font-semibold text-[var(--color-muted)]">
                      A {formatEther(BID_BOND_WEI)} ETH bid bond is sent only if your wallet has no active bond on this listing.
                    </p>
                  </div>
                ) : selected.myBidBond > 0n ? (
                  <div className="grid gap-3 border-t border-[var(--color-rule)] pt-5">
                    <button disabled={selected.listingActive || busy || Boolean(action)} onClick={() => withdrawBidBond(selected)} className="btn-primary">
                      Withdraw bid bond
                    </button>
                  </div>
                ) : null}

                <p className="min-h-6 text-sm font-semibold text-[var(--color-muted)]">{action || status?.label || ""}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function listingLabel(nft: MarketplaceNFT) {
  if (nft.listingActive) {
    if (nft.settlementExpired) return "Expired";
    if (nft.revealPrepared) return "Reveal ready";
    return "Listed";
  }
  if (nft.revealedPrice > 0n) return "Settled";
  if (nft.revealPrepared && nft.bidReceived) return "Closed";
  return "Owned";
}

function listingTone(nft: MarketplaceNFT) {
  if (nft.listingActive) {
    if (nft.settlementExpired) return "danger";
    if (nft.revealPrepared) return "warning";
    return "action";
  }
  if (nft.revealedPrice > 0n) return "success";
  return undefined;
}

function revealLabel(nft: MarketplaceNFT) {
  if (nft.listingActive) {
    if (nft.settlementExpired) return "Expired";
    return nft.revealPrepared ? "Ready" : "Sealed";
  }

  if (nft.revealedPrice > 0n) return "Settled";
  if (nft.revealPrepared && nft.bidReceived) return "Closed";
  return "Inactive";
}
