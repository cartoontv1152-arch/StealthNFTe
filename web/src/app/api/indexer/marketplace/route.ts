import { NextResponse } from "next/server";
import { parseAbiItem, zeroAddress, type AbiEvent, type Address, type Hex } from "viem";
import {
  APP_CHAIN_ID,
  MARKETPLACE_ADDRESS,
  NFT_ABI,
  NFT_ADDRESS,
  getPublicClient,
  hasContractConfig,
} from "@/lib/contracts";
import type { MarketplaceActivity, MarketplaceActivityKind, MarketplaceIndexResponse } from "@/lib/marketplace-index";

export const dynamic = "force-dynamic";

const TRANSFER_EVENT = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)");
const MARKET_EVENTS = [
  parseAbiItem("event Listed(uint256 indexed tokenId, address indexed seller, bytes32 reserveHandle)"),
  parseAbiItem("event SealedOfferSubmitted(uint256 indexed tokenId, address indexed buyer, uint32 bidCount)"),
  parseAbiItem("event SalePrepared(uint256 indexed tokenId, bytes32 buyerHandle, bytes32 offerHandle)"),
  parseAbiItem(
    "event SaleFinalized(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint64 price, address royaltyReceiver, uint256 royaltyAmount)"
  ),
  parseAbiItem("event ListingCancelled(uint256 indexed tokenId, address indexed seller)"),
  parseAbiItem("event NoSaleClosed(uint256 indexed tokenId, address indexed seller)"),
  parseAbiItem("event ExpiredRevealReclaimed(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 forfeitedBond)"),
] as const;

type IndexedLog = {
  eventName?: string;
  args?: Record<string, unknown>;
  blockNumber?: bigint;
  transactionHash?: Hex;
  logIndex?: number;
};

const client = getPublicClient(APP_CHAIN_ID);
const INDEX_CACHE_MS = 10_000;
const MAX_CHUNK_SIZE = 10_000n;

let cachedResponse: { expiresAt: number; data: MarketplaceIndexResponse } | null = null;

export async function GET() {
  if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
    return NextResponse.json(cachedResponse.data, {
      headers: { "cache-control": "private, max-age=0, must-revalidate" },
    });
  }

  if (!hasContractConfig) {
    return NextResponse.json(
      buildResponse([], [], "empty", "Contract addresses are not configured."),
      { headers: { "cache-control": "no-store" } }
    );
  }

  const startBlock = getIndexerStartBlock();
  if (startBlock === null) {
    const tokenIds = await readTokenIdsFromSupply();
    return jsonWithShortCache(
      buildResponse(
        tokenIds,
        [],
        "supply-fallback",
        "Set NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK to enable historical event indexing."
      )
    );
  }

  try {
    const latest = await client.getBlockNumber();
    const toBlock = latest < startBlock ? startBlock : latest;
    const chunkSize = getChunkSize();
    const [transferLogs, marketLogs] = await Promise.all([
      readLogs(NFT_ADDRESS, TRANSFER_EVENT, startBlock, toBlock, chunkSize),
      readMarketLogs(startBlock, toBlock, chunkSize),
    ]);

    const tokenIds = collectTokenIds(transferLogs);
    const activity = await attachTimestamps([...transferLogs, ...marketLogs].map(toActivity).filter(isActivity));

    return jsonWithShortCache(buildResponse(tokenIds, activity, "event-index"));
  } catch (error) {
    console.error("Marketplace indexer failed", error);
    const tokenIds = await readTokenIdsFromSupply();
    const message = error instanceof Error ? error.message : "Event indexer failed; using totalSupply fallback.";

    return jsonWithShortCache(buildResponse(tokenIds, [], "supply-fallback", message));
  }
}

async function readMarketLogs(fromBlock: bigint, toBlock: bigint, chunkSize: bigint) {
  const batches = await Promise.all(MARKET_EVENTS.map((event) => readLogs(MARKETPLACE_ADDRESS, event, fromBlock, toBlock, chunkSize)));
  return batches.flat();
}

async function readLogs(address: Address, event: AbiEvent, fromBlock: bigint, toBlock: bigint, chunkSize: bigint) {
  const logs: IndexedLog[] = [];

  for (let cursor = fromBlock; cursor <= toBlock; cursor += chunkSize) {
    const chunkEnd = cursor + chunkSize - 1n > toBlock ? toBlock : cursor + chunkSize - 1n;
    const batch = await client.getLogs({ address, event, fromBlock: cursor, toBlock: chunkEnd });
    logs.push(...(batch as IndexedLog[]));
  }

  return logs;
}

function collectTokenIds(logs: IndexedLog[]) {
  const ids = new Set<number>();
  for (const log of logs) {
    const tokenId = getTokenId(log);
    if (tokenId !== null) {
      ids.add(tokenId);
    }
  }

  return [...ids].sort((a, b) => b - a);
}

async function readTokenIdsFromSupply() {
  const totalSupply = (await client.readContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "totalSupply",
  })) as bigint;

  const total = Number(totalSupply);
  if (!Number.isSafeInteger(total) || total <= 0) {
    return [];
  }

  return Array.from({ length: total }, (_, index) => total - index);
}

async function attachTimestamps(activity: MarketplaceActivity[]) {
  const ordered = activity.sort(compareActivity).slice(0, 80);
  const uniqueBlocks = [...new Set(ordered.map((item) => item.blockNumber))];
  const timestamps = new Map<string, number>();

  await Promise.all(
    uniqueBlocks.map(async (blockNumber) => {
      const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
      timestamps.set(blockNumber, Number(block.timestamp));
    })
  );

  return ordered.map((item) => ({ ...item, timestamp: timestamps.get(item.blockNumber) }));
}

function toActivity(log: IndexedLog): MarketplaceActivity | null {
  const tokenId = getTokenId(log);
  if (tokenId === null || !log.blockNumber || !log.transactionHash) {
    return null;
  }

  const args = log.args || {};
  const base = {
    id: `${log.transactionHash}-${log.logIndex ?? 0}`,
    tokenId,
    blockNumber: log.blockNumber.toString(),
    transactionHash: log.transactionHash,
  };

  if (log.eventName === "Transfer") {
    const from = asAddress(args.from);
    const to = asAddress(args.to);
    if (from?.toLowerCase() !== zeroAddress || !to) {
      return null;
    }

    return { ...base, kind: "Minted", actor: to };
  }

  const kind = toActivityKind(log.eventName);
  if (!kind) {
    return null;
  }

  return {
    ...base,
    kind,
    actor: asAddress(args.seller) || asAddress(args.buyer),
    counterparty: asAddress(args.buyer) || asAddress(args.seller),
    priceWei: typeof args.price === "bigint" ? args.price.toString() : undefined,
    bidCount: typeof args.bidCount === "number" ? args.bidCount : undefined,
  };
}

function toActivityKind(eventName?: string): MarketplaceActivityKind | null {
  switch (eventName) {
    case "Listed":
      return "Listed";
    case "SealedOfferSubmitted":
      return "OfferSubmitted";
    case "SalePrepared":
      return "RevealPrepared";
    case "SaleFinalized":
      return "SaleFinalized";
    case "ListingCancelled":
      return "ListingCancelled";
    case "NoSaleClosed":
      return "NoSaleClosed";
    case "ExpiredRevealReclaimed":
      return "ExpiredRevealReclaimed";
    default:
      return null;
  }
}

function getTokenId(log: IndexedLog) {
  const tokenId = log.args?.tokenId;
  if (typeof tokenId !== "bigint") {
    return null;
  }

  const numeric = Number(tokenId);
  return Number.isSafeInteger(numeric) ? numeric : null;
}

function asAddress(value: unknown): Address | undefined {
  return typeof value === "string" && value.startsWith("0x") ? (value as Address) : undefined;
}

function isActivity(value: MarketplaceActivity | null): value is MarketplaceActivity {
  return Boolean(value);
}

function compareActivity(a: MarketplaceActivity, b: MarketplaceActivity) {
  const blockDelta = Number(BigInt(b.blockNumber) - BigInt(a.blockNumber));
  if (blockDelta !== 0) {
    return blockDelta;
  }

  return b.id.localeCompare(a.id);
}

function buildResponse(
  tokenIds: number[],
  activity: MarketplaceActivity[],
  source: MarketplaceIndexResponse["source"],
  warning?: string
): MarketplaceIndexResponse {
  return {
    tokenIds,
    activity,
    totalIndexedTokens: tokenIds.length,
    source,
    checkedAt: new Date().toISOString(),
    warning,
  };
}

function getIndexerStartBlock() {
  const raw =
    process.env.NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK ||
    process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK ||
    process.env.MARKETPLACE_DEPLOYMENT_BLOCK;

  if (raw && /^\d+$/.test(raw)) {
    return BigInt(raw);
  }

  if (process.env.INDEXER_ALLOW_FULL_SCAN === "true") {
    return 0n;
  }

  return null;
}

function getChunkSize() {
  const raw = process.env.INDEXER_BLOCK_CHUNK || "10000";
  if (!/^\d+$/.test(raw)) {
    return 10_000n;
  }

  const parsed = BigInt(raw);
  if (parsed <= 0n) {
    return MAX_CHUNK_SIZE;
  }

  return parsed > MAX_CHUNK_SIZE ? MAX_CHUNK_SIZE : parsed;
}

function jsonWithShortCache(data: MarketplaceIndexResponse) {
  cachedResponse = {
    data,
    expiresAt: Date.now() + INDEX_CACHE_MS,
  };

  return NextResponse.json(data, {
    headers: { "cache-control": "private, max-age=0, must-revalidate" },
  });
}
