"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { arbitrumSepolia, baseSepolia, sepolia } from "wagmi/chains";
import { getDefaultConfig, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";
import { Toaster } from "sonner";

const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.ethpandaops.io";
const supportedChains = [
  { ...sepolia, rpcUrls: { default: { http: [sepoliaRpc] } } },
  { ...arbitrumSepolia, rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc"] } } },
  { ...baseSepolia, rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"] } } },
] as const;

function createWagmiConfig() {
  if (typeof window === "undefined") {
    return createConfig({
      chains: supportedChains,
      ssr: true,
      transports: {
        [sepolia.id]: http(sepoliaRpc),
        [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc"),
        [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
      },
    });
  }

  return getDefaultConfig({
    appName: "StealthNFT",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
    ssr: true,
    chains: supportedChains,
  });
}

function createRainbowTheme() {
  const customTheme = lightTheme({
    accentColor: "#315f6d",
    accentColorForeground: "#f7faf8",
    borderRadius: "medium",
    fontStack: "rounded",
  });

  customTheme.colors.modalBackground = "#f7faf8";
  customTheme.colors.modalText = "#182025";
  customTheme.colors.modalTextSecondary = "rgba(24, 32, 37, 0.7)";
  customTheme.colors.profileForeground = "rgba(247, 250, 248, 0.96)";
  customTheme.colors.connectButtonBackground = "#315f6d";
  customTheme.colors.connectButtonInnerBackground = "#315f6d";
  customTheme.colors.connectButtonText = "#f7faf8";
  customTheme.colors.connectButtonTextError = "#f7faf8";
  customTheme.colors.actionButtonBorder = "rgba(49, 95, 109, 0.16)";

  return customTheme;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [config] = useState(createWagmiConfig);
  const [customTheme] = useState(createRainbowTheme);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} modalSize="compact">
          {children}
          <Toaster richColors position="bottom-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
