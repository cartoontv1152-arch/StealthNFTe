# StealthNFT Web

Next.js frontend for the StealthNFT WaveHack marketplace. The app gives creators and collectors a normal marketplace interface while the contracts keep reserves and offers encrypted with Fhenix/coFHE until settlement.

## Current Features

- Live on-chain NFT and listing index from the configured Sepolia contracts.
- Browser CoFHE SDK encryption for reserve prices and sealed offers.
- Creator flow for artwork upload, metadata, minting, ERC-2981 royalty setup, approval, encrypted listing, and transaction progress.
- Collector flow for sealed offers and buyer-side finalization with `decryptForTx` proofs.
- Fixed 0.001 ETH bid bond for sealed offers, with loser/no-sale withdrawal paths.
- Seller flow for reveal preparation, no-sale close, expired reveal reclaim, and safe cancellation before bids.
- Upload API route for Pinata/IPFS artwork pinning.
- Metadata API route with Pinata/IPFS pinning and bounded data URI fallback for small metadata.
- Full-bleed homepage hero, responsive marketplace filters, wallet connect/switch flow, and production metadata/favicon.

## Product Flow

1. A creator uploads artwork through `/create`.
2. The app pins the image to IPFS, builds token metadata, and pins the metadata.
3. The creator mints the NFT, approves escrow, encrypts the reserve, and lists the token.
4. Collectors submit sealed offers from `/marketplace`.
5. Sellers prepare settlement reveal handles; winners finalize with decrypt-for-transaction proofs.

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
NEXT_PUBLIC_NFT_ADDRESS=0x0b5fEf198Ca8768b29d1fdb0cc47d756D309164B
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xA890928d677bB01041cd229F9004F09755dac880
NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK=10966950

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
- `src/app/api/upload/route.ts` - Required image upload route.
- `src/app/api/metadata/route.ts` - Metadata pinning/fallback route.

## Notes

The marketplace uses Sepolia contract addresses from `.env.local`. If the contracts are upgraded, redeploy from `../contracts`, then update `NEXT_PUBLIC_NFT_ADDRESS`, `NEXT_PUBLIC_MARKETPLACE_ADDRESS`, and `NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK`.
