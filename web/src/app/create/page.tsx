import { PageShell } from "@/components/PageShell";
import { NFTMinter } from "@/components/NFTMinter";

export default function CreatePage() {
  return (
    <PageShell>
      <section className="page-heading pb-8 pt-4">
        <p className="eyebrow">Mint</p>
        <h1 className="page-title mt-4">Create listing</h1>
      </section>

      <section className="pb-10">
        <NFTMinter />
      </section>
    </PageShell>
  );
}
