# StealthNFT Web

Next.js frontend for the Wave 3/4 StealthNFT marketplace.

## Current Features

- Live on-chain NFT and listing index from the configured Sepolia contracts.
- Browser CoFHE SDK encryption for reserve prices and sealed offers.
- Creator flow for metadata, minting, ERC-2981 royalty setup, approval, encrypted listing, and transaction progress.
- Collector flow for sealed offers and buyer-side finalization with `decryptForTx` proofs.
- Seller flow for reveal preparation, no-sale close, expired reveal reclaim, and safe cancellation before bids.
- Metadata API route with optional Pinata/IPFS pinning and data URI fallback.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_NFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...

# Optional server-only metadata pinning
PINATA_JWT=your_pinata_jwt
```

## Key Files

- `src/hooks/useCoFHE.ts` - CoFHE browser client, encrypted inputs, and decrypt proofs.
- `src/hooks/useStealthMarketplace.ts` - On-chain token/listing loader.
- `src/components/NFTMinter.tsx` - Mint and encrypted listing flow.
- `src/components/NFTGrid.tsx` - Marketplace actions.
- `src/app/api/metadata/route.ts` - Metadata pinning/fallback route.

## Notes

The marketplace uses Sepolia contract addresses from `.env.local`. If the contracts are upgraded, redeploy from `../contracts`, then update `NEXT_PUBLIC_NFT_ADDRESS` and `NEXT_PUBLIC_MARKETPLACE_ADDRESS`.
