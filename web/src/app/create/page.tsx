import { PageShell } from "@/components/PageShell";
import { NFTMinter } from "@/components/NFTMinter";

const stages = [
  { title: "Metadata", body: "Public preview fields and a private commitment are prepared before mint." },
  { title: "Royalty", body: "Creator royalties are written through ERC-2981 at mint time." },
  { title: "Listing", body: "Reserve price is encrypted and submitted as a CoFHE input." },
];

export default function CreatePage() {
  return (
    <PageShell>
      <section className="grid gap-6 pb-8 pt-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div>
          <span className="eyebrow">Mint</span>
          <h1 className="section-title mt-5 max-w-4xl text-[rgb(var(--ink))]">
            Create an NFT and publish its encrypted reserve in one clean flow.
          </h1>
        </div>

        <div className="panel p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[rgb(var(--teal))]">Output</p>
          <p className="mt-3 text-2xl text-[rgb(var(--ink))]">Minted token, approval, encrypted listing</p>
        </div>
      </section>

      <section className="grid gap-4 pb-8 md:grid-cols-3">
        {stages.map((item) => (
          <article key={item.title} className="panel p-5">
            <h2 className="text-2xl text-[rgb(var(--ink))]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="pb-10">
        <NFTMinter />
      </section>
    </PageShell>
  );
}
