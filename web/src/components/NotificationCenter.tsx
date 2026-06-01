"use client";

import Link from "next/link";
import type { Address } from "viem";
import type { MarketplaceNFT } from "@/hooks/useStealthMarketplace";

type Notification = {
  id: string;
  tone: "action" | "warning" | "danger";
  title: string;
  body: string;
};

export function NotificationCenter({ nfts, address }: { nfts: MarketplaceNFT[]; address?: Address }) {
  const notifications = buildNotifications(nfts, address);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <section className="notice-section">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Needs attention</p>
          <h2>Settlement watch</h2>
        </div>
        <span className="status-pill" data-tone="action">
          {notifications.length} open
        </span>
      </div>

      <div className="notice-list">
        {notifications.map((item) => (
          <div key={item.id} className="notice-item">
            <div className="min-w-0">
              <span className="status-pill" data-tone={item.tone}>
                {item.tone === "danger" ? "Deadline" : "Notice"}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <Link href="/marketplace" className="btn-secondary">
              Review
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildNotifications(nfts: MarketplaceNFT[], address?: Address): Notification[] {
  const now = Math.floor(Date.now() / 1000);

  return nfts
    .flatMap((nft) => {
      const seller = address && nft.seller.toLowerCase() === address.toLowerCase();
      const deadline = Number(nft.settlementDeadline);
      const hoursLeft = deadline > 0 ? Math.max(0, Math.ceil((deadline - now) / 3600)) : null;
      const notifications: Notification[] = [];

      if (nft.revealPrepared && nft.listingActive && !seller) {
        notifications.push({
          id: `bidder-${nft.tokenId}`,
          tone: nft.settlementExpired ? "danger" : "action",
          title: `Reveal is ready for #${nft.tokenId}`,
          body: nft.settlementExpired
            ? "The settlement window has expired. The seller can reclaim the NFT."
            : `If your sealed offer won, finalize before ${hoursLeft ?? 0}h left.`,
        });
      }

      if (seller && nft.revealPrepared && nft.listingActive) {
        notifications.push({
          id: `seller-${nft.tokenId}`,
          tone: nft.settlementExpired ? "danger" : "warning",
          title: `Settlement pending for ${nft.name}`,
          body: nft.settlementExpired
            ? "The winning buyer missed the grace period. You can reclaim this listing."
            : `Waiting on the winning buyer. Deadline ${deadline ? new Date(deadline * 1000).toLocaleString() : "pending"}.`,
        });
      }

      if (seller && nft.bidReceived && !nft.revealPrepared && nft.listingActive) {
        notifications.push({
          id: `prepare-${nft.tokenId}`,
          tone: "action",
          title: `Offers received on #${nft.tokenId}`,
          body: `${nft.bidCount} sealed offer${nft.bidCount === 1 ? "" : "s"} received from private bidders. Prepare reveal when ready.`,
        });
      }

      return notifications;
    })
    .slice(0, 4);
}
