"use client";

import { useContractRead, useContractWrite, useAccount } from "wagmi";
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

  const { data: nextTokenId, refetch: refetchNextId } = useContractRead({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "nextTokenId",
  });

  const { data: listings, refetch: refetchListings } = useContractRead({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "listings",
    args: [BigInt(1)],
  });

  const listNFT = useContractWrite({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "listNFT",
  });

  const buyNFT = useContractWrite({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "buyNFT",
  });

  const allowPublicBuyer = useContractWrite({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "allowPublicBuyer",
  });

  const allowPublicPrice = useContractWrite({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "allowPublicPrice",
  });

  const finalizeSale = useContractWrite({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "finalizeSale",
  });

  const cancelListing = useContractWrite({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "cancelListing",
  });

  return {
    address,
    nextTokenId,
    listings,
    listNFT,
    buyNFT,
    allowPublicBuyer,
    allowPublicPrice,
    finalizeSale,
    cancelListing,
    refetchListings,
    refetchNextId,
    MARKETPLACE_ADDRESS,
    NFT_ADDRESS,
  };
}