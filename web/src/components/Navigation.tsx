"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnectButton } from "@/components/WalletConnectButton";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Market" },
  { href: "/create", label: "Create" },
  { href: "/about", label: "About" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-frame">
        <div className="site-header-row">
          <Link href="/" className="brand-mark" aria-label="StealthNFT home">
            StealthNFT
          </Link>

          <nav className="nav-tabs" aria-label="Primary">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link" data-active={pathname === link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="wallet-button-wrap">
            <WalletConnectButton />
          </div>
        </div>

        <nav className="mobile-nav" aria-label="Primary mobile">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link" data-active={pathname === link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
