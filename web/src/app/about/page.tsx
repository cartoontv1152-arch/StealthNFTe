import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const points = ["Encrypted reserves", "Sealed offers", "Seller reveal", "Buyer settlement"];

export default function AboutPage() {
  return (
    <PageShell>
      <section className="page-heading pt-4">
        <p className="eyebrow">Protocol</p>
        <h1 className="page-title mt-4">Private until settlement</h1>
      </section>

      <section className="mt-10 grid gap-4 border-y border-[rgb(var(--line))] py-6 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point) => (
          <p key={point} className="font-black text-[rgb(var(--ink))]">
            {point}
          </p>
        ))}
      </section>

      <section className="mt-8 flex flex-col gap-4 text-base leading-7 text-[rgb(var(--muted))] md:max-w-2xl">
        <p>CoFHE encrypts prices and offers. Only the final buyer and final amount reveal for settlement.</p>
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
