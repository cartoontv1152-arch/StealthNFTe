"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { NFTGrid } from "@/components/NFTGrid";
import Link from "next/link";

const DEMO_NFTS = [
  {
    tokenId: 1,
    name: "Cosmic Voyager #42",
    description: "A rare traveler from the encrypted metaverse",
    image: "https://picsum.photos/seed/nft1/400/400",
    price: "0.15 ETH",
    seller: "0x1234...5678",
    encrypted: true,
  },
  {
    tokenId: 2,
    name: "Digital Genesis",
    description: "The first of its kind, encrypted forever",
    image: "https://picsum.photos/seed/nft2/400/400",
    price: "0.25 ETH",
    seller: "0xabcd...ef01",
    encrypted: true,
  },
  {
    tokenId: 3,
    name: "Neon Dreams",
    description: "Vibrant colors in encrypted silence",
    image: "https://picsum.photos/seed/nft3/400/400",
    price: "0.08 ETH",
    seller: "0x9876...5432",
    encrypted: true,
  },
  {
    tokenId: 4,
    name: "Quantum Collector",
    description: "Limited edition, maximum privacy",
    image: "https://picsum.photos/seed/nft4/400/400",
    price: "0.32 ETH",
    seller: "0xfedc...ba98",
    encrypted: true,
  },
  {
    tokenId: 5,
    name: "Cyber Punk Elite",
    description: "From the depths of encrypted space",
    image: "https://picsum.photos/seed/nft5/400/400",
    price: "0.18 ETH",
    seller: "0x2468...ace0",
    encrypted: true,
  },
  {
    tokenId: 6,
    name: "Abstract Realm",
    description: "Art that speaks in encrypted whispers",
    image: "https://picsum.photos/seed/nft6/400/400",
    price: "0.12 ETH",
    seller: "0x1357...bdff",
    encrypted: true,
  },
];

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high">("recent");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNFTs = DEMO_NFTS.filter((nft) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!nft.name.toLowerCase().includes(query) && !nft.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-low") {
      return parseFloat(a.price) - parseFloat(b.price);
    }
    if (sortBy === "price-high") {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    return b.tokenId - a.tokenId;
  });

  return (
    <main className="min-h-screen pt-24 pb-16 relative">
      <Navigation />

      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Syne']">
            <span className="gradient-text">Encrypted</span> Marketplace
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Browse and trade NFTs with fully encrypted metadata and prices.
            Your privacy is protected by FHE.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="relative w-full md:w-auto flex-1 max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search encrypted NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
              <span className="text-slate-400 text-sm">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <Link
              href="/create"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Mint NFT
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Active Listings:</span>
            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
              {DEMO_NFTS.length} NFTs
            </span>
            <span className="ml-4 flex items-center gap-2 text-cyan-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              All prices encrypted
            </span>
          </div>
        </div>

        <NFTGrid nfts={filteredNFTs} />

        <div className="mt-16 glass rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2 font-['Syne']">Want to sell your NFTs?</h3>
          <p className="text-slate-400 mb-6">List your encrypted NFTs on the marketplace and reach buyers who value privacy.</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/5 transition-colors text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create & List NFT
          </Link>
        </div>
      </div>
    </main>
  );
}