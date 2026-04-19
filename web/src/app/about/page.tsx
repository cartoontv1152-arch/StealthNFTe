"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";

const FHE_BENEFITS = [
  {
    title: "Privacy by Default",
    desc: "Data stays encrypted during all computations",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    accentClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
  },
  {
    title: "On-Chain Compute",
    desc: "Smart contracts can process encrypted state",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    accentClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/20",
  },
  {
    title: "Selective Disclosure",
    desc: "Owners choose when to reveal encrypted data",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    accentClass: "text-pink-400",
    bgClass: "bg-pink-500/10",
    borderClass: "border-pink-500/20",
  },
  {
    title: "Verifiable Security",
    desc: "Decentralized guarantees for confidentiality",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    accentClass: "text-green-400",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/20",
  },
];

const FHE_OPERATIONS = [
  { code: "FHE.asEuint64()", desc: "Convert plaintext to encrypted uint64", color: "purple" },
  { code: "FHE.gte(a, b)", desc: "Compare two encrypted values", color: "cyan" },
  { code: "FHE.select(cond, a, b)", desc: "Select based on encrypted condition", color: "pink" },
  { code: "FHE.allowPublic()", desc: "Authorize decryption for settlement", color: "green" },
];

const CODE_COLORS: Record<string, string> = {
  purple: "text-purple-400",
  cyan: "text-cyan-400",
  pink: "text-pink-400",
  green: "text-green-400",
};

export default function AboutPage() {
  const [showDeepDive, setShowDeepDive] = useState(false);

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-16 relative">
      <Navigation />

      <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Syne']">
            About <span className="gradient-text">FHE</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Fully Homomorphic Encryption enables computation on encrypted data.
            No decryption needed. Complete privacy.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-['Syne']">What is FHE?</h2>
          <p className="text-slate-300 leading-relaxed mb-8">
            Fully Homomorphic Encryption (FHE) is a form of encryption that allows computations to be performed
            on encrypted data without first decrypting it. This means you can process sensitive information
            while it remains encrypted throughout the entire computation — the results are also encrypted
           , and only the data owner can decrypt the final output.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FHE_BENEFITS.map((benefit, i) => (
              <div key={i} className={`glass rounded-xl p-5 border ${benefit.borderClass}`}>
                <div className={`w-10 h-10 rounded-lg ${benefit.bgClass} flex items-center justify-center ${benefit.accentClass} mb-3`}>
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-white mb-1">{benefit.title}</h3>
                <p className="text-slate-400 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-['Syne']">How StealthNFT Uses FHE</h2>

          <div className="space-y-6">
            {[
              {
                num: 1,
                title: "Encrypted Prices",
                desc: "When you list an NFT, the price is encrypted client-side using FHE. The smart contract stores the encrypted price and can compare it with offers without ever decrypting it.",
                color: "purple",
              },
              {
                num: 2,
                title: "Sealed Bids",
                desc: "Buyers submit encrypted offers. The contract uses FHE operations like FHE.gte() to compare offers against the encrypted price. The highest qualifying bid wins — all without decryption.",
                color: "cyan",
              },
              {
                num: 3,
                title: "Private Metadata",
                desc: "NFT metadata including name, description, and attributes can be encrypted. Only the owner can reveal specific metadata when they choose to.",
                color: "pink",
              },
              {
                num: 4,
                title: "Settlement with Proof",
                desc: "When a seller accepts a bid, they authorize decryption of the winning buyer address. This generates a proof that is verified on-chain for secure settlement.",
                color: "green",
              },
            ].map((item) => (
              <div key={item.num} className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  item.color === "purple" ? "from-purple-500 to-purple-600" :
                  item.color === "cyan" ? "from-cyan-500 to-cyan-600" :
                  item.color === "pink" ? "from-pink-500 to-pink-600" :
                  "from-green-500 to-green-600"
                } flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold">{item.num}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-['Syne']">FHE Operations Used</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FHE_OPERATIONS.map((op, i) => (
              <div key={i} className="bg-black/30 rounded-xl p-4 border border-white/5">
                <code className={`${CODE_COLORS[op.color]} text-sm block mb-2 font-mono`}>
                  {op.code}
                </code>
                <p className="text-slate-500 text-xs leading-relaxed">{op.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowDeepDive(!showDeepDive)}
          className="w-full glass-card rounded-2xl p-6 mb-8 text-left hover:bg-white/[0.04] transition-colors group"
          aria-expanded={showDeepDive}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <h3 className="text-lg font-bold text-white font-['Syne']">Technical Deep Dive</h3>
            </div>
            <svg
              className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${showDeepDive ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ${showDeepDive ? "mt-6 max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="space-y-4 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-6">
              <p>
                StealthNFT is built on <strong className="text-white">Fhenix</strong>, a blockchain that natively supports
                FHE operations in EVM smart contracts. This is made possible through a specialized FHE coprocessor
                that handles encrypted computation without exposing plaintext data.
              </p>
              <p>
                The encryption scheme used is based on the <strong className="text-white">TFHE</strong> (Fully Homomorphic
                Encryption over the Torus) library, which supports efficient comparison operations — critical for
                the marketplace&apos;s sealed bid functionality.
              </p>
              <p>
                When a buyer submits an offer, their wallet encrypts the bid amount client-side using the CoFHE SDK.
                The encrypted value is sent to the contract, which stores it as an <code className="text-purple-400">euint64</code> type.
                The contract can then perform operations like <code className="text-cyan-400">FHE.gte()</code> directly on these encrypted values.
              </p>
              <p>
                This architecture means that at no point — not during transaction submission, not during contract execution,
                not in any public state — is the actual offer price ever revealed in plaintext.
              </p>
            </div>
          </div>
        </button>

        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-6 font-['Syne']">Ready to Build?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://docs.fhenix.io"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl gradient-btn text-white font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Fhenix Documentation
            </a>
            <a
              href="https://github.com/FhenixProtocol/awesome-fhenix"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl glass text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Explore Examples
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
