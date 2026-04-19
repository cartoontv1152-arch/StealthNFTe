"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { NFTGrid } from "@/components/NFTGrid";
import Link from "next/link";

const DEMO_NFTS = [
  {
    tokenId: 1,
    name: "Cosmic Voyager #42",
    description: "A rare traveler from the encrypted metaverse, exploring dimensions beyond human comprehension.",
    image: "https://picsum.photos/seed/nft1/400/400",
    price: "0.15 ETH",
    seller: "0x1234...5678",
    encrypted: true,
  },
  {
    tokenId: 2,
    name: "Digital Genesis",
    description: "The first of its kind — a genesis piece from the encrypted realm of digital art.",
    image: "https://picsum.photos/seed/nft2/400/400",
    price: "0.25 ETH",
    seller: "0xabcd...ef01",
    encrypted: true,
  },
  {
    tokenId: 3,
    name: "Neon Dreams",
    description: "Vibrant colors painted in encrypted silence, a masterpiece of the cyber age.",
    image: "https://picsum.photos/seed/nft3/400/400",
    price: "0.08 ETH",
    seller: "0x9876...5432",
    encrypted: true,
  },
  {
    tokenId: 4,
    name: "Quantum Collector",
    description: "Limited edition, maximum privacy — the ultimate prize for the discerning collector.",
    image: "https://picsum.photos/seed/nft4/400/400",
    price: "0.32 ETH",
    seller: "0xfedc...ba98",
    encrypted: true,
  },
  {
    tokenId: 5,
    name: "Cyber Punk Elite",
    description: "From the depths of encrypted space, a rare elite avatar for the digital frontier.",
    image: "https://picsum.photos/seed/nft5/400/400",
    price: "0.18 ETH",
    seller: "0x2468...ace0",
    encrypted: true,
  },
  {
    tokenId: 6,
    name: "Abstract Realm",
    description: "Art that speaks in encrypted whispers, a visual symphony of hidden meaning.",
    image: "https://picsum.photos/seed/nft6/400/400",
    price: "0.12 ETH",
    seller: "0x1357...bdff",
    encrypted: true,
  },
];

const FILTER_TAGS = [
  { label: "All Listings", value: "all" },
  { label: "Recently Listed", value: "recent" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
];

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredNFTs = DEMO_NFTS.filter((nft) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!nft.name.toLowerCase().includes(query) && !nft.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price);
    return b.tokenId - a.tokenId;
  });

  const handleClearSearch = () => setSearchQuery("");

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-16 relative">
      <Navigation />

      <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Syne']">
            <span className="gradient-text">Encrypted</span> Marketplace
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Browse and trade NFTs with fully encrypted metadata and prices.
            Your privacy is protected by FHE.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="relative w-full lg:w-auto flex-1 max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <label htmlFor="search-nfts" className="sr-only">Search NFTs</label>
            <input
              id="search-nfts"
              type="text"
              placeholder="Search encrypted NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <label htmlFor="sort-select" className="sr-only">Sort by</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer appearance-none"
              >
                <option value="recent">Most Recent</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <Link
              href="/create"
              className="px-5 py-2.5 rounded-xl gradient-btn text-white font-semibold text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Mint NFT
            </Link>
          </div>
        </div>

        <div className="mb-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => {
                  setActiveFilter(tag.value);
                  if (tag.value !== "all") setSortBy(tag.value as "recent" | "price-low" | "price-high");
                  else setSortBy("recent");
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === tag.value
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm flex-wrap ml-auto">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
              <span className="text-slate-400">
                <span className="font-semibold text-white">{DEMO_NFTS.length}</span> Active Listings
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" aria-hidden="true" />
            <div className="flex items-center gap-2 text-cyan-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>All prices encrypted</span>
            </div>
          </div>
        </div>

        <NFTGrid nfts={filteredNFTs} />

        <div className="mt-16 glass-card rounded-2xl p-10 text-center">
          <h3 className="text-xl font-bold text-white mb-3 font-['Syne']">Want to sell your NFTs?</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            List your encrypted NFTs on the marketplace and reach buyers who value privacy.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/5 transition-colors text-white font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create &amp; List NFT
          </Link>
        </div>
      </div>
    </main>
  );
}
