"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseEther, parseEventLogs, zeroAddress, type Log } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useCoFHE } from "@/hooks/useCoFHE";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import {
  APP_CHAIN_ID,
  MARKETPLACE_ABI,
  MARKETPLACE_ADDRESS,
  MAX_ENCRYPTED_WEI,
  NFT_ABI,
  NFT_ADDRESS,
  hasContractConfig,
} from "@/lib/contracts";
import { buildTokenMetadata, resolveAssetUrl, uploadMediaFile, uploadMetadata, type NftAttribute } from "@/lib/metadata";

type MintStep = "idle" | "metadata" | "mint" | "approve" | "encrypt" | "list" | "done";
type MediaStorage = "idle" | "ipfs";

const stepLabels: Record<MintStep, string> = {
  idle: "Ready",
  metadata: "Preparing metadata",
  mint: "Minting",
  approve: "Approving transfer",
  encrypt: "Encrypting reserve",
  list: "Listing",
  done: "Complete",
};

const flowSteps: MintStep[] = ["metadata", "mint", "approve", "encrypt", "list"];

export function NFTMinter() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: APP_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();
  const { encryptUint64, encrypting, status } = useCoFHE();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mediaStorage, setMediaStorage] = useState<MediaStorage>("idle");
  const [uploadingMedia, setUploadingMedia] = useState(false);
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

  const previewUrl = imageUrl ? resolveAssetUrl(imageUrl) : "";

  const addAttr = () => setAttrs((current) => [...current, { trait_type: "", value: "" }]);
  const removeAttr = (index: number) => setAttrs((current) => current.filter((_, currentIndex) => currentIndex !== index));
  const updateAttr = (index: number, field: keyof NftAttribute, value: string) => {
    setAttrs((current) => current.map((attr, currentIndex) => (currentIndex === index ? { ...attr, [field]: value } : attr)));
  };

  const handleMediaFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setUploadingMedia(true);
    try {
      const uploaded = await uploadMediaFile(file);
      setImageUrl(uploaded.uri);
      setMediaStorage(uploaded.storage);
      toast.success("Artwork pinned to IPFS.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Media upload failed.");
    } finally {
      setUploadingMedia(false);
    }
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

    if (!name.trim() || !description.trim() || !imageUrl.trim() || (autoList && !price.trim())) {
      toast.error(autoList ? "Upload artwork, fill in the mint fields, and set a reserve." : "Upload artwork and fill in the mint fields.");
      return;
    }

    if (autoList && priceWei <= 0n) {
      toast.error("Enter a valid reserve price.");
      return;
    }

    if (autoList && priceWei > MAX_ENCRYPTED_WEI) {
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

      setStep("mint");
      const mintHash = await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "mintWithRoyalty",
        args: [address, uri, address, BigInt(royalty)],
      });
      const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintHash });
      const mintedTokenId = readMintedTokenId(mintReceipt.logs, address);
      setLastTokenId(mintedTokenId);

      if (autoList) {
        setStep("approve");
        const approveHash = await writeContractAsync({
          address: NFT_ADDRESS,
          abi: NFT_ABI,
          functionName: "approve",
          args: [MARKETPLACE_ADDRESS, mintedTokenId],
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
          args: [mintedTokenId, contractReserve],
        });
        await publicClient.waitForTransactionReceipt({ hash: listHash });
      }

      setStep("done");
      toast.success(autoList ? "NFT minted and listed with an encrypted reserve." : "NFT minted.");
      setName("");
      setDescription("");
      setImageUrl("");
      setMediaStorage("idle");
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
      <div className="panel px-5 py-14 text-center">
        <h3 className="text-3xl">Connect wallet</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">
          Mint, encrypt the reserve, and list on Sepolia from one production flow.
        </p>
        <div className="wallet-button-wrap mt-6 flex justify-center">
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="grid gap-6">
        <section className="panel p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Artwork</p>
              <h2 className="mt-2 text-3xl">Media and metadata</h2>
            </div>
            <span className="status-pill" data-tone={mediaStorage === "ipfs" ? "success" : undefined}>
              {mediaStorage === "idle" ? "Not uploaded" : mediaStorage}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <label className="dropzone">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploadingMedia || submitting}
                onChange={(event) => void handleMediaFile(event.target.files?.[0])}
              />
              <span>
                <strong className="block text-[var(--color-ink-strong)]">{uploadingMedia ? "Uploading artwork" : "Choose artwork"}</strong>
                <span className="mt-2 block text-sm leading-6 text-[var(--color-muted)]">
                  Upload an image to pin it through Pinata/IPFS before minting.
                </span>
              </span>
            </label>

            <div className="hero-media aspect-square bg-[var(--color-paper-soft)]">
              {previewUrl ? (
                <img src={previewUrl} alt={name || "NFT preview"} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center p-5 text-center text-sm font-bold text-[var(--color-muted)]">
                  Preview appears here
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="nft-name">
                  NFT name
                </label>
                <input id="nft-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Silent Atlas #42" className="field" />
              </div>

              <div>
                <label className="field-label" htmlFor="royalty">
                  Royalty bps
                </label>
                <input
                  id="royalty"
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

            <div>
              <label className="field-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A private collectible with sealed market data."
                rows={4}
                className="field resize-none"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_16rem]">
              <div>
                <label className="field-label" htmlFor="private-note">
                  Private note commitment
                </label>
                <input
                  id="private-note"
                  value={privateNotes}
                  onChange={(event) => setPrivateNotes(event.target.value)}
                  placeholder="Optional commitment seed"
                  className="field"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="reserve">
                  Reserve
                </label>
                <div className="relative">
                  <input
                    id="reserve"
                    type="number"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0.15"
                    step="0.001"
                    min="0"
                    className="field pr-16"
                    disabled={!autoList}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[var(--color-muted)]">ETH</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-rule)] pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-2xl">Traits</h3>
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

            <label className="flex items-center gap-3 border-t border-[var(--color-rule)] pt-5 text-sm font-bold text-[var(--color-ink)]">
              <input type="checkbox" checked={autoList} onChange={(event) => setAutoList(event.target.checked)} className="h-4 w-4 accent-[var(--color-action)]" />
              List after mint with encrypted reserve
            </label>
          </div>
        </section>
      </div>

      <aside className="panel p-5 xl:sticky xl:top-28 xl:self-start">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Progress</p>
            <h2 className="mt-2 text-2xl">Mint flow</h2>
          </div>
          <span className="status-pill" data-tone={step === "done" ? "success" : submitting ? "action" : undefined}>
            {stepLabels[step]}
          </span>
        </div>

        <div className="mt-6 grid gap-3">
          {flowSteps.map((flowStep) => (
            <div key={flowStep} className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-[var(--color-muted)]">{stepLabels[flowStep]}</span>
              <span className="status-pill" data-tone={step === flowStep ? "action" : step === "done" ? "success" : undefined}>
                {step === flowStep ? "Now" : step === "done" ? "Done" : "Next"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 table-list">
          <div className="table-row">
            <span>Status</span>
            <strong>{status?.label || stepLabels[step]}</strong>
          </div>
          <div className="table-row">
            <span>Token</span>
            <strong>{lastTokenId !== null ? `#${lastTokenId.toString()}` : "pending"}</strong>
          </div>
          <div className="table-row">
            <span>Reserve</span>
            <strong>{autoList ? (priceWei > 0n ? `${price} ETH` : "not set") : "mint only"}</strong>
          </div>
        </div>

        <button onClick={handleMint} disabled={submitting || encrypting || uploadingMedia} className="btn-primary mt-6 w-full">
          {submitting || encrypting ? stepLabels[step] : autoList ? "Mint and list" : "Mint NFT"}
        </button>
      </aside>
    </div>
  );
}

function readMintedTokenId(logs: readonly Log[], receiver: `0x${string}`) {
  const transferLogs = parseEventLogs({
    abi: NFT_ABI,
    logs: [...logs],
    eventName: "Transfer",
  });

  const mintLog = transferLogs.find(
    (log) =>
      log.address.toLowerCase() === NFT_ADDRESS.toLowerCase() &&
      log.args.from?.toLowerCase() === zeroAddress &&
      log.args.to?.toLowerCase() === receiver.toLowerCase()
  );

  if (typeof mintLog?.args.tokenId !== "bigint") {
    throw new Error("Mint succeeded, but the minted token id could not be confirmed from the transaction receipt.");
  }

  return mintLog.args.tokenId;
}
