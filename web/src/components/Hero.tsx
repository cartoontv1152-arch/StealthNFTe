"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ParticleField } from "./ParticleField";

const FEATURES = [
  {
    title: "Encrypted Metadata",
    desc: "NFT data stays encrypted on-chain",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Sealed Bids",
    desc: "Offers hidden until settlement",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "FHE Powered",
    desc: "Compute on encrypted data",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ParticleField />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-10 animate-reveal-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-sm text-slate-300 font-medium">Live on Fhenix Testnet</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 animate-reveal-up animate-delay-100 font-['Syne'] leading-tight tracking-tight">
          <span className="text-white block">Privacy-First</span>
          <span className="gradient-text block mt-2">NFT Marketplace</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-reveal-up animate-delay-200 leading-relaxed">
          Powered by <span className="text-purple-400 font-semibold">Fully Homomorphic Encryption</span>.
          Your NFT metadata, prices, and transactions stay encrypted on-chain.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-reveal-up animate-delay-300">
          <ConnectButton />
          <a
            href="https://docs.fhenix.io"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Read Fhenix documentation"
            className="px-6 py-3 rounded-xl glass text-slate-300 hover:text-white hover:border-purple-500/30 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Read Docs
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-reveal-up animate-delay-400">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 group cursor-default"
            >
              <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-5 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 font-['Syne']">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
