"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther, type Address, type Hex, type PublicClient } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import {
  APP_CHAIN_ID,
  LEGACY_MARKETPLACE_ABI,
  MARKETPLACE_ABI,
  MARKETPLACE_ADDRESS,
  NFT_ABI,
  NFT_ADDRESS,
  getPublicClient,
  hasContractConfig,
} from "@/lib/contracts";
import { parseTokenUri, resolveAssetUrl, type TokenMetadata } from "@/lib/metadata";

const ZERO_HANDLE = `0x${"0".repeat(64)}` as Hex;

export interface MarketplaceNFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  owner: Address;
  seller: Address;
  creator?: Address;
  metadata: TokenMetadata | null;
  encrypted: boolean;
  listingActive: boolean;
  bidReceived: boolean;
  revealPrepared: boolean;
  bidCount: number;
  reserveHandle: Hex;
  highestOfferHandle: Hex;
  pendingBuyerHandle: Hex;
  revealedPrice: bigint;
  revealedBuyer: Address;
  displayPrice: string;
}

type ListingCore = {
  seller: Address;
  reserveHandle: Hex;
  active: boolean;
  bidReceived: boolean;
  revealPrepared: boolean;
  bidCount: number;
  revealedPrice: bigint;
  revealedBuyer: Address;
};

export function useStealthMarketplace() {
  const { address } = useAccount();
  const wagmiPublicClient = usePublicClient({ chainId: APP_CHAIN_ID });
  const fallbackPublicClient = useMemo(() => getPublicClient(APP_CHAIN_ID), []);
  const publicClient = (wagmiPublicClient || fallbackPublicClient) as PublicClient;
  const [nfts, setNfts] = useState<MarketplaceNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hasContractConfig) {
      setError("Contract addresses are not configured. Add the deployed NFT and marketplace addresses to .env.local.");
      setNfts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const totalSupply = (await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "totalSupply",
      })) as bigint;

      const tokenIds = Array.from({ length: Number(totalSupply) }, (_, index) => BigInt(index + 1));
      const loaded = await Promise.all(tokenIds.map((tokenId) => loadToken(publicClient, tokenId)));

      setNfts(
        loaded
          .filter((item): item is MarketplaceNFT => Boolean(item))
          .sort((a, b) => Number(b.listingActive) - Number(a.listingActive) || b.tokenId - a.tokenId)
      );
    } catch (currentError) {
      console.error(currentError);
      setError(currentError instanceof Error ? currentError.message : "Unable to load marketplace data.");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    address,
    nfts,
    activeListings: nfts.filter((item) => item.listingActive),
    isLoading,
    error,
    refresh,
    MARKETPLACE_ADDRESS,
    NFT_ADDRESS,
    hasContractConfig,
  };
}

async function loadToken(publicClient: PublicClient, tokenId: bigint): Promise<MarketplaceNFT | null> {
  try {
    const [tokenUri, owner, creator] = await Promise.all([
      publicClient.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "tokenURI", args: [tokenId] }) as Promise<string>,
      publicClient.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "ownerOf", args: [tokenId] }) as Promise<Address>,
      publicClient
        .readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "creatorOf", args: [tokenId] })
        .catch(() => undefined) as Promise<Address | undefined>,
    ]);

    const metadata = await parseTokenUri(tokenUri);
    const core = await readListingCore(publicClient, tokenId);
    const handles = await readSettlementHandles(publicClient, tokenId, core);
    const revealedPrice = core.revealedPrice;

    return {
      tokenId: Number(tokenId),
      name: metadata?.name || `StealthNFT #${tokenId.toString()}`,
      description: metadata?.description || "Encrypted collectible metadata is awaiting selective disclosure.",
      image: resolveAssetUrl(metadata?.image || `https://picsum.photos/seed/stealth-${tokenId.toString()}/720/720`),
      owner,
      creator,
      seller: core.seller,
      metadata,
      encrypted: core.reserveHandle !== ZERO_HANDLE || Boolean(metadata?.properties?.stealth?.encryptedReserve),
      listingActive: core.active,
      bidReceived: core.bidReceived,
      revealPrepared: core.revealPrepared,
      bidCount: core.bidCount,
      reserveHandle: core.reserveHandle,
      highestOfferHandle: handles.highestOfferHandle,
      pendingBuyerHandle: handles.pendingBuyerHandle,
      revealedPrice,
      revealedBuyer: core.revealedBuyer,
      displayPrice: revealedPrice > 0n ? `${formatEther(revealedPrice)} ETH` : "Sealed",
    };
  } catch (error) {
    console.warn(`Skipping token ${tokenId.toString()}`, error);
    return null;
  }
}

async function readListingCore(publicClient: PublicClient, tokenId: bigint): Promise<ListingCore> {
  try {
    const core = (await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "getListingCore",
      args: [tokenId],
    })) as readonly [Address, Hex, boolean, boolean, boolean, number, bigint, Address];

    return {
      seller: core[0],
      reserveHandle: core[1],
      active: core[2],
      bidReceived: core[3],
      revealPrepared: core[4],
      bidCount: Number(core[5]),
      revealedPrice: BigInt(core[6]),
      revealedBuyer: core[7],
    };
  } catch {
    const legacy = (await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: LEGACY_MARKETPLACE_ABI,
      functionName: "listings",
      args: [tokenId],
    })) as readonly [Address, Hex, boolean, boolean];

    return {
      seller: legacy[0],
      reserveHandle: legacy[1],
      active: legacy[2],
      bidReceived: legacy[3],
      revealPrepared: false,
      bidCount: legacy[3] ? 1 : 0,
      revealedPrice: 0n,
      revealedBuyer: "0x0000000000000000000000000000000000000000",
    };
  }
}

async function readSettlementHandles(publicClient: PublicClient, tokenId: bigint, core: ListingCore) {
  try {
    const handles = (await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "getSettlementHandles",
      args: [tokenId],
    })) as readonly [Hex, Hex];

    return {
      highestOfferHandle: handles[0],
      pendingBuyerHandle: handles[1],
    };
  } catch {
    const pendingBuyerHandle = (await publicClient
      .readContract({
        address: MARKETPLACE_ADDRESS,
        abi: LEGACY_MARKETPLACE_ABI,
        functionName: "pendingBuyer",
        args: [tokenId],
      })
      .catch(() => ZERO_HANDLE)) as Hex;

    return {
      highestOfferHandle: core.reserveHandle,
      pendingBuyerHandle,
    };
  }
}

export function shortAddress(value?: string) {
  if (!value || value === "0x0000000000000000000000000000000000000000") {
    return "Not set";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
