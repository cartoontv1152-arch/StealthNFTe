"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/create", label: "Mint" },
  { href: "/about", label: "Protocol" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[rgb(var(--line))] bg-[rgb(var(--paper)/0.94)] py-4 backdrop-blur-md">
      <div className="page-wrap flex items-center justify-between gap-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl text-[rgb(var(--ink))]">
          StealthNFT
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-extrabold transition-colors ${
                  active ? "text-[rgb(var(--ink))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--ink))]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>

          <Link href="/marketplace" className="btn-secondary min-h-0 px-3 py-2 text-sm md:hidden">
            Market
          </Link>
        </div>
      </div>
    </nav>
  );
}
