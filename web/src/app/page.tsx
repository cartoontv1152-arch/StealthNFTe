"use client";

import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navigation />
      <Hero />

      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text font-['Syne']">
            How FHE Powers StealthNFT
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Traditional marketplaces expose everything. We encrypt everything.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-white mb-4 font-['Syne']">Encrypted Prices</h3>
              <p className="text-slate-400 mb-4">
                Listing prices are encrypted using FHE. No one can see the price until the seller reveals it.
              </p>
              <code className="text-sm text-purple-400 bg-black/30 px-3 py-2 rounded-lg block">
                FHE.asEuint64(encPrice)
              </code>
            </div>

            <div className="glass rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-white mb-4 font-['Syne']">Sealed Bids</h3>
              <p className="text-slate-400 mb-4">
                Offers are encrypted. The contract compares offers without decrypting them.
              </p>
              <code className="text-sm text-cyan-400 bg-black/30 px-3 py-2 rounded-lg block">
                FHE.gte(offer, price)
              </code>
            </div>

            <div className="glass rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-white mb-4 font-['Syne']">Private Metadata</h3>
              <p className="text-slate-400 mb-4">
                NFT metadata is encrypted. Only the owner can reveal specific details.
              </p>
              <code className="text-sm text-pink-400 bg-black/30 px-3 py-2 rounded-lg block">
                EncryptedTokenURI
              </code>
            </div>

            <div className="glass rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-white mb-4 font-['Syne']">Selective Disclosure</h3>
              <p className="text-slate-400 mb-4">
                Sellers choose when to reveal prices and metadata. Full control over your data.
              </p>
              <code className="text-sm text-green-400 bg-black/30 px-3 py-2 rounded-lg block">
                FHE.allowPublic()
              </code>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 font-['Syne']">Ready to Start?</h2>
          <p className="text-xl text-slate-400 mb-10">
            Connect your wallet and start trading on the first privacy-preserving NFT marketplace.
          </p>
          <a
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Explore Marketplace
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold gradient-text font-['Syne']">StealthNFT</span>
            <span className="text-slate-500 text-sm">Built on Fhenix</span>
          </div>
          <div className="text-slate-500 text-sm">
            Powered by Fully Homomorphic Encryption
          </div>
        </div>
      </footer>
    </main>
  );
}