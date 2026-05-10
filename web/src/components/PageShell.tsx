import Link from "next/link";
import { Navigation } from "@/components/Navigation";

export function PageShell({ children }: { children: React.ReactNode }) {
  const frameStyle = {
    width: "100%",
    maxWidth: 1280,
    margin: "0 auto",
    paddingInline: "clamp(20px, 4vw, 64px)",
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />

      <div className="flex min-h-screen flex-col">
        <main className="flex-1 pb-16 pt-10 sm:pt-12">
          <div style={frameStyle}>{children}</div>
        </main>

        <footer className="border-t border-[rgb(var(--line))] py-6">
          <div style={frameStyle} className="flex flex-col gap-4 text-sm text-[rgb(var(--muted))] sm:flex-row sm:items-center sm:justify-between">
            <p>StealthNFT on Sepolia</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/marketplace" className="font-semibold text-[rgb(var(--ink))]">
                Marketplace
              </Link>
              <Link href="/create" className="font-semibold text-[rgb(var(--ink))]">
                Mint
              </Link>
              <Link href="/about" className="font-semibold text-[rgb(var(--ink))]">
                Protocol
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
