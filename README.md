# StealthNFT

**StealthNFT** is a confidential NFT marketplace demo on **Ethereum Sepolia** using **Fhenix CoFHE**. Listing prices and buyer offers are encrypted on-chain (`euint64` handles); the marketplace contract compares them with **`FHE.gte`** without revealing plaintext amounts. Settlement uses **decrypt-with-proof** (threshold decrypt off-chain, then `finalizeSale` on-chain).

## Product

Public marketplaces expose **bids and asks**, which enables **front-running**, **whale tracking**, and **strategy copying**. StealthNFT keeps **NFT metadata and ownership** visible while **price and offer amounts** stay as **ciphertext handles** until the protocol allows decryption for settlement.

| Visible on-chain | Hidden / encrypted |
|------------------|-------------------|
| Token URI, ownership transfers, that a listing exists | Plaintext listing price and offer |
| Marketplace events (list, attempt, sale) without amounts | Comparison via FHE on ciphertexts |

## Stack

| Piece | Role |
|--------|------|
| **Next.js 15** (App Router) | UI, metadata, `/sign-in` & `/sign-up` hosted Clerk pages, drawer shell |
| **Clerk** | Auth; **My listings** (`/listings`) protected by middleware |
| **RainbowKit + wagmi + viem** | Wallet, Sepolia, contract calls |
| **@cofhe/sdk** | Encrypt inputs, decrypt for txs with proofs |
| **Solidity** (`contracts/`) | `StealthNFT` ERC-721 + `StealthMarketplace` FHE listing / escrow |

## Repository layout

- **`web/`** — Next.js app: `AppShell` (top bar + drawer), `SiteFooter`, Sonner toasts, Sepolia network banner, CoFHE provider.
- **`contracts/`** — Hardhat + `@fhenixprotocol/cofhe-contracts`: deploy to Sepolia, paste addresses into `web/.env.local`.

## Environment variables (`web/`)

Copy `web/.env.example` to `web/.env.local` and fill values.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes (for auth UI) | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes (server / middleware) | Clerk secret — **never commit** |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Optional | Defaults to `/sign-in`; set full Vercel URL in production if needed |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Optional | Defaults to `/sign-up` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | [WalletConnect Cloud](https://cloud.walletconnect.com) project id |
| `NEXT_PUBLIC_NFT_ADDRESS` | After deploy | StealthNFT proxy address on Sepolia |
| `NEXT_PUBLIC_MARKETPLACE_ADDRESS` | After deploy | StealthMarketplace proxy address on Sepolia |
| `NEXT_PUBLIC_LOGS_FROM_BLOCK` | Optional | Deployment block; speeds up **Activity** event queries |

**Clerk dashboard:** under **Paths** and **Allowed redirect URLs**, include `https://<your-domain>/sign-in`, `https://<your-domain>/sign-up`, and preview URLs if you use Vercel previews.

Contracts deploy (reference): set `SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` in `contracts/.env` (see `contracts/.env.example` if present).

## Local development

```bash
cd web
cp .env.example .env.local
# Add Clerk, WalletConnect, and (after deploy) contract addresses

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy contracts (Sepolia)

```bash
cd contracts
# Configure .env: SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY

npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy printed addresses into `web/.env.local` as `NEXT_PUBLIC_NFT_ADDRESS` and `NEXT_PUBLIC_MARKETPLACE_ADDRESS`.

## Deploy frontend (Vercel)

- Set **Root Directory** to `web/` (or monorepo equivalent).
- Add the same env vars as in the table above in the Vercel project settings.
- Redeploy after changing Clerk or contract addresses.

## User flows

1. **Connect** wallet on **Sepolia**; optional **Sign in** with Clerk for `/listings`.
2. **Mint** (`/mint`) a demo NFT (picsum image by seed).
3. **List** from `/nft/[id]`: approve marketplace, **encrypt** ask, `listNFT`.
4. **Buy**: open listing, submit **encrypted offer** (`buyNFT`).
5. **Settle**: seller **`allowPublicBuyer`** → buyer **decrypts** off-chain → **`finalizeSale`** with proof + settlement ETH.

## Security

- **Never commit** `.env`, `.env.local`, or private keys. Rotate keys if exposed.
- Treat this repo as a **testnet demo**; audit contracts before mainnet.
- Keep **Next.js** and dependencies updated; review security advisories for your stack.

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Middleware **500** / Clerk errors | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` set on Vercel; middleware skips Clerk when keys missing (dev fallback). |
| **Wrong network** | Connect wallet to **Sepolia** (chain id `11155111`); app shows a banner when connected on another chain. |
| **Empty marketplace** | Deploy contracts, set env addresses, mint + list from token page. |
| **Activity slow / timeout** | Set `NEXT_PUBLIC_LOGS_FROM_BLOCK` to your deployment block. |
| **CoFHE / IndexedDB** in build logs | SDK may log during static generation; build can still succeed. |

## Documentation

- **Fhenix CoFHE:** [cofhe-docs.fhenix.zone](https://cofhe-docs.fhenix.zone)

## License

MIT (see SPDX headers in contract files).
