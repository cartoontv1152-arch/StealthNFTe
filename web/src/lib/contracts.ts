import { createPublicClient, http, isAddress, zeroAddress } from "viem";
import { arbitrumSepolia, baseSepolia, sepolia } from "viem/chains";

export const APP_CHAIN_ID = 11155111;
export const MAX_ENCRYPTED_WEI = 18_446_744_073_709_551_615n;
export const SETTLEMENT_GRACE_PERIOD_SECONDS = 172_800;

export const NFT_ADDRESS = (process.env.NEXT_PUBLIC_NFT_ADDRESS || "") as `0x${string}`;
export const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "") as `0x${string}`;

export const hasContractConfig =
  isAddress(NFT_ADDRESS) &&
  isAddress(MARKETPLACE_ADDRESS) &&
  NFT_ADDRESS !== zeroAddress &&
  MARKETPLACE_ADDRESS !== zeroAddress;

export const ENCRYPTED_UINT64_COMPONENTS = [
  { internalType: "uint256", name: "ctHash", type: "uint256" },
  { internalType: "uint8", name: "securityZone", type: "uint8" },
  { internalType: "uint8", name: "utype", type: "uint8" },
  { internalType: "bytes", name: "signature", type: "bytes" },
] as const;

export const MARKETPLACE_ABI = [
  { inputs: [], name: "SETTLEMENT_GRACE_PERIOD", outputs: [{ internalType: "uint64", name: "", type: "uint64" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "allowPublicBuyer", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "allowPublicPrice", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { components: ENCRYPTED_UINT64_COMPONENTS, internalType: "struct InEuint64", name: "encOffer", type: "tuple" },
    ],
    name: "buyNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "cancelListing", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "buyerPlain", type: "address" },
      { internalType: "bytes", name: "buyerSig", type: "bytes" },
    ],
    name: "closeNoSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "buyerPlain", type: "address" },
      { internalType: "bytes", name: "buyerSig", type: "bytes" },
      { internalType: "uint64", name: "offerPlain", type: "uint64" },
      { internalType: "bytes", name: "offerSig", type: "bytes" },
    ],
    name: "finalizeSale",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getListingCore",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "bytes32", name: "reserveHandle", type: "bytes32" },
      { internalType: "bool", name: "active", type: "bool" },
      { internalType: "bool", name: "bidReceived", type: "bool" },
      { internalType: "bool", name: "revealPrepared", type: "bool" },
      { internalType: "uint64", name: "revealPreparedAt", type: "uint64" },
      { internalType: "uint32", name: "bidCount", type: "uint32" },
      { internalType: "uint64", name: "revealedPrice", type: "uint64" },
      { internalType: "address", name: "revealedBuyer", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getSettlementHandles",
    outputs: [
      { internalType: "bytes32", name: "highestOfferHandle", type: "bytes32" },
      { internalType: "bytes32", name: "pendingBuyerHandle", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "highestOffer", outputs: [{ internalType: "euint64", name: "", type: "bytes32" }], stateMutability: "view", type: "function" },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { components: ENCRYPTED_UINT64_COMPONENTS, internalType: "struct InEuint64", name: "encPrice", type: "tuple" },
    ],
    name: "listNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "listings",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "euint64", name: "reservePrice", type: "bytes32" },
      { internalType: "bool", name: "active", type: "bool" },
      { internalType: "bool", name: "bidReceived", type: "bool" },
      { internalType: "bool", name: "revealPrepared", type: "bool" },
      { internalType: "uint64", name: "revealPreparedAt", type: "uint64" },
      { internalType: "uint32", name: "bidCount", type: "uint32" },
      { internalType: "uint64", name: "revealedPrice", type: "uint64" },
      { internalType: "address", name: "revealedBuyer", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "nft", outputs: [{ internalType: "contract IERC721", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "pendingBuyer", outputs: [{ internalType: "eaddress", name: "", type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "prepareSaleReveal", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "reclaimExpiredReveal", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { components: ENCRYPTED_UINT64_COMPONENTS, internalType: "struct InEuint64", name: "encOffer", type: "tuple" },
    ],
    name: "submitSealedOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { anonymous: false, inputs: [{ indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }, { indexed: true, internalType: "address", name: "seller", type: "address" }, { indexed: false, internalType: "bytes32", name: "reserveHandle", type: "bytes32" }], name: "Listed", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }, { indexed: true, internalType: "address", name: "seller", type: "address" }], name: "ExpiredRevealReclaimed", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }, { indexed: true, internalType: "address", name: "seller", type: "address" }], name: "NoSaleClosed", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }, { indexed: true, internalType: "address", name: "buyer", type: "address" }, { indexed: false, internalType: "uint32", name: "bidCount", type: "uint32" }], name: "SealedOfferSubmitted", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }, { indexed: true, internalType: "address", name: "buyer", type: "address" }, { indexed: true, internalType: "address", name: "seller", type: "address" }, { indexed: false, internalType: "uint64", name: "price", type: "uint64" }, { indexed: false, internalType: "address", name: "royaltyReceiver", type: "address" }, { indexed: false, internalType: "uint256", name: "royaltyAmount", type: "uint256" }], name: "SaleFinalized", type: "event" },
] as const;

export const LEGACY_MARKETPLACE_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "listings",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "bytes32", name: "price", type: "bytes32" },
      { internalType: "bool", name: "active", type: "bool" },
      { internalType: "bool", name: "bidReceived", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "pendingBuyer", outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }], stateMutability: "view", type: "function" },
] as const;

export const NFT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "uri", type: "string" },
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "uri", type: "string" },
      { internalType: "address", name: "royaltyReceiver", type: "address" },
      { internalType: "uint96", name: "royaltyBps", type: "uint96" },
    ],
    name: "mintWithRoyalty",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "operator", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "creatorOf", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "nextTokenId", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "salePrice", type: "uint256" },
    ],
    name: "royaltyInfo",
    outputs: [
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "from", type: "address" }, { indexed: true, internalType: "address", name: "to", type: "address" }, { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }], name: "Transfer", type: "event" },
] as const;

export const TESTNET_CONFIGS = {
  sepolia: { chain: sepolia, rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.ethpandaops.io" },
  arbitrumSepolia: { chain: arbitrumSepolia, rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc" },
  baseSepolia: { chain: baseSepolia, rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org" },
} as const;

export function getPublicClient(chainId: number) {
  const config = Object.values(TESTNET_CONFIGS).find((candidate) => candidate.chain.id === chainId);
  if (!config) {
    return createPublicClient({ chain: sepolia, transport: http(TESTNET_CONFIGS.sepolia.rpcUrl) });
  }

  return createPublicClient({ chain: config.chain, transport: http(config.rpcUrl) });
}
