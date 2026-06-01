"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "@wagmi/core";
import { useState } from "react";
import { Toaster } from "sonner";
import { SEPOLIA_CHAIN } from "@/lib/contracts";

const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.ethpandaops.io";
const supportedChains = [
  { ...SEPOLIA_CHAIN, rpcUrls: { default: { http: [sepoliaRpc] } } },
] as const;

function createWagmiConfig() {
  return createConfig({
    ssr: true,
    chains: supportedChains,
    connectors: [injected({ shimDisconnect: true })],
    transports: {
      [SEPOLIA_CHAIN.id]: http(sepoliaRpc),
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [config] = useState(createWagmiConfig);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="bottom-right" />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
