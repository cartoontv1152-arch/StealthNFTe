"use client";

import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import Link from "next/link";

const FHE_FEATURES = [
  {
    title: "Encrypted Prices",
    desc: "Listing prices are encrypted using FHE. No one can see the price until the seller reveals it.",
    code: "FHE.asEuint64(encPrice)",
    color: "purple",
    accentClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
  },
  {
    title: "Sealed Bids",
    desc: "Offers are encrypted. The contract compares offers without decrypting them.",
    code: "FHE.gte(offer, price)",
    color: "cyan",
    accentClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
  },
  {
    title: "Private Metadata",
    desc: "NFT metadata is encrypted. Only the owner can reveal specific details.",
    code: "EncryptedTokenURI",
    color: "pink",
    accentClass: "text-pink-400",
    bgClass: "bg-pink-500/10",
  },
  {
    title: "Selective Disclosure",
    desc: "Sellers choose when to reveal prices and metadata. Full control over your data.",
    code: "FHE.allowPublic()",
    color: "green",
    accentClass: "text-green-400",
    bgClass: "bg-green-500/10",
  },
];

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <Navigation />
      <Hero />

      <section className="py-28 px-4 relative z-10" aria-labelledby="fhe-features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="fhe-features-heading" className="text-3xl md:text-4xl font-bold text-center mb-4 gradient-text font-['Syne']">
              How FHE Powers StealthNFT
            </h2>
            <p className="text-slate-400 text-center max-w-2xl mx-auto text-lg">
              Traditional marketplaces expose everything. We encrypt everything.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FHE_FEATURES.map((feature, i) => (
              <div key={i} className="glass-card rounded-2xl p-7 relative overflow-hidden group card-glow">
                <div className={`absolute top-0 right-0 w-40 h-40 ${feature.bgClass} rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`} aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-8 h-8 rounded-lg ${feature.bgClass} ${feature.accentClass} flex items-center justify-center text-sm font-bold`}>
                      {i + 1}
                    </span>
                    <h3 className="text-xl font-bold text-white font-['Syne']">{feature.title}</h3>
                  </div>
                  <p className="text-slate-400 mb-5 leading-relaxed">{feature.desc}</p>
                  <code className={`text-sm ${feature.accentClass} bg-black/30 px-4 py-2 rounded-lg block font-mono`}>
                    {feature.code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative z-10 border-t border-white/5" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-6 font-['Syne']">Ready to Start?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
            Connect your wallet and start trading on the first privacy-preserving NFT marketplace.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-btn text-white font-semibold text-lg"
          >
            Explore Marketplace
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="py-10 px-4 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold gradient-text-subtle font-['Syne']">StealthNFT</span>
              <span className="text-slate-500 text-sm ml-2">Built on Fhenix</span>
            </div>
          </div>

          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link href="/marketplace" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Marketplace</Link>
            <Link href="/create" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Create</Link>
            <Link href="/about" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">About FHE</Link>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://docs.fhenix.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fhenix Documentation"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </a>
            <a
              href="https://github.com/FhenixProtocol/stealth-nft"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-white/5">
          <p className="text-slate-600 text-sm text-center">
            Powered by Fully Homomorphic Encryption &amp; Fhenix
          </p>
        </div>
      </footer>
    </main>
  );
}
