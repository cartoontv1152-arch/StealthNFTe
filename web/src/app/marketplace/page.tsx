"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { NFTGrid } from "@/components/NFTGrid";
import { shortAddress, useStealthMarketplace } from "@/hooks/useStealthMarketplace";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "offers" | "listed">("listed");
  const { nfts, activeListings, isLoading, error, refresh, hasContractConfig, MARKETPLACE_ADDRESS } = useStealthMarketplace();

  const filtered = useMemo(() => {
    return nfts
      .filter((nft) => {
        const query = search.toLowerCase();
        return (
          nft.name.toLowerCase().includes(query) ||
          nft.description.toLowerCase().includes(query) ||
          nft.tokenId.toString().includes(query)
        );
      })
      .sort((a, b) => {
        if (sort === "offers") return b.bidCount - a.bidCount;
        if (sort === "listed") return Number(b.listingActive) - Number(a.listingActive) || b.tokenId - a.tokenId;
        return b.tokenId - a.tokenId;
      });
  }, [nfts, search, sort]);

  const totalOffers = nfts.reduce((sum, nft) => sum + nft.bidCount, 0);

  return (
    <PageShell>
      <section className="grid gap-6 pb-8 pt-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div>
          <span className="eyebrow">On-chain marketplace</span>
          <h1 className="section-title mt-5 max-w-4xl text-[rgb(var(--ink))]">
            Browse live confidential listings with sealed offers and reveal-ready settlement.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgb(var(--muted))]">
            Listings are indexed from the deployed NFT and marketplace contracts. Offer values stay encrypted until the seller prepares the winning reveal.
          </p>
        </div>

        <div className="panel p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--teal))]">Contract</p>
          <p className="mt-3 text-2xl text-[rgb(var(--ink))]">{shortAddress(MARKETPLACE_ADDRESS)}</p>
          <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
            {hasContractConfig ? "Sepolia contract configuration is loaded." : "Add deployed addresses to use the live marketplace."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 pb-6 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-3xl font-extrabold text-[rgb(var(--ink))]">{activeListings.length}</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">active listings</p>
        </div>
        <div className="metric-card">
          <p className="text-3xl font-extrabold text-[rgb(var(--ink))]">{nfts.length}</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">indexed NFTs</p>
        </div>
        <div className="metric-card">
          <p className="text-3xl font-extrabold text-[rgb(var(--ink))]">{totalOffers}</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">sealed offers submitted</p>
        </div>
      </section>

      <section className="panel mb-6 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search name, description, or token id"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="field min-w-[210px] cursor-pointer">
              <option value="listed">Listed first</option>
              <option value="recent">Most recent</option>
              <option value="offers">Most offers</option>
            </select>
            <button onClick={() => void refresh()} className="btn-secondary whitespace-nowrap">
              {isLoading ? "Refreshing" : "Refresh"}
            </button>
            <Link href="/create" className="btn-primary whitespace-nowrap">
              Mint NFT
            </Link>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-[rgb(var(--coral))]">{error}</p> : null}
      </section>

      <section className="pb-10">
        {isLoading && nfts.length === 0 ? (
          <div className="panel px-6 py-14 text-center">
            <h3 className="text-3xl text-[rgb(var(--ink))]">Loading on-chain listings...</h3>
          </div>
        ) : (
          <NFTGrid nfts={filtered} onRefresh={refresh} />
        )}
      </section>
    </PageShell>
  );
}
