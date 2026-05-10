"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/create", label: "Mint" },
  { href: "/about", label: "Protocol" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[rgb(var(--line))] bg-[rgb(var(--paper)/0.9)] px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--teal))] font-[family-name:var(--font-display)] text-xl text-[rgb(var(--paper))]">
              S
            </span>
            <span>
              <span className="block font-[family-name:var(--font-display)] text-2xl leading-none text-[rgb(var(--ink))]">
                StealthNFT
              </span>
              <span className="mt-1 block text-xs font-bold uppercase tracking-[0.08em] text-[rgb(var(--muted))]">
                Confidential marketplace
              </span>
            </span>
          </Link>

          <div className="lg:hidden">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-extrabold transition-colors ${
                    active
                      ? "bg-[rgb(var(--teal))] text-[rgb(var(--paper))]"
                      : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--ink))]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>
        </div>
      </div>
    </nav>
  );
}
