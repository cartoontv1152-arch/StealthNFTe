"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";

const config = getDefaultConfig({
  appName: "StealthNFT",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [
    {
      id: 11155111,
      name: "Sepolia",
      network: "sepolia",
      nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" },
      rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/"] } },
    },
    {
      id: 421614,
      name: "Arbitrum Sepolia",
      network: "arbitrum-sepolia",
      nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" },
      rpcUrls: { default: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] } },
    },
    {
      id: 84532,
      name: "Base Sepolia",
      network: "base-sepolia",
      nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" },
      rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
    },
  ],
});

const customTheme = darkTheme({
  accentColor: "#a855f7",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
});

customTheme.colors.modalBackground = "#12121a";
customTheme.colors.profileForeground = "#1a1a25";
customTheme.colors.connectButtonBackground = "#a855f7";
customTheme.colors.connectButtonInnerBackground = "#7c3aed";
customTheme.colors.modalBorder = "#1e1e2e";
customTheme.colors.modalText = "#ffffff";
customTheme.colors.modalTextSecondary = "#94a3b8";
customTheme.colors.modalTextTertiary = "#64748b";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
