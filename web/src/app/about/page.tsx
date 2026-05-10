import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const operations = [
  { name: "FHE.asEuint64", body: "Converts signed encrypted SDK input into an encrypted reserve or offer handle." },
  { name: "FHE.gte", body: "Compares a sealed offer against the current encrypted winning offer." },
  { name: "FHE.select", body: "Updates the encrypted winner without revealing the losing path." },
  { name: "FHE.allowPublic", body: "Makes only the final winner and winning amount eligible for threshold decryption." },
  { name: "FHE.publishDecryptResult", body: "Verifies threshold signatures during buyer-paid settlement." },
];

const flow = [
  "Creator mints an ERC-721 with royalty data and privacy commitment metadata.",
  "Creator approves the marketplace and lists with an encrypted uint64 reserve.",
  "Collectors submit encrypted offers from the browser CoFHE SDK.",
  "Seller prepares the winning reveal after sealed offers arrive.",
  "Winning buyer finalizes with decryptForTx proofs and ETH payment.",
];

export default function AboutPage() {
  return (
    <PageShell>
      <section className="grid gap-6 pb-8 pt-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div>
          <span className="eyebrow">Protocol</span>
          <h1 className="section-title mt-5 max-w-4xl text-[rgb(var(--ink))]">
            The marketplace keeps bidding private until settlement needs a verifiable answer.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgb(var(--muted))]">
            StealthNFT follows the current Fhenix pattern: encrypted inputs, ACL-managed handles, public reveal permission, off-chain threshold decryption, and on-chain proof verification.
          </p>
        </div>

        <div className="panel privacy-band p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--teal))]">Docs used</p>
          <div className="mt-4 grid gap-3">
            <a className="btn-secondary" href="https://cofhe-docs.fhenix.zone/client-sdk/introduction/overview" target="_blank" rel="noreferrer">
              Client SDK
            </a>
            <a className="btn-secondary" href="https://cofhe-docs.fhenix.zone/fhe-library/examples/auction-example" target="_blank" rel="noreferrer">
              Auction pattern
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div>
          <span className="eyebrow">Settlement flow</span>
          <h2 className="mt-5 text-4xl text-[rgb(var(--ink))]">Five on-chain states, one buyer-visible action path.</h2>
        </div>

        <div className="panel p-5">
          <ol className="grid gap-3">
            {flow.map((item, index) => (
              <li key={item} className="grid gap-3 border-b border-[rgb(var(--line))] pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[56px_minmax(0,1fr)]">
                <span className="font-[family-name:var(--font-display)] text-3xl text-[rgb(var(--teal))]">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-base leading-7 text-[rgb(var(--muted))]">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">FHE calls</span>
            <h2 className="mt-5 text-4xl text-[rgb(var(--ink))]">Operations used by the contracts</h2>
          </div>
          <Link href="/marketplace" className="btn-primary">
            Open marketplace
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {operations.map((operation) => (
            <article key={operation.name} className="panel p-5">
              <code className="text-sm font-extrabold text-[rgb(var(--teal))]">{operation.name}</code>
              <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">{operation.body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
