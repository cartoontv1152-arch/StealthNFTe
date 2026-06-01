/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useStealthMarketplace } from "@/hooks/useStealthMarketplace";

const featureLines = [
  ["Encrypted reserves", "Creators set reserve prices in the browser with CoFHE before escrow opens."],
  ["Sealed offers", "Collectors submit private bids; the contract compares encrypted values without exposing the losing path."],
  ["Verified settlement", "Only the winning buyer and offer are revealed with threshold signatures when the sale finalizes."],
];

const flow = ["Mint public preview", "Encrypt reserve", "Receive sealed offers", "Reveal winner", "Settle on-chain"];

export default function Home() {
  const { nfts, activeListings, activity, indexer, isLoading } = useStealthMarketplace();
  const featured = nfts.find((nft) => nft.listingActive) || nfts[0];
  const totalOffers = nfts.reduce((sum, nft) => sum + nft.bidCount, 0);
  const heroImage = featured?.image || "https://picsum.photos/seed/stealth-featured/1600/1100";
  const indexMode = isLoading || indexer.source === "empty" ? "Syncing" : indexer.source === "event-index" ? "Events" : "Supply";

  return (
    <PageShell>
      <section className="home-hero">
        <img src={heroImage} alt={featured?.name || "Private NFT marketplace artwork"} className="home-hero-image" />
        <div className="home-hero-scrim" />
        <div className="home-hero-content animate-reveal">
          <p className="eyebrow">Private NFT marketplace on Sepolia</p>
          <h1>Sell NFTs without exposing the auction.</h1>
          <p>
            StealthNFT gives creators a clean mint-to-market flow: encrypted reserves, sealed collector offers, and final
            settlement proofs written on-chain only when they are needed.
          </p>
          <div className="hero-actions">
            <Link href="/marketplace" className="btn-primary">
              Open marketplace
            </Link>
            <Link href="/create" className="btn-secondary">
              Create listing
            </Link>
          </div>
        </div>
      </section>

      <section className="home-metrics" aria-label="Marketplace status">
        <Metric value={activeListings.length.toString()} label="active listings" />
        <Metric value={nfts.length.toString()} label="NFTs indexed" />
        <Metric value={totalOffers.toString()} label="sealed offers" />
        <Metric value={indexMode} label="index mode" />
      </section>

      <section className="detail-section">
        <div>
          <p className="eyebrow">What it does</p>
          <h2>Private by default. Public only for settlement.</h2>
        </div>
        <div className="feature-lines">
          {featureLines.map(([title, body]) => (
            <article key={title} className="feature-line">
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section">
        <div>
          <p className="eyebrow">The sale path</p>
          <h2>One simple flow from creator to collector.</h2>
          <p>
            The app hides the cryptography behind normal marketplace actions while the contracts keep the sensitive values encrypted
            until the seller prepares the final reveal.
          </p>
        </div>
        <ol className="process-list">
          {flow.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="detail-section detail-section-tight">
        <div>
          <p className="eyebrow">Ready for Wave 5</p>
          <h2>Built as a working testnet product.</h2>
        </div>
        <div className="feature-lines">
          <article className="feature-line">
            <h3>Creator uploads</h3>
            <p>Media and metadata pin through Pinata/IPFS when configured, with a safe fallback for testnet demos.</p>
          </article>
          <article className="feature-line">
            <h3>Live indexing</h3>
            <p>Marketplace history reads from on-chain events, then falls back gracefully if a public RPC limits log ranges.</p>
          </article>
          <article className="feature-line">
            <h3>Action states</h3>
            <p>Reveal-ready listings, deadlines, no-sale closes, and expired reclaim paths surface only when they matter.</p>
          </article>
        </div>
      </section>

      {activity[0] ? (
        <section className="event-strip">
          <span>Latest event</span>
          <strong>Token #{activity[0].tokenId}</strong>
          <p>{activity[0].kind.replace(/([A-Z])/g, " $1").trim()}</p>
        </section>
      ) : null}
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
