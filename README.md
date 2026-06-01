# StealthNFT

**Wave 5 production build for a privacy-first NFT marketplace on Fhenix/coFHE.**

StealthNFT lets creators mint NFTs, list them with encrypted reserve prices, receive sealed offers, and settle the winning sale with threshold-network decrypt proofs. Public marketplace UX stays simple while the sensitive pricing and bidder path remains private until the seller prepares the final reveal.

## What Ships In This Version

Wave 3, Wave 4, and Wave 5 are complete for the Sepolia testnet release. The app is wired to live deployed contracts, includes the final hosted-app readiness layer, and keeps the private marketplace flow fully on-chain.

### Wave 3

- Browser `@cofhe/sdk` integration using `createCofheConfig`, `createCofheClient`, wagmi public clients, and wallet clients.
- One-flow creator UX: metadata, mint, approval, encrypted reserve, and marketplace listing.
- Optional server-side IPFS pinning through `PINATA_JWT`; bounded data URI metadata fallback works only for small token metadata.
- ERC-2981 royalties on minted NFTs.
- On-chain marketplace indexing instead of demo listings.
- Cleaner production UI with live status, empty states, and transaction progress.

### Wave 4

- Encrypted winning offer tracking with `FHE.gte` and `FHE.select`.
- Reveal-only-on-win settlement: losing bidders are never decrypted.
- Seller-controlled reveal preparation with `FHE.allowPublic`.
- Buyer finalization with `decryptForTx(...).withoutPermit()` proofs.
- On-chain verification with `FHE.publishDecryptResult`.
- Payment enforcement against the decrypted winning offer.
- Fixed 0.001 ETH bid bond for sealed offers, refundable to losing/no-sale bidders and forfeited to the seller after an expired winner reveal.
- Late bids are rejected after reveal preparation.
- Seller recovery paths handle below-reserve no-sale reveals and expired buyer settlement windows.

### Wave 5

- Server-side event indexer for minted tokens, listings, sealed offers, reveal preparation, sale settlement, cancellation, no-sale close, and expired reveal reclaim.
- Hosted release checks with environment validation, strict build verification, and Vercel deployment guidance.
- First-class creator media upload with Pinata/IPFS support and a safe URL-entry path when upload credentials are not configured.
- Bidder and seller notification center for reveal-ready listings and settlement-deadline states.
- Marketplace analytics, activity feed, search, status filters, and sort controls.
- Contract verification automation for supported testnets.
- Hallmark UI pass with tokenized responsive layout, production spacing, and mobile screenshot verification.

## On-Chain Flow

1. Creator mints with public preview metadata and an optional private metadata commitment.
2. Creator approves the marketplace and lists with an encrypted `euint64` reserve.
3. Collectors submit sealed offers from the browser CoFHE SDK.
4. The contract compares encrypted offers and stores only the encrypted current winner.
5. Seller prepares reveal for the final buyer and offer handles.
6. Winning buyer decrypts for transaction, submits threshold signatures, pays ETH, and receives the NFT.
7. ERC-2981 royalty is paid before seller proceeds when a royalty receiver is configured.
8. If no offer met reserve, the seller can prove the revealed buyer is zero and close the listing.
9. If a winning buyer does not settle within two days, the seller can reclaim the NFT.

## Contracts

- `contracts/contracts/StealthNFT.sol`
  ERC-721 with URI storage, creator tracking, and ERC-2981 token royalties.
- `contracts/contracts/StealthMarketplace.sol`
  Confidential listing, sealed offer, seller reveal, proof-verified settlement, royalty payout, and cancellation logic.

## Sepolia Deployment

| Contract | Address |
| --- | --- |
| StealthNFT | `0xb24b2D0e6814360Ef256db25945F169252b2c041` |
| StealthMarketplace | `0xaECFe3d81F43b5Da4a5E32930377b529195E592E` |

Deployment metadata is stored in `contracts/deployments/sepolia.json`. The Sepolia event indexer should start at block `10963061`.

## Frontend

- `web/src/hooks/useCoFHE.ts`
  Browser CoFHE client, encrypted `uint64` inputs, permits, and decrypt-for-transaction helpers.
- `web/src/hooks/useStealthMarketplace.ts`
  Reads live token metadata, owners, listings, encrypted handles, bid counts, and reveal state.
- `web/src/components/NFTMinter.tsx`
  Mint, approve, encrypt reserve, and list flow.
- `web/src/components/NFTGrid.tsx`
  Place sealed offers, seller reveal, no-sale close, expired reveal reclaim, cancel, and buyer finalize actions.
- `web/src/app/api/metadata/route.ts`
  Metadata pinning route with `PINATA_JWT` support and bounded on-chain fallback.
- `web/src/app/api/upload/route.ts`
  Creator media upload route with IPFS pinning and production-safe upload errors when credentials are missing.
- `web/src/app/api/indexer/marketplace/route.ts`
  Chunked on-chain event indexer with total-supply fallback for large collections.
- `web/src/components/NotificationCenter.tsx`
  Buyer and seller settlement notifications for reveal and deadline states.
- `web/src/components/MarketplaceActivity.tsx`
  Live activity feed for historical marketplace events.

## Environment

### Contracts

```bash
SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io
DEPLOYER_PRIVATE_KEY=your_testnet_private_key
```

`PRIVATE_KEY` is also supported for compatibility with Fhenix starter docs.

### Web

```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io
NEXT_PUBLIC_NFT_ADDRESS=0xb24b2D0e6814360Ef256db25945F169252b2c041
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xaECFe3d81F43b5Da4a5E32930377b529195E592E
NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK=10963061

# Optional server-only metadata pinning
PINATA_JWT=your_pinata_jwt
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret

# Optional indexer tuning
INDEXER_BLOCK_CHUNK=10000
```

## Commands

```bash
cd contracts
npm install
npm run compile
npm test
npm run deploy:sepolia
```

```bash
cd web
npm install
npm run validate:env
npm run build
npm run release:check
npm run dev
```

## Verification Status

- `contracts`: `npm run compile` passed
- `contracts`: `npm test` passed
- `contracts`: Sepolia live smoke passed for no-sale bid-bond withdrawal and winning sale finalization
- `web`: `npm run lint` passed
- `web`: `npm run build` passed
- `web`: responsive screenshot QA passed at desktop and mobile widths
- Live Sepolia contract read passed against the deployed NFT and marketplace addresses

## Wave 5 Status

Wave 5 is complete for testnet production readiness. The shipped app includes production indexing, hosted release checks, creator upload UX, settlement notifications, marketplace analytics/activity, filtering, and contract verification automation.

See [WAVE_3_4_TODO.md](./WAVE_3_4_TODO.md) for the full completion checklist.

## Fhenix References

- [coFHE Client SDK overview](https://cofhe-docs.fhenix.zone/client-sdk/introduction/overview)
- [FHE library quick start](https://cofhe-docs.fhenix.zone/fhe-library/introduction/quick-start)
- [Encrypted auction pattern](https://cofhe-docs.fhenix.zone/fhe-library/examples/auction-example)
- [Decrypt result writing](https://cofhe-docs.fhenix.zone/client-sdk/guides/writing-decrypt-result)

## License

MIT
