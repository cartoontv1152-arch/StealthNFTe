/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PageShell } from "@/components/PageShell";
import { useStealthMarketplace } from "@/hooks/useStealthMarketplace";

const privacyFlow = [
  { step: "Mint", body: "Public preview metadata is stored with a privacy commitment." },
  { step: "Encrypt", body: "The reserve is encrypted in-browser with the CoFHE SDK." },
  { step: "Bid", body: "Collectors submit sealed offers that the contract compares while encrypted." },
  { step: "Settle", body: "The winning buyer and amount are revealed only with threshold proofs." },
];

export default function Home() {
  const { nfts, activeListings, isLoading } = useStealthMarketplace();
  const featured = nfts.find((nft) => nft.listingActive) || nfts[0];

  return (
    <PageShell>
      <section className="grid gap-6 pb-10 pt-3 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
        <div className="animate-reveal">
          <span className="eyebrow">Wave 4 ready on Fhenix Sepolia</span>
          <h1 className="section-title mt-5 max-w-4xl text-[rgb(var(--ink))]">
            StealthNFT
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-[rgb(var(--muted))]">
            A confidential NFT marketplace for encrypted reserves, sealed offers, royalty-aware settlement, and selective disclosure.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
            <Link href="/marketplace" className="btn-primary">
              Open marketplace
            </Link>
            <Link href="/create" className="btn-secondary">
              Mint listing
            </Link>
          </div>
        </div>

        <div className="panel overflow-hidden animate-reveal [animation-delay:120ms]">
          <div className="aspect-[4/3] bg-[rgb(var(--surface))]">
            <img
              src={featured?.image || "https://picsum.photos/seed/stealth-featured/900/700"}
              alt={featured?.name || "StealthNFT featured artwork"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 border-t border-[rgb(var(--line))] text-center">
            <div className="p-4">
              <p className="text-2xl font-extrabold text-[rgb(var(--ink))]">{activeListings.length}</p>
              <p className="text-xs font-bold text-[rgb(var(--muted))]">Listed</p>
            </div>
            <div className="border-x border-[rgb(var(--line))] p-4">
              <p className="text-2xl font-extrabold text-[rgb(var(--ink))]">{nfts.length}</p>
              <p className="text-xs font-bold text-[rgb(var(--muted))]">NFTs</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-extrabold text-[rgb(var(--ink))]">{isLoading ? "..." : "FHE"}</p>
              <p className="text-xs font-bold text-[rgb(var(--muted))]">Mode</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-8 md:grid-cols-4">
        {privacyFlow.map((item) => (
          <article key={item.step} className="panel p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--teal))]">{item.step}</p>
            <p className="mt-3 text-base leading-7 text-[rgb(var(--muted))]">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div>
          <span className="eyebrow">Product surface</span>
          <h2 className="mt-5 text-4xl text-[rgb(var(--ink))]">Built around the actual privacy lifecycle.</h2>
          <p className="mt-4 text-base leading-7 text-[rgb(var(--muted))]">
            The app now exposes the full path from encrypted listing creation to seller reveal and buyer settlement.
          </p>
        </div>

        <div className="panel privacy-band p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-3xl font-extrabold text-[rgb(var(--ink))]">CoFHE SDK</p>
              <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">Browser encryption through signed encrypted inputs.</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[rgb(var(--ink))]">ERC-2981</p>
              <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">Creator royalties are honored during private settlement.</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[rgb(var(--ink))]">Reveal on win</p>
              <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">Only the encrypted winner and winning offer enter the decrypt flow.</p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
