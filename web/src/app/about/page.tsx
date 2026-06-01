import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const steps = [
  ["Create", "Mint the NFT with public preview metadata and an optional private commitment."],
  ["Encrypt", "Set the reserve as an encrypted euint64 input from the browser."],
  ["Offer", "Collectors submit sealed offers that stay private while the contract compares them."],
  ["Settle", "The winning buyer publishes threshold decrypt proofs and pays the verified amount."],
];

const privacy = [
  ["Reserve price", "Encrypted before listing, so the seller's minimum price is not published during bidding."],
  ["Collector offers", "Submitted as encrypted values and compared in-contract without exposing losing bids."],
  ["Final result", "Only the winning buyer and winning offer are revealed for verifiable payment and transfer."],
];

const safeguards = [
  ["Bid bond", "Each bidder posts a small refundable bond to reduce spam and support recovery paths."],
  ["No-sale close", "Sellers can close a reveal when no encrypted offer meets the encrypted reserve."],
  ["Expired settlement", "If the winning buyer does not settle in time, the seller can reclaim the NFT."],
];

export default function AboutPage() {
  return (
    <PageShell>
      <section className="simple-page-hero">
        <p className="eyebrow">How it works</p>
        <h1 className="page-title">A private sale that still settles on-chain.</h1>
        <p className="section-copy">
          StealthNFT keeps the market simple for creators and collectors while CoFHE handles the confidential reserve, sealed
          offers, and final reveal proof.
        </p>
        <div className="hero-actions">
          <Link href="/marketplace" className="btn-primary">
            Open marketplace
          </Link>
          <Link href="/create" className="btn-secondary">
            Create listing
          </Link>
        </div>
      </section>

      <section className="step-band">
        {steps.map(([title, body]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="detail-section">
        <div>
          <p className="eyebrow">Privacy model</p>
          <h2>Confidential until the market needs proof.</h2>
        </div>
        <div className="feature-lines">
          {privacy.map(([title, body]) => (
            <article key={title} className="feature-line">
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-section detail-section-tight">
        <div>
          <p className="eyebrow">Recovery paths</p>
          <h2>Real marketplace states, not just a happy path.</h2>
        </div>
        <div className="feature-lines">
          {safeguards.map(([title, body]) => (
            <article key={title} className="feature-line">
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
