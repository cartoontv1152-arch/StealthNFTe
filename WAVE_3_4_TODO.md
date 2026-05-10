# Wave 3/4 Production TODO

## Release Status

- [x] Wave 3 is complete and production-ready for Sepolia testnet use.
- [x] Wave 4 is complete and production-ready for Sepolia testnet use.
- [x] UI has been simplified and polished for the final Wave 3/4 release.
- [x] Latest Sepolia contracts are deployed and wired into the app.

## Wave 3 - Production Features

- [x] Replace mock price encryption with the browser `@cofhe/sdk` client lifecycle.
- [x] Use live wagmi/viem public and wallet clients for encrypted contract inputs.
- [x] Add one-flow mint, approve, encrypt reserve, and list UX.
- [x] Add optional server-side IPFS metadata pinning via `PINATA_JWT` with data URI fallback.
- [x] Add ERC-2981 creator royalty support to the NFT contract.
- [x] Replace demo marketplace data with on-chain token/listing indexing.
- [x] Add focused production UI with clearer listing, offer, reveal, and settlement states.

## Wave 4 - Advanced Privacy

- [x] Track the encrypted winning offer and encrypted pending buyer on-chain.
- [x] Keep losing bidders private by revealing only the final encrypted winner handle.
- [x] Require threshold-network decrypt proofs for both buyer and winning offer during settlement.
- [x] Require buyer payment to be at least the decrypted winning offer.
- [x] Add seller-controlled reveal preparation through `FHE.allowPublic`.
- [x] Add buyer-side finalize flow using `decryptForTx(...).withoutPermit()`.
- [x] Add cancel protection once sealed offers exist.

## Verification

- [x] `contracts`: `npm run compile`
- [x] `contracts`: `npm test`
- [x] `web`: `npm run lint`
- [x] `web`: `npm run build`
- [x] Sepolia deployment with updated contract addresses
- [x] Browser and Chrome extension smoke test against the deployed Wave 4 contracts
- [x] Live Sepolia read confirms deployed bytecode, marketplace NFT pointer, ERC-2981 read, and settlement grace period

## Audit Hardening

- [x] Block new sealed offers after seller reveal preparation.
- [x] Add no-sale close path when all offers are below reserve.
- [x] Add seller reclaim path after the settlement grace period.
- [x] Add regression coverage for late bids, no-sale close, and expired reveal reclaim.

## Wave 5 Backlog

- [ ] Production indexing service for large collections and historical marketplace events.
- [ ] Full hosted deployment pipeline with environment validation and release checks.
- [ ] Richer creator media upload flow with first-class IPFS/file picker UX.
- [ ] Advanced bidder notifications for reveal-ready and settlement-deadline states.
- [ ] Marketplace analytics, activity feed, and collection-level filtering.
- [ ] Optional contract verification automation for each supported testnet/mainnet.
