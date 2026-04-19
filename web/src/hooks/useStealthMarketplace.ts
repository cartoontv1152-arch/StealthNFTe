"use client";

import { useAccount } from "wagmi";
import { MARKETPLACE_ABI, NFT_ABI } from "@/lib/contracts";

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`;
const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS as `0x${string}`;

export interface Listing {
  tokenId: bigint;
  seller: `0x${string}`;
  active: boolean;
  bidReceived: boolean;
  price?: string;
}

export function useStealthMarketplace() {
  const { address } = useAccount();

  return {
    address,
    MARKETPLACE_ADDRESS,
    NFT_ADDRESS,
  };
}
