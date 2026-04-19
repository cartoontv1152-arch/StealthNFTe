"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { useNFT } from "@/hooks/useNFT";
import { useCoFHE } from "@/hooks/useCoFHE";
import { NFT_ABI } from "@/lib/contracts";

const PRICE_ESTIMATES = {
  ethToUsd: 3500,
};

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex items-center">
      <svg
        className="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors cursor-help"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg glass text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 glass" />
      </div>
    </div>
  );
}

export function NFTMinter() {
  const { address, isConnected } = useAccount();
  const { mint } = useNFT();
  const { encryptMetadata, encrypting } = useCoFHE();
  const writeContract = useWriteContract();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [attributes, setAttributes] = useState<{ trait_type: string; value: string }[]>([
    { trait_type: "", value: "" },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: mint.data,
  });

  const isProcessing = mint.isPending || encrypting || isConfirming;

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "NFT name is required";
        if (value.length > 50) return "Name must be 50 characters or less";
        return "";
      case "description":
        if (!value.trim()) return "Description is required";
        if (value.length > 500) return "Description must be 500 characters or less";
        return "";
      case "imageUrl":
        if (!value.trim()) return "Image URL is required";
        try {
          new URL(value);
        } catch {
          return "Please enter a valid URL";
        }
        return "";
      case "price":
        if (!value.trim()) return "Price is required";
        const priceNum = parseFloat(value);
        if (isNaN(priceNum) || priceNum <= 0) return "Price must be greater than 0";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors: Record<string, string> = {};
    const values: Record<string, string> = { name, description, imageUrl, price };
    const error = validateField(field, values[field] || "");
    if (error) fieldErrors[field] = error;
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    const fields = { name, description, imageUrl, price };
    for (const [key, value] of Object.entries(fields)) {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    }
    setErrors(newErrors);
    setTouched({ name: true, description: true, imageUrl: true, price: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleMint = async () => {
    if (!validateAll()) {
      toast.error("Please fix the errors before minting");
      return;
    }

    const priceNum = parseFloat(price);
    const metadata = {
      name: name.trim(),
      description: description.trim(),
      image: imageUrl.trim(),
      price: price.trim(),
      attributes: Object.fromEntries(
        attributes.filter((a) => a.trait_type.trim() && a.value.trim()).map((a) => [a.trait_type.trim(), a.value.trim()])
      ),
    };

    const encrypted = await encryptMetadata(metadata);

    const uri = `data:application/json,${encodeURIComponent(JSON.stringify({
      ...metadata,
      encrypted: !!encrypted,
    }))}`;

    if (address && process.env.NEXT_PUBLIC_NFT_ADDRESS) {
      writeContract.writeContract({
        address: process.env.NEXT_PUBLIC_NFT_ADDRESS as `0x${string}`,
        abi: NFT_ABI,
        functionName: "mint",
        args: [address, uri],
      });
      toast.success("NFT minting initiated! Confirm the transaction in your wallet.");
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: "trait_type" | "value", value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const priceUsd = price ? (parseFloat(price) * PRICE_ESTIMATES.ethToUsd).toFixed(2) : null;

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-500 focus:outline-none transition-colors ${
      touched[field] && errors[field]
        ? "border-red-500/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
        : "border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
    }`;

  if (!isConnected) {
    return (
      <div className="glass-card rounded-2xl p-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 font-['Syne']">Connect Your Wallet</h3>
        <p className="text-slate-400 mb-6 max-w-sm mx-auto">Connect your wallet to mint encrypted NFTs on Fhenix</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white font-['Syne']">Mint Encrypted NFT</h2>
          <p className="text-slate-400 text-sm">Your metadata will be encrypted on-chain</p>
        </div>
      </div>

      <div className="space-y-7">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="nft-name" className="text-sm font-medium text-slate-300">
              NFT Name <span className="text-red-400">*</span>
            </label>
            <InfoTooltip text="The display name for your NFT" />
          </div>
          <input
            id="nft-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="Cosmic Voyager #42"
            maxLength={50}
            aria-invalid={touched.name && !!errors.name}
            aria-errormessage={errors.name}
            className={inputClass("name")}
          />
          <div className="flex justify-between mt-1.5">
            {touched.name && errors.name ? (
              <p className="text-xs text-red-400">{errors.name}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-slate-600">{name.length}/50</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="nft-description" className="text-sm font-medium text-slate-300">
              Description <span className="text-red-400">*</span>
            </label>
            <InfoTooltip text="Tell buyers about your NFT" />
          </div>
          <textarea
            id="nft-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => handleBlur("description")}
            placeholder="A rare collectible from the encrypted metaverse..."
            rows={3}
            maxLength={500}
            aria-invalid={touched.description && !!errors.description}
            aria-errormessage={errors.description}
            className={inputClass("description")}
          />
          <div className="flex justify-between mt-1.5">
            {touched.description && errors.description ? (
              <p className="text-xs text-red-400">{errors.description}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-slate-600">{description.length}/500</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="nft-image" className="text-sm font-medium text-slate-300">
              Image URL <span className="text-red-400">*</span>
            </label>
            <InfoTooltip text="Supports IPFS, Arweave, or any public URL" />
          </div>
          <input
            id="nft-image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onBlur={() => handleBlur("imageUrl")}
            placeholder="https://example.com/nft-image.png"
            aria-invalid={touched.imageUrl && !!errors.imageUrl}
            aria-errormessage={errors.imageUrl}
            className={inputClass("imageUrl")}
          />
          {touched.imageUrl && errors.imageUrl && (
            <p className="text-xs text-red-400 mt-1.5">{errors.imageUrl}</p>
          )}

          {imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
              <img
                src={imageUrl}
                alt="NFT preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="nft-price" className="text-sm font-medium text-slate-300">
              Listing Price <span className="text-red-400">*</span>
            </label>
            <InfoTooltip text="Price will be encrypted with FHE" />
          </div>
          <div className="relative">
            <input
              id="nft-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => handleBlur("price")}
              placeholder="0.1"
              step="0.001"
              min="0"
              aria-invalid={touched.price && !!errors.price}
              aria-errormessage={errors.price}
              className={inputClass("price")}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">ETH</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            {touched.price && errors.price ? (
              <p className="text-xs text-red-400">{errors.price}</p>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Price will be encrypted with FHE
              </span>
            )}
            {priceUsd && <span className="text-xs text-slate-500">≈ ${priceUsd} USD</span>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Attributes</label>
            <span className="text-xs text-slate-600">{attributes.filter(a => a.trait_type && a.value).length} traits</span>
          </div>
          <div className="space-y-2">
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={attr.trait_type}
                  onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                  placeholder="Trait type (e.g. Background)"
                  className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-purple-500/50"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, "value", e.target.value)}
                  placeholder="Value (e.g. Blue)"
                  className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-purple-500/50"
                />
                {attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                    aria-label="Remove attribute"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAttribute}
            className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Trait
          </button>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={handleMint}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl gradient-btn text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {isProcessing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {encrypting ? "Encrypting Metadata..." : isConfirming ? "Confirming Transaction..." : "Waiting for Wallet..."}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Mint Encrypted NFT
              </>
            )}
          </button>
        </div>

        {isSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-reveal-up">
            <p className="text-green-400 text-sm flex items-center gap-2 font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              NFT Minted Successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
