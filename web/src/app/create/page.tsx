import { PageShell } from "@/components/PageShell";
import { NFTMinter } from "@/components/NFTMinter";

export default function CreatePage() {
  return (
    <PageShell>
      <section className="create-hero">
        <div className="page-heading">
          <p className="eyebrow">Creator studio</p>
          <h1 className="page-title">Create a private listing.</h1>
          <p className="section-copy">
            Upload artwork, mint the ERC-721, encrypt the reserve, approve escrow, and list without leaving the page.
          </p>
        </div>
      </section>

      <section className="create-workspace">
        <NFTMinter />
      </section>
    </PageShell>
  );
}
