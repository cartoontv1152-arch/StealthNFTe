import Link from "next/link";
import { Navigation } from "@/components/Navigation";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <Navigation />

      <main className="site-main">
        <div className="site-frame">{children}</div>
      </main>

      <footer className="site-footer">
        <div className="site-frame footer-row">
          <div className="footer-brand">
            <strong>StealthNFT</strong>
            <span>Private NFT sales with encrypted reserves, sealed offers, and verifiable Sepolia settlement.</span>
          </div>
          <div className="footer-links">
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/create">Create</Link>
            <a href="https://cofhe-docs.fhenix.zone/" target="_blank" rel="noreferrer">
              Fhenix docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
