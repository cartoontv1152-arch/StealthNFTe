"use client";

import { useWriteContract, useAccount } from "wagmi";
import { NFT_ADDRESS } from "@/lib/contracts";

export function useNFT() {
  const { address } = useAccount();
  const writeContract = useWriteContract();

  return {
    mint: {
      write: writeContract.writeContract.bind(writeContract),
      data: writeContract.data,
      isPending: writeContract.isPending,
    },
    address,
    NFT_ADDRESS,
  };
}
