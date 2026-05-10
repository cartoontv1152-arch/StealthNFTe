import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const points = ["Encrypted reserves", "Sealed offers", "Seller reveal", "Buyer settlement"];

export default function AboutPage() {
  return (
    <PageShell>
      <section className="pt-4">
        <p className="eyebrow">Protocol</p>
        <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-5xl leading-none md:text-7xl">
          Private until settlement.
        </h1>
      </section>

      <section className="mt-12 grid gap-5 border-y border-[rgb(var(--line))] py-8 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point) => (
          <p key={point} className="text-lg font-extrabold text-[rgb(var(--ink))]">
            {point}
          </p>
        ))}
      </section>

      <section className="mt-10 flex flex-col gap-4 text-base leading-7 text-[rgb(var(--muted))] md:max-w-2xl">
        <p>
          The app uses CoFHE encrypted inputs for listing prices and offers. Only the final buyer and final amount are revealed for
          settlement.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/marketplace" className="btn-primary">
            Open market
          </Link>
          <a href="https://cofhe-docs.fhenix.zone/" target="_blank" rel="noreferrer" className="btn-secondary">
            Docs
          </a>
        </div>
      </section>
    </PageShell>
  );
}
