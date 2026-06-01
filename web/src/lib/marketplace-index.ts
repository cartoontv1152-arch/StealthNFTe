export type MarketplaceActivityKind =
  | "Minted"
  | "Listed"
  | "OfferSubmitted"
  | "RevealPrepared"
  | "SaleFinalized"
  | "ListingCancelled"
  | "NoSaleClosed"
  | "ExpiredRevealReclaimed";

export type MarketplaceActivity = {
  id: string;
  kind: MarketplaceActivityKind;
  tokenId: number;
  actor?: `0x${string}`;
  counterparty?: `0x${string}`;
  priceWei?: string;
  bidCount?: number;
  blockNumber: string;
  timestamp?: number;
  transactionHash: `0x${string}`;
};

export type MarketplaceIndexResponse = {
  tokenIds: number[];
  activity: MarketplaceActivity[];
  totalIndexedTokens: number;
  source: "event-index" | "supply-fallback" | "empty";
  checkedAt: string;
  warning?: string;
};

export const emptyMarketplaceIndex: MarketplaceIndexResponse = {
  tokenIds: [],
  activity: [],
  totalIndexedTokens: 0,
  source: "empty",
  checkedAt: new Date(0).toISOString(),
};

export function formatActivityLabel(activity: MarketplaceActivity) {
  switch (activity.kind) {
    case "Minted":
      return `Minted #${activity.tokenId}`;
    case "Listed":
      return `Listed #${activity.tokenId}`;
    case "OfferSubmitted":
      return `Sealed offer on #${activity.tokenId}`;
    case "RevealPrepared":
      return `Reveal ready for #${activity.tokenId}`;
    case "SaleFinalized":
      return `Sale settled for #${activity.tokenId}`;
    case "ListingCancelled":
      return `Listing cancelled for #${activity.tokenId}`;
    case "NoSaleClosed":
      return `No-sale closed for #${activity.tokenId}`;
    case "ExpiredRevealReclaimed":
      return `Expired reveal reclaimed for #${activity.tokenId}`;
  }
}
