import { createPublicClient, http, parseAbi } from "viem";
import { sepolia, arbitrumSepolia, baseSepolia } from "viem/chains";

// Fhenix custom types for encrypted inputs - these are handled by the CoFHE SDK
// Using tuple representation for encrypted types
export const MARKETPLACE_ABI = parseAbi([
  "function listNFT(uint256 tokenId, bytes calldata encPrice) external",
  "function buyNFT(uint256 tokenId, bytes calldata encOffer) external",
  "function allowPublicBuyer(uint256 tokenId) external",
  "function allowPublicPrice(uint256 tokenId) external",
  "function finalizeSale(uint256 tokenId, address buyerPlain, bytes calldata buyerSig) external payable",
  "function cancelListing(uint256 tokenId) external",
  "function listings(uint256 tokenId) external view returns (address seller, bool active, bool bidReceived)",
  "function pendingBuyer(uint256 tokenId) external view returns (address)",
  "event Listed(uint256 indexed tokenId, address indexed seller)",
  "event PurchaseAttempted(uint256 indexed tokenId, address indexed buyer)",
  "event SalePrepared(uint256 indexed tokenId)",
  "event SaleFinalized(uint256 indexed tokenId, address indexed buyer, address indexed seller)",
  "event ListingCancelled(uint256 indexed tokenId, address indexed seller)",
]);

export const NFT_ABI = parseAbi([
  "function mint(address to, string memory uri) external returns (uint256 id)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function nextTokenId() external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

export const TESTNET_CONFIGS = {
  sepolia: {
    chain: sepolia,
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/",
  },
  arbitrumSepolia: {
    chain: arbitrumSepolia,
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
  },
  baseSepolia: {
    chain: baseSepolia,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
  },
};

export function getPublicClient(chainId: number) {
  const config = Object.values(TESTNET_CONFIGS).find((c) => c.chain.id === chainId);
  if (!config) {
    return createPublicClient({
      chain: sepolia,
      transport: http(),
    });
  }
  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
}