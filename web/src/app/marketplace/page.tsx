"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { NFTGrid } from "@/components/NFTGrid";
import { useStealthMarketplace } from "@/hooks/useStealthMarketplace";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "offers" | "listed">("listed");
  const { nfts, activeListings, isLoading, error, refresh } = useStealthMarketplace();

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
      <section className="pt-4">
        <div className="page-heading">
          <p className="eyebrow">Marketplace</p>
          <h1 className="page-title mt-4">Live listings</h1>
        </div>

        <div className="mt-8 grid gap-4 border-y border-[rgb(var(--line))] py-5 sm:grid-cols-3">
          <div className="metric-card">
            <p className="text-2xl font-black">{activeListings.length}</p>
            <p className="text-sm text-[rgb(var(--muted))]">listed</p>
          </div>
          <div className="metric-card">
            <p className="text-2xl font-black">{nfts.length}</p>
            <p className="text-sm text-[rgb(var(--muted))]">NFTs</p>
          </div>
          <div className="metric-card">
            <p className="text-2xl font-black">{totalOffers}</p>
            <p className="text-sm text-[rgb(var(--muted))]">offers</p>
          </div>
        </div>
      </section>

      <section className="my-8 flex flex-col gap-3 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="field border-transparent bg-[rgb(var(--paper))] lg:max-w-sm"
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="field min-w-[180px] cursor-pointer border-transparent bg-[rgb(var(--paper))]">
            <option value="listed">Listed</option>
            <option value="recent">Recent</option>
            <option value="offers">Offers</option>
          </select>
          <button onClick={() => void refresh()} className="btn-secondary whitespace-nowrap">
            {isLoading ? "Refreshing" : "Refresh"}
          </button>
          <Link href="/create" className="btn-primary whitespace-nowrap">
            Mint
          </Link>
        </div>
      </section>
      {error ? <p className="-mt-5 mb-6 text-sm font-semibold text-[rgb(var(--coral))]">{error}</p> : null}

      <section className="pb-10">
        {isLoading && nfts.length === 0 ? (
          <div className="muted-panel py-16 text-center">
            <h3 className="text-2xl font-black text-[rgb(var(--ink))]">Loading...</h3>
          </div>
        ) : (
          <NFTGrid nfts={filtered} onRefresh={refresh} />
        )}
      </section>
    </PageShell>
  );
}
