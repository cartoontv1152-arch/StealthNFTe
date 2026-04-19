"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ParticleField } from "./ParticleField";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ParticleField />

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-reveal-up">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-sm text-slate-300">Live on Fhenix Testnet</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-reveal-up animate-delay-100">
          <span className="text-white">Privacy-First</span>
          <br />
          <span className="gradient-text font-['Syne']">NFT Marketplace</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-reveal-up animate-delay-200 leading-relaxed">
          Powered by <span className="text-purple-400 font-semibold">Fully Homomorphic Encryption</span>.
          Your NFT metadata, prices, and transactions stay encrypted on-chain.
          True privacy, provable security.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal-up animate-delay-300">
          <ConnectButton />

          <a
            href="https://docs.fhenix.io"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl glass text-slate-300 hover:text-white hover:border-purple-500/50 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Read Docs
          </a>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-reveal-up animate-delay-400">
          {[
            { title: "Encrypted Metadata", desc: "NFT data stays encrypted on-chain", icon: "🔐" },
            { title: "Sealed Bids", desc: "Offers hidden until settlement", icon: "🎯" },
            { title: "FHE Powered", desc: "Compute on encrypted data", icon: "⚡" },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2 font-['Syne']">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}