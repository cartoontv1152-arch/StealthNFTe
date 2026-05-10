# StealthNFT

**Wave 3/4 production build for a privacy-first NFT marketplace on Fhenix/coFHE.**

StealthNFT lets creators mint NFTs, list them with encrypted reserve prices, receive sealed offers, and settle the winning sale with threshold-network decrypt proofs. Public marketplace UX stays simple while the sensitive pricing and bidder path remains private until the seller prepares the final reveal.

## What Ships In This Version

### Wave 3

- Browser `@cofhe/sdk` integration using `createCofheConfig`, `createCofheClient`, wagmi public clients, and wallet clients.
- One-flow creator UX: metadata, mint, approval, encrypted reserve, and marketplace listing.
- Optional server-side IPFS pinning through `PINATA_JWT`; data URI metadata fallback works without external credentials.
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

## On-Chain Flow

1. Creator mints with public preview metadata and an optional private metadata commitment.
2. Creator approves the marketplace and lists with an encrypted `euint64` reserve.
3. Collectors submit sealed offers from the browser CoFHE SDK.
4. The contract compares encrypted offers and stores only the encrypted current winner.
5. Seller prepares reveal for the final buyer and offer handles.
6. Winning buyer decrypts for transaction, submits threshold signatures, pays ETH, and receives the NFT.
7. ERC-2981 royalty is paid before seller proceeds when a royalty receiver is configured.

## Contracts

- `contracts/contracts/StealthNFT.sol`
  ERC-721 with URI storage, creator tracking, and ERC-2981 token royalties.
- `contracts/contracts/StealthMarketplace.sol`
  Confidential listing, sealed offer, seller reveal, proof-verified settlement, royalty payout, and cancellation logic.

## Sepolia Deployment

| Contract | Address |
| --- | --- |
| StealthNFT | `0xF6351513BcA3d8C6e676c45852B1DB17f9C38166` |
| StealthMarketplace | `0x146199170f032954c8CcFB20C6E5827Ed9daB23f` |

Deployment metadata is stored in `contracts/deployments/sepolia.json`.

## Frontend

- `web/src/hooks/useCoFHE.ts`
  Browser CoFHE client, encrypted `uint64` inputs, permits, and decrypt-for-transaction helpers.
- `web/src/hooks/useStealthMarketplace.ts`
  Reads live token metadata, owners, listings, encrypted handles, bid counts, and reveal state.
- `web/src/components/NFTMinter.tsx`
  Mint, approve, encrypt reserve, and list flow.
- `web/src/components/NFTGrid.tsx`
  Place sealed offers, seller reveal, cancel, and buyer finalize actions.
- `web/src/app/api/metadata/route.ts`
  Metadata pinning route with `PINATA_JWT` support and safe fallback.

## Environment

### Contracts

```bash
SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io
DEPLOYER_PRIVATE_KEY=your_testnet_private_key
```

`PRIVATE_KEY` is also supported for compatibility with Fhenix starter docs.

### Web

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
npm run build
npm run dev
```

## Verification Status

- `contracts`: `npm run compile`
- `contracts`: `npm test`
- `web`: `npm run build`

See [WAVE_3_4_TODO.md](./WAVE_3_4_TODO.md) for the full checklist.

## Fhenix References

- [coFHE Client SDK overview](https://cofhe-docs.fhenix.zone/client-sdk/introduction/overview)
- [FHE library quick start](https://cofhe-docs.fhenix.zone/fhe-library/introduction/quick-start)
- [Encrypted auction pattern](https://cofhe-docs.fhenix.zone/fhe-library/examples/auction-example)
- [Decrypt result writing](https://cofhe-docs.fhenix.zone/client-sdk/guides/writing-decrypt-result)

## License

MIT
