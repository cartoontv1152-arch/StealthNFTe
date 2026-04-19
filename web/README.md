# StealthNFT - Privacy-First NFT Marketplace

A privacy-preserving NFT marketplace built on Fhenix with Fully Homomorphic Encryption (FHE). Your NFT metadata, prices, and transactions stay encrypted on-chain.

## Features

- **Encrypted Metadata** - NFT data stays encrypted on-chain
- **Sealed Bids** - Offers are hidden until settlement
- **FHE Powered** - Compute on encrypted data without decryption
- **Selective Disclosure** - Sellers control what to reveal

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Wallet**: RainbowKit, wagmi, viem
- **Encryption**: CoFHE SDK (@cofhe/sdk)
- **Blockchain**: Fhenix (Sepolia, Arbitrum Sepolia, Base Sepolia testnets)
- **Contracts**: Solidity 0.8.28, Hardhat, OpenZeppelin

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm/bun
- WalletConnect Project ID (get from [walletconnect.com](https://walletconnect.com))

### 1. Setup Environment

```bash
# Clone and install dependencies
cd web
npm install

# Copy environment file and fill in your values
cp .env.example .env.local
```

Edit `.env.local` with your WalletConnect Project ID and RPC URLs.

### 2. Deploy Contracts (Optional for testing)

```bash
cd ../contracts

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Deploy to Sepolia testnet
npx hardhat deploy --network sepolia

# Update web/.env.local with the contract addresses
```

### 3. Run Development Server

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
StealthNFTe/
├── contracts/           # Smart contracts
│   ├── contracts/
│   │   ├── StealthNFT.sol
│   │   └── StealthMarketplace.sol
│   └── scripts/
│       └── deploy.ts
└── web/                 # Next.js application
    └── src/
        ├── app/         # Pages (page.tsx, layout.tsx)
        ├── components/  # UI components
        ├── hooks/       # React hooks (useStealthMarketplace, useCoFHE)
        └── lib/         # Utilities (contracts.ts)
```

## Pages

- **/** - Landing page with particle effects and feature showcase
- **/marketplace** - Browse and buy encrypted NFTs
- **/create** - Mint new NFTs with encrypted metadata
- **/about** - Learn about FHE and how it powers StealthNFT

## Smart Contract Flow

1. **Mint** - Create NFT with encrypted metadata URI
2. **List** - Encrypt price client-side, store on-chain
3. **Buy** - Submit encrypted offer, contract compares without decryption
4. **Settle** - Seller authorizes decryption, buyer completes purchase

## FHE Operations Used

- `FHE.asEuint64()` - Encrypt plaintext values
- `FHE.gte(a, b)` - Compare encrypted values
- `FHE.select(cond, a, b)` - Conditional selection on encrypted data
- `FHE.allowPublic()` - Authorize decryption for settlement

## Testnet Configuration

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Sepolia | 11155111 | Infura/Alchemy |
| Arbitrum Sepolia | 421614 | https://sepolia-rollup.arbitrum.io/rpc |
| Base Sepolia | 84532 | https://sepolia.base.org |

## Judge Feedback (Wave 1)

> Great use of FHE ops, new SDK & decrypt flow. Encrypting NFT metadata (not just price) would be a strong differentiation step for Wave 2.

**Wave 2 improvements implemented:**
- Full metadata encryption (name, description, attributes)
- Enhanced CoFHE integration for client-side encryption
- Improved UX with particle effects and animations

## Resources

- [Fhenix Documentation](https://docs.fhenix.io)
- [CoFHE SDK](https://www.npmjs.com/package/@cofhe/sdk)
- [Fhenix Examples](https://github.com/FhenixProtocol/awesome-fhenix)
- [Buildathon Info](./wavehachk.md)

## License

MIT