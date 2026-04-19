"use client";

import { useWriteContract, useAccount } from "wagmi";

const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS as `0x${string}`;

export function useNFT() {
  const { address } = useAccount();
  const writeContract = useWriteContract();

  return {
    mint: {
      write: writeContract.writeContract.bind(writeContract),
      data: writeContract.data,
      isPending: writeContract.isPending,
      error: writeContract.error,
    },
    address,
    NFT_ADDRESS,
  };
}
