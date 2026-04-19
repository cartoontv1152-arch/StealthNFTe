"use client";

import { useWriteContract, useAccount } from "wagmi";

const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS as `0x${string}`;

export function useNFT() {
  const { address } = useAccount();

  const { write: mintWrite } = useWriteContract();

  return {
    mint: { write: mintWrite },
    address,
    NFT_ADDRESS,
  };
}