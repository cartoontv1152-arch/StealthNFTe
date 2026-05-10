/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PageShell } from "@/components/PageShell";
import { useStealthMarketplace } from "@/hooks/useStealthMarketplace";

export default function Home() {
  const { nfts, activeListings, isLoading } = useStealthMarketplace();
  const featured = nfts.find((nft) => nft.listingActive) || nfts[0];

  return (
    <PageShell>
      <section className="grid gap-10 pt-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
        <div>
          <p className="eyebrow">Live on Sepolia</p>
          <h1 className="section-title mt-6 max-w-4xl">Private NFT market.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[rgb(var(--muted))]">
            Mint, bid, reveal, settle. Prices stay sealed until the sale needs proof.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/marketplace" className="btn-primary">
              Open market
            </Link>
            <Link href="/create" className="btn-secondary">
              Mint NFT
            </Link>
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>

          <div className="mt-12 grid max-w-md grid-cols-3 gap-6">
            <div className="metric-card">
              <p className="text-3xl font-extrabold">{activeListings.length}</p>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">listed</p>
            </div>
            <div className="metric-card">
              <p className="text-3xl font-extrabold">{nfts.length}</p>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">NFTs</p>
            </div>
            <div className="metric-card">
              <p className="text-3xl font-extrabold">{isLoading ? "..." : "FHE"}</p>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">mode</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))]">
          <div className="aspect-square">
            <img
              src={featured?.image || "https://picsum.photos/seed/stealth-featured/900/700"}
              alt={featured?.name || "StealthNFT featured artwork"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between border-t border-[rgb(var(--line))] p-4">
            <p className="font-extrabold">{featured?.name || "Featured mint"}</p>
            <p className="text-sm font-bold text-[rgb(var(--muted))]">{featured?.displayPrice || "Sealed"}</p>
          </div>
        </div>
      </section>

      <section className="mt-16 border-y border-[rgb(var(--line))] py-8">
        <div className="grid gap-6 text-sm font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--muted))] sm:grid-cols-4">
          <p>Mint</p>
          <p>List sealed</p>
          <p>Bid private</p>
          <p>Settle on-chain</p>
        </div>
      </section>
    </PageShell>
  );
}
