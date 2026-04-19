"use client";

import { useState, useEffect, useRef } from "react";
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
  loading?: boolean;
}

function NFTCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 skeleton rounded-lg" />
        <div className="h-4 w-full skeleton rounded-lg" />
        <div className="h-4 w-2/3 skeleton rounded-lg" />
        <div className="pt-3 flex justify-between">
          <div className="h-8 w-24 skeleton rounded-xl" />
          <div className="h-10 w-24 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function NFTCard({ nft, onClick, onBuy, encrypting }: {
  nft: NFT;
  onClick: () => void;
  onBuy: () => void;
  encrypting: boolean;
}) {
  return (
    <div
      className="glass-card rounded-2xl overflow-hidden group cursor-pointer card-glow"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${nft.name} details`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full glass text-xs font-medium text-cyan-400 flex items-center gap-1.5">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encrypted
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-white truncate flex-1">{nft.name}</h3>
          <span className="text-xs text-slate-500 font-mono flex-shrink-0">#{nft.tokenId}</span>
        </div>
        <p className="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">{nft.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Listing Price</p>
            <p className="text-lg font-bold gradient-text flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {nft.price}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuy();
            }}
            disabled={encrypting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200 flex items-center gap-2"
          >
            {encrypting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="hidden sm:inline">Encrypting...</span>
              </>
            ) : "Buy Now"}
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span>Token #{nft.tokenId}</span>
          <span>Seller: {nft.seller}</span>
        </div>
      </div>
    </div>
  );
}

export function NFTGrid({ nfts, loading }: NFTGridProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const { isConnected } = useAccount();
  const { MARKETPLACE_ADDRESS } = useStealthMarketplace();
  const { encryptValue, encrypting } = useCoFHE();
  const writeContract = useWriteContract();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleBuy = async (nft: NFT) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to buy NFTs");
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

  const closeModal = () => setSelectedNFT(null);

  useEffect(() => {
    if (selectedNFT) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [selectedNFT]);

  useEffect(() => {
    if (selectedNFT && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", handleTab);
      return () => document.removeEventListener("keydown", handleTab);
    }
  }, [selectedNFT]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-24 glass-card rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-['Syne']">No NFTs Found</h3>
        <p className="text-slate-400 mb-6">Try adjusting your search or check back later</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.tokenId}
            nft={nft}
            onClick={() => setSelectedNFT(nft)}
            onBuy={() => handleBuy(nft)}
            encrypting={encrypting}
          />
        ))}
      </div>

      {selectedNFT && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="nft-modal-title"
        >
          <div
            ref={modalRef}
            className="glass-modal rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedNFT.image}
                alt={selectedNFT.name}
                className="w-full aspect-square object-cover rounded-t-3xl"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/90 text-white text-xs font-medium flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  FHE Encrypted
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 id="nft-modal-title" className="text-2xl font-bold text-white font-['Syne']">{selectedNFT.name}</h2>
                <button
                  ref={closeButtonRef}
                  onClick={closeModal}
                  aria-label="Close modal"
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-slate-400 mb-6 leading-relaxed">{selectedNFT.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Price (Encrypted)</p>
                  <p className="text-xl font-bold gradient-text flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                    {selectedNFT.price}
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Token ID</p>
                  <p className="text-lg font-semibold text-white">#{selectedNFT.tokenId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl glass text-sm text-slate-400 mb-6">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p>Price is encrypted on-chain. Seller must reveal to complete sale.</p>
              </div>

              <div className="flex gap-3">
                {!isConnected ? (
                  <div className="flex-1"><ConnectButton /></div>
                ) : (
                  <button
                    onClick={() => {
                      handleBuy(selectedNFT);
                    }}
                    disabled={encrypting}
                    className="flex-1 py-4 rounded-xl gradient-btn text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {encrypting ? "Encrypting Offer..." : "Place Encrypted Offer"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
