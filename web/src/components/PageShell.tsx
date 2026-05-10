import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Particles } from "@/components/Particles";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Particles />
      <Navigation />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1 px-4 pb-14 pt-32 sm:px-6 lg:px-8 lg:pt-28">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        <footer className="border-t border-[rgb(var(--line))] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-[rgb(var(--muted))] md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl text-[rgb(var(--ink))]">StealthNFT</p>
              <p className="mt-1 max-w-md">
                Private NFT creation and trading with encrypted pricing, sealed offers, royalty-aware settlement, and selective disclosure.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/marketplace" className="font-semibold text-[rgb(var(--ink))]">
                Marketplace
              </Link>
              <Link href="/create" className="font-semibold text-[rgb(var(--ink))]">
                Mint
              </Link>
              <Link href="/about" className="font-semibold text-[rgb(var(--ink))]">
                Privacy Tech
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
