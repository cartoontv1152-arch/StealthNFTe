"use client";

import { useMemo } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { APP_CHAIN_ID } from "@/lib/contracts";

export function WalletConnectButton({ className = "" }: { className?: string }) {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();

  const connector = useMemo(
    () =>
      connectors.find((item) => item.id === "injected") ||
      connectors.find((item) => item.id.toLowerCase().includes("walletconnect")) ||
      connectors[0],
    [connectors]
  );

  if (isConnected && chainId !== APP_CHAIN_ID) {
    return (
      <button type="button" onClick={() => switchChain({ chainId: APP_CHAIN_ID })} disabled={switching} className={`btn-primary ${className}`}>
        {switching ? "Switching" : "Switch Sepolia"}
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <button type="button" onClick={() => disconnect()} className={`btn-secondary ${className}`} title="Disconnect wallet">
        {shortAddress(address)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connector && connect({ connector, chainId: APP_CHAIN_ID })}
      disabled={!connector || isPending}
      className={`btn-primary ${className}`}
    >
      {isPending ? "Connecting" : "Connect Wallet"}
    </button>
  );
}

function shortAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
