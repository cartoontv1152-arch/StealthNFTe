import { formatEther } from "viem";
import { formatActivityLabel, type MarketplaceActivity } from "@/lib/marketplace-index";
import { shortAddress } from "@/hooks/useStealthMarketplace";

export function MarketplaceActivityFeed({ activity }: { activity: MarketplaceActivity[] }) {
  const visible = activity.slice(0, 7);

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="activity-section">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Activity</p>
          <h2>Live trail</h2>
        </div>
        <span className="status-pill">{activity.length}</span>
      </div>

      <div className="activity-list">
        {visible.map((item) => (
          <div key={item.id} className="activity-item">
            <span className="activity-dot" />
            <div className="min-w-0">
              <p className="font-black text-[var(--color-ink-strong)]">{formatActivityLabel(item)}</p>
              <p className="mt-1 truncate text-sm text-[var(--color-muted)]">
                {activityDetail(item)}
                {item.timestamp ? ` · ${new Date(item.timestamp * 1000).toLocaleDateString()}` : ` · block ${item.blockNumber}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function activityDetail(item: MarketplaceActivity) {
  if (item.kind === "SaleFinalized" && item.priceWei) {
    return `${formatEther(BigInt(item.priceWei))} ETH`;
  }

  if (item.kind === "OfferSubmitted" && item.actor) {
    return `${shortAddress(item.actor)} submitted a sealed offer`;
  }

  if (item.actor) {
    return shortAddress(item.actor);
  }

  return "On-chain event";
}
