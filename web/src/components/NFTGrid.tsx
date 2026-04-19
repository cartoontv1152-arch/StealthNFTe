"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { useCoFHE } from "@/hooks/useCoFHE";
import { useStealthMarketplace } from "@/hooks/useStealthMarketplace";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MARKETPLACE_ABI } from "@/lib/contracts";

interface NFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  price: string;
  seller: string;
  encrypted: boolean;
}

interface NFTGridProps {
  nfts: NFT[];
}

export function NFTGrid({ nfts }: NFTGridProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const { isConnected } = useAccount();
  const { MARKETPLACE_ADDRESS } = useStealthMarketplace();
  const { encryptValue, encrypting } = useCoFHE();
  const writeContract = useWriteContract();

  const handleBuy = async (nft: NFT) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    const priceInWei = BigInt(Math.ceil(parseFloat(nft.price) * 1e18));
    const encrypted = await encryptValue(priceInWei);

    if (encrypted && MARKETPLACE_ADDRESS) {
      writeContract.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "buyNFT",
        args: [BigInt(nft.tokenId), encrypted.ciphertext as `0x${string}`],
      });
      toast.success("Encrypted offer submitted! Waiting for seller to finalize...");
    }
  };

  if (nfts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
        <p className="text-slate-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div
            key={nft.tokenId}
            className="glass rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedNFT(nft)}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full glass text-xs font-medium text-cyan-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypted
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-2 truncate">{nft.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{nft.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Listing Price</p>
                  <p className="text-xl font-bold gradient-text">{nft.price}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuy(nft);
                  }}
                  disabled={encrypting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {encrypting ? "Encrypting..." : "Buy Now"}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>Token #{nft.tokenId}</span>
                <span>Seller: {nft.seller}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedNFT && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedNFT(null)}
        >
          <div
            className="glass-strong rounded-3xl max-w-lg w-full p-8 relative animate-reveal-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNFT(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative rounded-2xl overflow-hidden mb-6">
              <img
                src={selectedNFT.image}
                alt={selectedNFT.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/80 text-white text-xs font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  FHE Encrypted
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 font-['Syne']">{selectedNFT.name}</h2>
            <p className="text-slate-400 mb-6">{selectedNFT.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Price (Encrypted)</p>
                <p className="text-xl font-bold gradient-text">{selectedNFT.price}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Token ID</p>
                <p className="text-lg font-semibold text-white">#{selectedNFT.tokenId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 text-sm text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Price is encrypted on-chain. Seller must reveal to complete sale.
            </div>

            <div className="flex gap-4">
              {!isConnected ? (
                <div className="flex-1"><ConnectButton /></div>
              ) : (
                <button
                  onClick={() => handleBuy(selectedNFT)}
                  disabled={encrypting}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {encrypting ? "Encrypting Offer..." : "Place Encrypted Offer"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}