"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useNFT } from "@/hooks/useNFT";
import { useCoFHE } from "@/hooks/useCoFHE";
import { useWaitForTransactionReceipt } from "wagmi";

export function NFTMinter() {
  const { address, isConnected } = useAccount();
  const { mint } = useNFT();
  const { encryptMetadata, encrypting } = useCoFHE();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [attributes, setAttributes] = useState<{ trait_type: string; value: string }[]>([
    { trait_type: "", value: "" },
  ]);

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

  const handleMint = async () => {
    if (!name || !description || !imageUrl || !price) {
      toast.error("Please fill in all fields");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const metadata = {
      name,
      description,
      image: imageUrl,
      price: price,
      attributes: Object.fromEntries(
        attributes.filter((a) => a.trait_type && a.value).map((a) => [a.trait_type, a.value])
      ),
    };

    const encrypted = await encryptMetadata(metadata);

    const uri = `data:application/json,${encodeURIComponent(JSON.stringify({
      ...metadata,
      encrypted: !!encrypted,
    }))}`;

    if (address) {
      mint.write({ args: [address, uri] });
    }
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: mint.data,
  });

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h3 className="text-xl font-bold text-white mb-2 font-['Syne']">Connect Your Wallet</h3>
        <p className="text-slate-400">Connect your wallet to mint encrypted NFTs</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white font-['Syne']">Mint Encrypted NFT</h2>
          <p className="text-slate-400 text-sm">Your metadata will be encrypted on-chain</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">NFT Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cosmic Voyager #42"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A rare collectible from the encrypted metaverse..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/nft-image.png"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1">Supports IPFS, Arweave, or any public URL</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Listing Price (ETH)</label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.1"
              step="0.001"
              min="0"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">ETH</span>
          </div>
          <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Price will be encrypted with FHE
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Attributes (Optional)</label>
            <button
              onClick={addAttribute}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              + Add Attribute
            </button>
          </div>
          <div className="space-y-2">
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={attr.trait_type}
                  onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                  placeholder="Trait type"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50"
                />
                {attributes.length > 1 && (
                  <button
                    onClick={() => removeAttribute(index)}
                    className="px-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleMint}
            disabled={mint.isPending || encrypting || isConfirming}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {(mint.isPending || encrypting || isConfirming) ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {encrypting ? "Encrypting Metadata..." : isConfirming ? "Confirming..." : "Minting..."}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Mint Encrypted NFT
              </>
            )}
          </button>
        </div>

        {isSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              NFT Minted Successfully! Check the Marketplace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}