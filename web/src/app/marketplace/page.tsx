"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MarketplaceActivityFeed } from "@/components/MarketplaceActivity";
import { NFTGrid } from "@/components/NFTGrid";
import { NotificationCenter } from "@/components/NotificationCenter";
import { PageShell } from "@/components/PageShell";
import { useStealthMarketplace } from "@/hooks/useStealthMarketplace";

type SortMode = "listed" | "recent" | "offers" | "deadline";
type StatusFilter = "all" | "listed" | "reveal" | "settled" | "mine";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("listed");
  const [status, setStatus] = useState<StatusFilter>("all");
  const { address, nfts, activeListings, activity, indexer, isLoading, error, refresh } = useStealthMarketplace();

  const totalOffers = nfts.reduce((sum, nft) => sum + nft.bidCount, 0);
  const revealReady = nfts.filter((nft) => nft.revealPrepared && nft.listingActive).length;
  const syncLabel =
    indexer.source === "event-index" ? "Event index" : indexer.source === "supply-fallback" ? "Supply index" : "Syncing";
  const checkedAtLabel = indexer.source === "empty" ? "Checking now" : new Date(indexer.checkedAt).toLocaleTimeString();

  const filtered = useMemo(() => {
    return nfts
      .filter((nft) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          query.length === 0 ||
          nft.name.toLowerCase().includes(query) ||
          nft.description.toLowerCase().includes(query) ||
          nft.tokenId.toString().includes(query);
        const matchesStatus =
          status === "all" ||
          (status === "listed" && nft.listingActive) ||
          (status === "reveal" && nft.revealPrepared) ||
          (status === "settled" && !nft.listingActive && nft.revealedPrice > 0n) ||
          (status === "mine" &&
            Boolean(
              address &&
                [nft.owner, nft.seller, nft.creator].some((value) => value && value.toLowerCase() === address.toLowerCase())
            ));

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "offers") return b.bidCount - a.bidCount;
        if (sort === "deadline") return Number(a.settlementDeadline || 0n) - Number(b.settlementDeadline || 0n);
        if (sort === "listed") return Number(b.listingActive) - Number(a.listingActive) || b.tokenId - a.tokenId;
        return b.tokenId - a.tokenId;
      });
  }, [address, nfts, search, sort, status]);

  return (
    <PageShell>
      <section className="market-hero">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1 className="page-title">Sealed listings.</h1>
          <p className="section-copy">
            Browse encrypted-reserve NFTs, place sealed offers, and finalize reveal-ready sales from one clean workspace.
          </p>
        </div>
        <div className="market-sync">
          <span>{syncLabel}</span>
          <strong>{indexer.totalIndexedTokens} NFTs</strong>
          <small>{checkedAtLabel}</small>
        </div>
      </section>

      <section className="home-metrics market-metrics" aria-label="Marketplace summary">
        <Metric value={activeListings.length.toString()} label="listed" />
        <Metric value={nfts.length.toString()} label="indexed" />
        <Metric value={totalOffers.toString()} label="offers" />
        <Metric value={revealReady.toString()} label="ready" />
      </section>

      <section className="market-toolbar">
        <input
          type="text"
          placeholder="Search name, description, or token id"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="field"
        />
        <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="field cursor-pointer">
          <option value="listed">Listed first</option>
          <option value="recent">Recent</option>
          <option value="offers">Most offers</option>
          <option value="deadline">Deadline</option>
        </select>
        <button onClick={() => void refresh()} className="btn-secondary">
          {isLoading ? "Refreshing" : "Refresh"}
        </button>
        <Link href="/create" className="btn-primary">
          Create
        </Link>
      </section>

      <section className="filter-row" aria-label="Marketplace filters">
        {[
          ["all", "All"],
          ["listed", "Listed"],
          ["reveal", "Reveal ready"],
          ["settled", "Settled"],
          ["mine", "Mine"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value as StatusFilter)}
            className={status === value ? "btn-primary" : "btn-secondary"}
          >
            {label}
          </button>
        ))}
      </section>

      {error || indexer.warning ? (
        <p className="market-warning">{error || indexer.warning}</p>
      ) : null}

      <NotificationCenter nfts={nfts} address={address} />

      <section className="market-content">
        {isLoading && nfts.length === 0 ? (
          <div className="empty-state">
            <h3>Loading marketplace</h3>
            <p>Reading on-chain token and listing state.</p>
          </div>
        ) : (
          <NFTGrid nfts={filtered} onRefresh={refresh} />
        )}
      </section>

      <MarketplaceActivityFeed activity={activity} />
    </PageShell>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="home-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
