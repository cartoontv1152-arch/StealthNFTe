import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "StealthNFT | Privacy-First NFT Marketplace on Fhenix",
  description: "Build on Fhenix with Fully Homomorphic Encryption for confidential NFT transactions. Buy and sell NFTs with encrypted metadata, prices, and sealed bids.",
  keywords: ["NFT", "FHE", "Fhenix", "privacy", "encrypted", "blockchain", "marketplace"],
  openGraph: {
    title: "StealthNFT | Privacy-First NFT Marketplace",
    description: "Buy and sell NFTs with encrypted metadata and sealed bids. Powered by Fully Homomorphic Encryption.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StealthNFT | Privacy-First NFT Marketplace",
    description: "Buy and sell NFTs with encrypted metadata and sealed bids. Powered by FHE.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
