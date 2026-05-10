/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useStealthMarketplace } from "@/hooks/useStealthMarketplace";

export default function Home() {
  const { nfts, activeListings, isLoading } = useStealthMarketplace();
  const featured = nfts.find((nft) => nft.listingActive) || nfts[0];

  return (
    <PageShell>
      <section className="grid min-h-[calc(100vh-220px)] gap-10 pt-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="max-w-2xl">
          <p className="eyebrow">Live on Sepolia</p>
          <h1 className="section-title mt-5">Private NFT market</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[rgb(var(--muted))]">
            Mint, bid, reveal, settle. Prices stay sealed until the sale needs proof.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/marketplace" className="btn-primary">
              Open market
            </Link>
            <Link href="/create" className="btn-secondary">
              Mint NFT
            </Link>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-4">
            <div className="metric-card">
              <p className="text-2xl font-black">{activeListings.length}</p>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">listed</p>
            </div>
            <div className="metric-card">
              <p className="text-2xl font-black">{nfts.length}</p>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">NFTs</p>
            </div>
            <div className="metric-card">
              <p className="text-2xl font-black">{isLoading ? "..." : "FHE"}</p>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">mode</p>
            </div>
          </div>
        </div>

        <div className="hero-media">
          <div className="aspect-[4/5] sm:aspect-square">
            <img
              src={featured?.image || "https://picsum.photos/seed/stealth-featured/900/700"}
              alt={featured?.name || "StealthNFT featured artwork"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[rgb(var(--line))] p-4">
            <p className="truncate font-black">{featured?.name || "Featured mint"}</p>
            <p className="shrink-0 text-sm font-black text-[rgb(var(--teal))]">{featured?.displayPrice || "Sealed"}</p>
          </div>
        </div>
      </section>

      <section className="mt-14 border-y border-[rgb(var(--line))] py-6">
        <div className="grid gap-4 text-sm font-black uppercase tracking-[0.08em] text-[rgb(var(--muted))] sm:grid-cols-4">
          {["Mint", "List sealed", "Bid private", "Settle on-chain"].map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
