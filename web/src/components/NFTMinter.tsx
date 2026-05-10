"use client";

import { useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useCoFHE } from "@/hooks/useCoFHE";
import {
  APP_CHAIN_ID,
  MARKETPLACE_ABI,
  MARKETPLACE_ADDRESS,
  MAX_ENCRYPTED_WEI,
  NFT_ABI,
  NFT_ADDRESS,
  hasContractConfig,
} from "@/lib/contracts";
import { buildTokenMetadata, uploadMetadata, type NftAttribute } from "@/lib/metadata";

type MintStep = "idle" | "metadata" | "mint" | "approve" | "encrypt" | "list" | "done";

const stepLabels: Record<MintStep, string> = {
  idle: "Ready",
  metadata: "Preparing metadata",
  mint: "Minting",
  approve: "Approving transfer",
  encrypt: "Encrypting reserve",
  list: "Listing",
  done: "Complete",
};

export function NFTMinter() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: APP_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();
  const { encryptUint64, encrypting, status } = useCoFHE();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [price, setPrice] = useState("");
  const [royaltyBps, setRoyaltyBps] = useState("500");
  const [autoList, setAutoList] = useState(true);
  const [attrs, setAttrs] = useState<NftAttribute[]>([{ trait_type: "Edition", value: "Genesis" }]);
  const [step, setStep] = useState<MintStep>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [lastTokenId, setLastTokenId] = useState<bigint | null>(null);

  const priceWei = useMemo(() => {
    try {
      return price ? parseEther(price) : 0n;
    } catch {
      return -1n;
    }
  }, [price]);

  const addAttr = () => setAttrs((current) => [...current, { trait_type: "", value: "" }]);
  const removeAttr = (index: number) => setAttrs((current) => current.filter((_, currentIndex) => currentIndex !== index));
  const updateAttr = (index: number, field: keyof NftAttribute, value: string) => {
    setAttrs((current) => current.map((attr, currentIndex) => (currentIndex === index ? { ...attr, [field]: value } : attr)));
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error("Connect a wallet first.");
      return;
    }

    if (!hasContractConfig) {
      toast.error("Contract addresses are missing.");
      return;
    }

    if (!publicClient) {
      toast.error("Sepolia RPC client is not ready.");
      return;
    }

    if (!name.trim() || !description.trim() || !imageUrl.trim() || !price.trim()) {
      toast.error("Fill in the required mint fields.");
      return;
    }

    if (priceWei <= 0n) {
      toast.error("Enter a valid reserve price.");
      return;
    }

    if (priceWei > MAX_ENCRYPTED_WEI) {
      toast.error("Encrypted uint64 prices support up to about 18.44 ETH.");
      return;
    }

    const royalty = Number.parseInt(royaltyBps, 10);
    if (!Number.isFinite(royalty) || royalty < 0 || royalty > 1000) {
      toast.error("Royalty must be between 0 and 1000 basis points.");
      return;
    }

    setSubmitting(true);
    setStep("metadata");

    try {
      const { metadata } = await buildTokenMetadata({
        name: name.trim(),
        description: description.trim(),
        image: imageUrl.trim(),
        attributes: attrs,
        privateNotes,
      });
      const uri = await uploadMetadata(metadata);

      const nextTokenId = (await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "nextTokenId",
      })) as bigint;

      setStep("mint");
      const mintHash = await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "mintWithRoyalty",
        args: [address, uri, address, BigInt(royalty)],
      });
      await publicClient.waitForTransactionReceipt({ hash: mintHash });
      setLastTokenId(nextTokenId);

      if (autoList) {
        setStep("approve");
        const approveHash = await writeContractAsync({
          address: NFT_ADDRESS,
          abi: NFT_ABI,
          functionName: "approve",
          args: [MARKETPLACE_ADDRESS, nextTokenId],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        setStep("encrypt");
        const encryptedReserve = await encryptUint64(priceWei);
        const contractReserve = { ...encryptedReserve, signature: encryptedReserve.signature as `0x${string}` };

        setStep("list");
        const listHash = await writeContractAsync({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: "listNFT",
          args: [nextTokenId, contractReserve],
        });
        await publicClient.waitForTransactionReceipt({ hash: listHash });
      }

      setStep("done");
      toast.success(autoList ? "NFT minted and listed with an encrypted reserve." : "NFT minted.");
      setName("");
      setDescription("");
      setImageUrl("");
      setPrivateNotes("");
      setPrice("");
      setAttrs([{ trait_type: "Edition", value: "Genesis" }]);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Mint flow failed.");
      setStep("idle");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="border-y border-[rgb(var(--line))] px-2 py-16 text-center">
        <h3 className="text-4xl text-[rgb(var(--ink))]">Connect wallet</h3>
        <div className="mt-6 flex justify-center">
          <ConnectButton showBalance={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="border-y border-[rgb(var(--line))] py-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-3xl text-[rgb(var(--ink))]">Details</h2>
          <span className="status-pill">{stepLabels[step]}</span>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="field-label">NFT name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Silent Atlas #42" className="field" />
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A private collectible with sealed market data."
              rows={4}
              className="field resize-none"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="field-label">Image URL</label>
              <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="field" />
            </div>
            <div>
              <label className="field-label">Reserve</label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0.15"
                  step="0.001"
                  min="0"
                  className="field pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[rgb(var(--muted))]">ETH</span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_180px]">
            <div>
              <label className="field-label">Private note</label>
              <input
                value={privateNotes}
                onChange={(event) => setPrivateNotes(event.target.value)}
                placeholder="Optional"
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Royalty bps</label>
              <input
                type="number"
                value={royaltyBps}
                onChange={(event) => setRoyaltyBps(event.target.value)}
                min="0"
                max="1000"
                step="25"
                className="field"
              />
            </div>
          </div>

          <div className="border-t border-[rgb(var(--line))] pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-2xl text-[rgb(var(--ink))]">Traits</h3>
              <button type="button" onClick={addAttr} className="btn-secondary min-h-0 px-3 py-2 text-sm">
                Add
              </button>
            </div>

            <div className="grid gap-3">
              {attrs.map((attr, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input value={attr.trait_type} onChange={(event) => updateAttr(index, "trait_type", event.target.value)} placeholder="Trait" className="field" />
                  <input value={attr.value} onChange={(event) => updateAttr(index, "value", event.target.value)} placeholder="Value" className="field" />
                  <button type="button" onClick={() => removeAttr(index)} className="btn-secondary min-h-0 px-3 py-2 text-sm">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 border-t border-[rgb(var(--line))] pt-5 text-sm font-bold text-[rgb(var(--ink))]">
            <input type="checkbox" checked={autoList} onChange={(event) => setAutoList(event.target.checked)} className="h-4 w-4 accent-[rgb(var(--teal))]" />
            List after mint
          </label>
        </div>
      </div>

      <aside className="border-y border-[rgb(var(--line))] py-6 lg:sticky lg:top-28 lg:self-start">
        <div className="space-y-4 text-sm font-semibold text-[rgb(var(--muted))]">
          <p>Status: <span className="text-[rgb(var(--ink))]">{status?.label || stepLabels[step]}</span></p>
          <p>Token: <span className="text-[rgb(var(--ink))]">{lastTokenId ? `#${lastTokenId.toString()}` : "pending"}</span></p>
          <p>Reserve: <span className="text-[rgb(var(--ink))]">{priceWei > 0n ? `${price} ETH` : "not set"}</span></p>
        </div>

        <button onClick={handleMint} disabled={submitting || encrypting} className="btn-primary mt-6 w-full disabled:translate-y-0 disabled:opacity-55">
          {submitting || encrypting ? stepLabels[step] : "Mint"}
        </button>
      </aside>
    </div>
  );
}
