import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const steps = [
  ["Create", "Mint the NFT with public preview metadata and an optional private commitment."],
  ["Encrypt", "Set the reserve as an encrypted euint64 input from the browser."],
  ["Offer", "Collectors submit sealed offers that stay private while the contract compares them."],
  ["Settle", "The winning buyer publishes threshold decrypt proofs and pays the verified amount."],
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
    </PageShell>
  );
}
