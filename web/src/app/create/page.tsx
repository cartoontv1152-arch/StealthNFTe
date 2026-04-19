"use client";

import { Navigation } from "@/components/Navigation";
import { NFTMinter } from "@/components/NFTMinter";

export default function CreatePage() {
  return (
    <main className="min-h-screen pt-24 pb-16 relative">
      <Navigation />

      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Syne']">
            <span className="gradient-text">Mint</span> Your NFT
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Create and list your NFT with encrypted metadata on Fhenix.
            Your data stays private by design.
          </p>
        </div>

        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: 1, title: "Fill Details", desc: "Enter NFT metadata and price", icon: "📝" },
              { step: 2, title: "Encrypt", desc: "Metadata encrypted with FHE", icon: "🔐" },
              { step: 3, title: "List", desc: "Mint and list on marketplace", icon: "✨" },
            ].map((item) => (
              <div key={item.step} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Step {item.step}</p>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <NFTMinter />

        <div className="mt-12 glass rounded-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-4 font-['Syne']">How Encryption Works</h3>
          <div className="space-y-4 text-slate-400 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">1</span>
              </div>
              <p>Your NFT metadata is encrypted client-side using the CoFHE SDK before being stored on-chain.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-400 text-xs font-bold">2</span>
              </div>
              <p>The listing price is encrypted using FHE. Only you can reveal it when ready.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs font-bold">3</span>
              </div>
              <p>Offers from buyers are also encrypted. The smart contract compares them without decryption.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">4</span>
              </div>
              <p>When you accept an offer, you authorize decryption. The buyer completes the purchase.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}