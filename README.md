<p align="center">
  <img src="web/src/app/icon.svg" alt="StealthNFT favicon" width="88" />
</p>

# StealthNFT

**A privacy-first NFT marketplace on Fhenix/coFHE for encrypted reserves, sealed offers, IPFS artwork uploads, and on-chain settlement.**

StealthNFT is a Sepolia testnet product built for WaveHack. It lets creators upload artwork, mint NFTs, list them with encrypted reserve prices, accept sealed collector offers, and settle the winning sale with verifiable threshold-network decrypt proofs. The marketplace feels like a normal NFT app for users, while sensitive auction data stays encrypted on-chain until the seller intentionally prepares the final reveal.

Live app: [https://stealth-nft.vercel.app](https://stealth-nft.vercel.app)

## What The App Does

StealthNFT solves a common NFT marketplace problem: public bids and public reserve prices reveal too much information. In a normal auction, everyone can inspect seller expectations and bidder behavior. In StealthNFT, the seller's reserve and collectors' offers are encrypted with coFHE, compared on-chain, and only the winning settlement data is revealed when the listing is ready to close.

The app supports three main users:

- Creators mint NFTs, upload artwork to IPFS, set royalties, encrypt the reserve price, approve the marketplace, and list in one flow.
- Collectors connect a wallet, submit encrypted sealed offers, and finalize purchases only when they are the winning buyer.
- Sellers prepare the final reveal, close no-sale listings, reclaim expired buyer settlements, and track listing activity.

## Why Use StealthNFT

Traditional NFT marketplaces make pricing strategy public. A creator's reserve price can anchor buyers, competitors can watch collector behavior, and losing offers leave market intelligence behind. StealthNFT keeps the user experience familiar while moving the sensitive parts of the sale into encrypted on-chain state.

Use StealthNFT when you want:

- A creator-friendly mint-to-market flow without manually switching between upload tools, contract calls, and marketplace forms.
- Private reserve prices so sellers can protect their pricing strategy.
- Sealed offers so collectors can bid without exposing their exact appetite to the whole market.
- On-chain settlement with explicit proofs instead of an off-chain auction server.
- A working Fhenix/coFHE demo that shows encrypted comparisons, threshold decrypts, and real NFT escrow together.

## User Journeys

### Creator Journey

1. Connect a Sepolia wallet.
2. Upload artwork through the app; the server pins it to Pinata/IPFS.
3. Add name, description, royalty basis points, traits, and an optional private note commitment.
4. Enter the reserve price.
5. Mint the NFT, approve escrow, encrypt the reserve, and list the NFT from one screen.
6. Return to the marketplace to monitor offers, prepare a reveal, close a no-sale, or reclaim an expired settlement.

### Collector Journey

1. Browse live listings from the marketplace event index.
2. Open a listing and submit a sealed offer with the fixed bid bond.
3. Wait for the seller to prepare the reveal.
4. If selected as the winner, publish decrypt-for-transaction proofs and pay the revealed winning amount.
5. If not selected or if the listing closes with no sale, withdraw the bid bond.

## Core Features

- NFT minting with public preview metadata, optional private metadata commitment, and ERC-2981 royalties.
- Upload-only creator media flow: users choose an image file and the app pins it to Pinata/IPFS before minting.
- Encrypted reserve prices using browser-side `@cofhe/sdk` input encryption.
- Sealed encrypted offers with on-chain encrypted comparison via `FHE.gte`, `FHE.and`, and `FHE.select`.
- Winner-only reveal flow: losing bidders are not decrypted during settlement.
- Proof-verified buyer finalization with `decryptForTx(...).withoutPermit()` and `FHE.publishDecryptResult`.
- Fixed `0.001 ETH` bid bond to reduce spam, refund losing/no-sale bidders, and compensate sellers when a winning buyer expires.
- Seller recovery paths for no-sale listings, expired reveals, and safe cancellation before bids.
- Live event indexer for minted tokens, listings, offers, reveal preparation, settlement, cancellation, no-sale close, and expired reclaim events.
- Pinata/IPFS upload routes for artwork and metadata.
- Marketplace filters, analytics summary, activity feed, notification center, responsive UI, and production Vercel deployment.

## How It Works

1. A creator uploads artwork, prepares metadata, and mints an ERC-721 token.
2. The creator chooses a reserve price, and the browser encrypts it into a coFHE `euint64` input.
3. The creator approves and lists the NFT in `StealthMarketplace`.
4. Collectors encrypt sealed offers locally in the browser and submit them on-chain with a refundable bid bond.
5. The contract compares encrypted offers against the encrypted reserve and current encrypted winner.
6. No plaintext reserve or losing offer is published during bidding.
7. When bidding is ready to settle, the seller prepares the public reveal handles for the encrypted winner and winning offer.
8. The winning buyer obtains decrypt-for-transaction proofs, submits them to the contract, pays ETH, and receives the NFT.
9. Royalties are paid before seller proceeds when a royalty receiver is configured.
10. If no offer met reserve, the seller proves the pending buyer is zero and closes the listing.
11. If the winning buyer does not settle within the grace period, the seller reclaims the NFT and receives the winner's bid bond.

## Privacy Model

StealthNFT is designed to keep bidding information private until settlement:

- Reserve prices are encrypted before they enter the marketplace contract.
- Offers are encrypted client-side and submitted as encrypted handles.
- The contract updates the current winner with FHE comparisons instead of plaintext logic.
- Losing bidders and losing offer amounts are not revealed by the settlement path.
- A below-reserve no-sale reveals only that no valid winner exists, not the reserve price.
- Private metadata is stored as a commitment, not as recoverable hidden plaintext.

Important limitation: final settlement intentionally reveals the winning buyer and winning offer so the sale can be verified and paid on-chain.

## Architecture

| Layer | Technology | Purpose |
| --- | --- | --- |
| Web app | Next.js, React, wagmi, viem | Minting, listing, marketplace, wallet actions, and hosted API routes |
| Confidential compute | Fhenix/coFHE SDK and Solidity library | Browser encryption, encrypted comparisons, decrypt-for-transaction proofs |
| Contracts | Solidity, Hardhat, OpenZeppelin | ERC-721 NFT, royalties, confidential marketplace, settlement, recovery paths |
| Storage | Pinata/IPFS | Artwork and token metadata pinning |
| Indexing | Next.js API route with viem logs | Marketplace history, activity feed, and token/listing state |
| Deployment | Vercel and Sepolia | Hosted frontend and live testnet contracts |

## Contracts

- `contracts/contracts/StealthNFT.sol`
  ERC-721 with URI storage, creator tracking, and ERC-2981 token royalties.
- `contracts/contracts/StealthMarketplace.sol`
  Confidential listing, sealed offers, encrypted winner tracking, proof-verified settlement, bid bonds, royalty payout, no-sale close, expired reveal reclaim, and cancellation logic.

## Sepolia Deployment

| Contract | Address |
| --- | --- |
| StealthNFT | `0x0b5fEf198Ca8768b29d1fdb0cc47d756D309164B` |
| StealthMarketplace | `0xA890928d677bB01041cd229F9004F09755dac880` |

Deployment metadata is stored in `contracts/deployments/sepolia.json`.

| Field | Value |
| --- | --- |
| Network | Sepolia |
| Chain ID | `11155111` |
| Deployment block | `10966950` |
| NFT deployment tx | `0xa4df472a65efd7a8f94635a03cde7d7068474e98c2f54a032e8eb26013103a57` |
| Marketplace deployment tx | `0xae78ceb838faed263f9283711aaec6c90e5318c2630004f60f873bbec1ba6a42` |

## Project Structure

```text
contracts/
  contracts/              Solidity contracts
  scripts/                Deploy, verify, and live smoke scripts
  test/                   Hardhat/coFHE marketplace tests
  deployments/            Network deployment metadata

web/
  src/app/                Next.js pages and API routes
  src/components/         Marketplace, minter, nav, notifications, activity UI
  src/hooks/              coFHE and marketplace data hooks
  src/lib/                Contract ABIs, metadata helpers, indexer, Pinata, rate limiting
  scripts/                Env validation and production start wrapper
```

## Main Frontend Files

- `web/src/components/NFTMinter.tsx`
  Creator flow for metadata, media upload, minting, approval, reserve encryption, and listing.
- `web/src/components/NFTGrid.tsx`
  Marketplace cards, sealed offers, reveal preparation, no-sale close, expired reclaim, bid-bond withdrawal, and buyer finalization.
- `web/src/hooks/useCoFHE.ts`
  coFHE client setup, encrypted input generation, and decrypt-for-transaction helpers.
- `web/src/hooks/useStealthMarketplace.ts`
  Live NFT/listing loader from deployed contracts and indexer data.
- `web/src/app/api/indexer/marketplace/route.ts`
  Hosted event indexer for marketplace state and activity.
- `web/src/app/api/upload/route.ts`
  Required image upload route backed by Pinata/IPFS.
- `web/src/app/api/metadata/route.ts`
  Metadata pinning route with bounded data URI fallback.

## Environment

Do not commit real secrets. Local env files are ignored by git.

### Contracts

```bash
SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io
DEPLOYER_PRIVATE_KEY=your_testnet_private_key

# Optional for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

`PRIVATE_KEY` is also supported for compatibility with Fhenix starter docs.

### Web

```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.ethpandaops.io
NEXT_PUBLIC_NFT_ADDRESS=0x0b5fEf198Ca8768b29d1fdb0cc47d756D309164B
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xA890928d677bB01041cd229F9004F09755dac880
NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK=10966950

# Server-only Pinata credentials.
# The app prefers API key/secret when present and falls back to JWT.
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
PINATA_JWT=your_pinata_jwt

# Optional indexer tuning
INDEXER_BLOCK_CHUNK=10000
```

## Running Locally

Install and test contracts:

```bash
cd contracts
npm install
npm run compile
npm test
```

Run the web app:

```bash
cd web
npm install
npm run validate:env
npm run dev
```

Production-style web check:

```bash
cd web
npm run release:check
npm run start -- -p 3001
```

Live Sepolia smoke test:

```bash
cd contracts
npm run smoke:sepolia
```

## Deployment

The production frontend is deployed on Vercel:

- Production URL: [https://stealth-nft.vercel.app](https://stealth-nft.vercel.app)
- Build command: `npm run build`
- Root directory: `web`

Required Vercel environment variables:

- `NEXT_PUBLIC_SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_NFT_ADDRESS`
- `NEXT_PUBLIC_MARKETPLACE_ADDRESS`
- `NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK`
- `PINATA_API_KEY`
- `PINATA_API_SECRET`

Optional Vercel environment variables:

- `PINATA_JWT`
- `INDEXER_BLOCK_CHUNK`

## Verification Status

- `contracts`: `npm run compile` passed
- `contracts`: `npm test` passed
- `contracts`: Sepolia live smoke passed for no-sale bid-bond withdrawal and winning sale finalization
- `web`: `npm run lint` passed
- `web`: `npm run build` passed
- `web`: `npm run release:check` passed
- `web`: `npm audit --omit=dev` passed with 0 vulnerabilities
- Hosted `/api/indexer/marketplace` returns the live event index
- Hosted `/api/upload` and `/api/metadata` pin to IPFS through Pinata
- Browser smoke passed on `/create` and `/marketplace`

## Production Notes

- This is deployed for Sepolia testnet use. Mainnet deployment should use fresh wallets, fresh Pinata credentials, verified contracts, and a production RPC provider with rate limits suitable for public traffic.
- The app does not require an OpenAI API key.
- Creator artwork uploads require valid server-side Pinata credentials; the UI no longer asks users to paste image URLs.
- The deployer private key is only needed for contract deployment and smoke scripts. It is not needed by the web app.
- If contracts are redeployed, update `contracts/deployments/sepolia.json`, Vercel env vars, and the web env addresses together.
- If the Vercel project is not connected to a Git repository, branch-scoped Preview env vars cannot be configured from the Vercel CLI.

## Fhenix References

- [coFHE Client SDK overview](https://cofhe-docs.fhenix.zone/client-sdk/introduction/overview)
- [FHE library quick start](https://cofhe-docs.fhenix.zone/fhe-library/introduction/quick-start)
- [Encrypted auction pattern](https://cofhe-docs.fhenix.zone/fhe-library/examples/auction-example)
- [Decrypt result writing](https://cofhe-docs.fhenix.zone/client-sdk/guides/writing-decrypt-result)

## License

MIT
