import { PageShell } from "@/components/PageShell";
import { NFTMinter } from "@/components/NFTMinter";

export default function CreatePage() {
  return (
    <PageShell>
      <section className="pb-8 pt-4">
        <p className="eyebrow">Mint</p>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-none text-[rgb(var(--ink))] md:text-7xl">
          Create listing
        </h1>
      </section>

      <section className="pb-10">
        <NFTMinter />
      </section>
    </PageShell>
  );
}
