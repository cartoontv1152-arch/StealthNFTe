import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stealth-nft.vercel.app"),
  title: {
    default: "StealthNFT | Private NFT Marketplace",
    template: "%s | StealthNFT",
  },
  description:
    "Mint NFTs, encrypt reserve prices, collect sealed offers, and settle winning sales on Sepolia with CoFHE privacy.",
  applicationName: "StealthNFT",
  keywords: ["StealthNFT", "Fhenix", "CoFHE", "NFT marketplace", "encrypted auction", "Sepolia"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "StealthNFT | Private NFT Marketplace",
    description:
      "A working Sepolia NFT marketplace with encrypted reserves, sealed offers, IPFS uploads, and on-chain settlement.",
    url: "https://stealth-nft.vercel.app",
    siteName: "StealthNFT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "StealthNFT | Private NFT Marketplace",
    description: "Encrypted reserves, sealed offers, and verified NFT settlement on Sepolia.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
