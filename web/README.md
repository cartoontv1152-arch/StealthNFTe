# StealthNFT Web

Next.js frontend for the Wave 3/4 StealthNFT marketplace.

## Current Features

- Live on-chain NFT and listing index from the configured Sepolia contracts.
- Browser CoFHE SDK encryption for reserve prices and sealed offers.
- Creator flow for metadata, minting, ERC-2981 royalty setup, approval, encrypted listing, and transaction progress.
- Collector flow for sealed offers and buyer-side finalization with `decryptForTx` proofs.
- Fixed 0.001 ETH bid bond for sealed offers, with loser/no-sale withdrawal paths.
- Seller flow for reveal preparation, no-sale close, expired reveal reclaim, and safe cancellation before bids.
- Metadata API route with optional Pinata/IPFS pinning and bounded data URI fallback for small metadata.

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
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io
NEXT_PUBLIC_NFT_ADDRESS=0xb24b2D0e6814360Ef256db25945F169252b2c041
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xaECFe3d81F43b5Da4a5E32930377b529195E592E
NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK=10963061

# Optional server-only metadata pinning
PINATA_JWT=your_pinata_jwt
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
```

## Key Files

- `src/hooks/useCoFHE.ts` - CoFHE browser client, encrypted inputs, and decrypt proofs.
- `src/hooks/useStealthMarketplace.ts` - On-chain token/listing loader.
- `src/components/NFTMinter.tsx` - Mint and encrypted listing flow.
- `src/components/NFTGrid.tsx` - Marketplace actions.
- `src/components/WalletConnectButton.tsx` - Injected browser wallet connect/switch/disconnect button.
- `src/app/api/metadata/route.ts` - Metadata pinning/fallback route.

## Notes

The marketplace uses Sepolia contract addresses from `.env.local`. If the contracts are upgraded, redeploy from `../contracts`, then update `NEXT_PUBLIC_NFT_ADDRESS`, `NEXT_PUBLIC_MARKETPLACE_ADDRESS`, and `NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK`.
