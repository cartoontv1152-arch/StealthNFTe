"use client";

import { Navigation } from "@/components/Navigation";
import { NFTMinter } from "@/components/NFTMinter";

const STEPS = [
  {
    step: 1,
    title: "Fill Details",
    desc: "Enter NFT name, description, image, and price",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Encrypt",
    desc: "Metadata encrypted client-side with FHE",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Mint & List",
    desc: "Mint NFT and list on the marketplace",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function CreatePage() {
  return (
    <main id="main-content" className="min-h-screen pt-24 pb-16 relative">
      <Navigation />

      <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Syne']">
            <span className="gradient-text">Mint</span> Your NFT
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Create and list your NFT with encrypted metadata on Fhenix.
            Your data stays private by design.
          </p>
        </div>

        <div className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((item, i) => (
              <div key={item.step} className="glass-card rounded-xl p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-purple-400 flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">
                    <span className="text-purple-400/60">Step {item.step}</span>
                    <span className="mx-2">·</span>
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <NFTMinter />

        <div className="mt-14 glass-card rounded-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 font-['Syne'] flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            How Encryption Works
          </h3>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1 text-sm">Client-Side Encryption</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your NFT metadata is encrypted client-side using the CoFHE SDK before being stored on-chain.
                  The raw data never touches the blockchain.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-400 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1 text-sm">Encrypted Listing Price</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The listing price is encrypted using FHE. Only you can reveal it when you&apos;re ready to accept offers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1 text-sm">Sealed Offers</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Offers from buyers are also encrypted. The smart contract compares them without ever decrypting the values.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1 text-sm">Selective Settlement</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  When you accept an offer, you authorize decryption of the winning buyer&apos;s address.
                  The transaction completes securely on-chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
