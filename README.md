# StealthNFT

**StealthNFT** is a confidential NFT marketplace demo on **Ethereum Sepolia** using **Fhenix CoFHE**: listing prices and buyer offers are encrypted on-chain (`euint64`), and the marketplace contract compares them with **`FHE.gte`** without revealing plaintext amounts. Settlement uses the standard **decrypt-with-proof** flow (threshold decrypt off-chain, then `finalizeSale` on-chain).

This repository is structured for production-style deployment:

- **`web/`** — Next.js 15 app (App Router): black & white UI, **Clerk** (sign-in), **RainbowKit + wagmi** (wallet), **@cofhe/sdk** (encrypt / decrypt).
- **`contracts/`** — Hardhat + `@fhenixprotocol/cofhe-contracts`: **StealthNFT** (ERC-721) and **StealthMarketplace** (FHE listing + escrow + settlement).

demo- 

## What problem does this solve?

Public NFT marketplaces expose **listing and bid prices**, which enables **price manipulation**, **whale tracking**, and **strategy copying**. StealthNFT keeps **NFT metadata and ownership visible** while treating **price and offer amounts as encrypted handles**, and only the **FHE program** evaluates whether an offer clears the ask—using homomorphic comparison, not a public `require(price <= offer)` on plaintext.

## Architecture (high level)

| Layer | Role |
|--------|------|
| **Ethereum Sepolia** | Hosts ERC-721 + marketplace contracts; CoFHE coprocessor integrates with this chain per Fhenix docs. |
| **CoFHE** | Client encrypts inputs with ZK proofs; chain stores ciphertext handles; threshold network decrypts when allowed (e.g. after `allowPublicBuyer`). |
| **Next.js** | UI, Clerk sessions, wallet connection, CoFHE client lifecycle (browser-only). |
| **Clerk** | User accounts for gated routes (e.g. **My listings**). |

> **Note:** You asked for “login using flro” in the brief — this project uses **Clerk** for app login. If you meant a different provider, swap the Clerk pieces for your stack.

## Core flows

### Seller

1. Connect wallet on **Sepolia** (RainbowKit).
2. **Mint** a demo NFT (`/mint`) with a picsum image seed.
3. Open the token page (`/nft/[id]`), enter an **ask** in ETH, **Approve & list**. The UI encrypts the wei amount (fits `uint64`) and calls `listNFT(tokenId, InEuint64)`.
4. Optionally **cancel** if no bids yet.

### Buyer

1. Browse **Marketplace** — sees art and token id, **not** the listing price.
2. On the token page, submit an **encrypted offer** (`buyNFT`).
3. Seller calls **`allowPublicBuyer`** so the encrypted winner can be decrypted off-chain.
4. Buyer runs **decrypt** (`decryptForTx` via CoFHE SDK) and calls **`finalizeSale`** with the proof + **ETH** to the seller (settlement value is visible in that transaction—typical for ETH transfer demos).

### Optional: reveal listing price

Seller can call **`allowPublicPrice`** on-chain (see contract) for selective disclosure after the fact.

## Smart contracts

- **`StealthNFT`**: `mint(to, uri)`, `totalSupply`, ERC-721 URI storage.
- **`StealthMarketplace`**: holds NFT in escrow while listed; `listNFT`, `buyNFT` (FHE.gte + `FHE.select` on `eaddress` pending buyer), `allowPublicBuyer`, `finalizeSale`, `cancelListing`.

**Price type:** `euint64` in **wei** (demo cap ~18.4 ETH per `uint64` max).

## Deploy contracts (Sepolia)

```bash
cd contracts
cp .env.example .env
# Edit .env: SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY

npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy the printed `NEXT_PUBLIC_*` addresses into `web/.env.local`.

## Run the web app

```bash
cd web
cp .env.example .env.local
# Fill Clerk keys, WalletConnect project id, contract addresses

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production checklist

- [ ] Use a real IPFS or HTTP gateway for `tokenURI` (not only picsum).
- [ ] Set `NEXT_PUBLIC_LOGS_FROM_BLOCK` to your deployment block to speed up logs.
- [ ] Rotate keys; never commit `.env` or `.env.local`.
- [ ] Deploy `web` to Vercel (or similar) with env vars; use a stable Sepolia RPC.

## Fhenix documentation

Use the official CoFHE docs for encryption, ACL, and decrypt patterns: [Fhenix CoFHE documentation](https://cofhe-docs.fhenix.zone).

## License

MIT (see individual contract SPDX headers).
