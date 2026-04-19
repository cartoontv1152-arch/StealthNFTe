"use client";

import { useContractRead, useWriteContract, useAccount } from "wagmi";
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

  const { write: listNFTWrite } = useWriteContract();
  const { write: buyNFTWrite } = useWriteContract();
  const { write: allowPublicBuyerWrite } = useWriteContract();
  const { write: allowPublicPriceWrite } = useWriteContract();
  const { write: finalizeSaleWrite } = useWriteContract();
  const { write: cancelListingWrite } = useWriteContract();

  return {
    address,
    nextTokenId,
    listings,
    listNFT: { write: listNFTWrite },
    buyNFT: { write: buyNFTWrite },
    allowPublicBuyer: { write: allowPublicBuyerWrite },
    allowPublicPrice: { write: allowPublicPriceWrite },
    finalizeSale: { write: finalizeSaleWrite },
    cancelListing: { write: cancelListingWrite },
    refetchListings,
    refetchNextId,
    MARKETPLACE_ADDRESS,
    NFT_ADDRESS,
  };
}