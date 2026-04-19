"use client";

import { useContractWrite } from "wagmi";
import { NFT_ABI } from "@/lib/contracts";

const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS as `0x${string}`;

export function useNFT() {
  const mint = useContractWrite({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "mint",
  });

  return {
    mint,
    NFT_ADDRESS,
  };
}