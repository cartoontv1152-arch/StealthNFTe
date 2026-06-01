import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StealthNFT",
    short_name: "StealthNFT",
    description: "Private NFT marketplace with encrypted reserves and sealed offers on Sepolia.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1df",
    theme_color: "#0d8684",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
