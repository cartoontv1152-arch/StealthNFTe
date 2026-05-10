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
      <section className="flex flex-col gap-8 pt-4">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-none text-[rgb(var(--ink))] md:text-7xl">
            Live listings
          </h1>
        </div>

        <div className="grid gap-4 border-y border-[rgb(var(--line))] py-5 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-extrabold">{activeListings.length}</p>
            <p className="text-sm text-[rgb(var(--muted))]">listed</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold">{nfts.length}</p>
            <p className="text-sm text-[rgb(var(--muted))]">NFTs</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold">{totalOffers}</p>
            <p className="text-sm text-[rgb(var(--muted))]">offers</p>
          </div>
        </div>
      </section>

      <section className="my-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="field lg:max-w-sm"
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="field min-w-[180px] cursor-pointer">
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
        {error ? <p className="mt-3 text-sm font-semibold text-[rgb(var(--coral))]">{error}</p> : null}
      </section>

      <section className="pb-10">
        {isLoading && nfts.length === 0 ? (
          <div className="border-y border-[rgb(var(--line))] py-16 text-center">
            <h3 className="text-3xl text-[rgb(var(--ink))]">Loading...</h3>
          </div>
        ) : (
          <NFTGrid nfts={filtered} onRefresh={refresh} />
        )}
      </section>
    </PageShell>
  );
}
