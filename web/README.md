# StealthNFT - Privacy-First NFT Marketplace

A privacy-preserving NFT marketplace built on Fhenix with Fully Homomorphic Encryption (FHE). Your NFT metadata, prices, and transactions stay encrypted on-chain.

## Wave 1 vs Wave 2 Progress

### Wave 1 - Initial Implementation
- Basic NFT marketplace with encrypted prices
- FHE operations for comparing encrypted values
- Decrypt flow for settlement

**Judge Feedback:** "Great use of FHE ops, new SDK & decrypt flow. Encrypting NFT metadata (not just price) would be a strong differentiation step for Wave 2."

### Wave 2 - Current Implementation

#### Smart Contract Enhancements
- Added `PriceRevealed` and `BuyerRevealed` events for transparency
- Added `getPriceHandle()` and `getBuyerHandle()` view functions for encrypted state inspection
- Improved error handling and event logging

#### Frontend Enhancements
- **Hero Section**: Particle effects with floating animated particles, gradient backgrounds, and glowing elements
- **UI/UX**: Glass-morphism design, animated gradients, smooth transitions
- **Marketplace**: NFT grid with hover effects, modal details, encrypted badge badges
- **Create Page**: Full NFT minting form with metadata encryption, attribute support
- **About Page**: Educational FHE content with interactive examples

#### Technical Improvements
- CoFHE SDK integration for client-side encryption
- wagmi v2 + RainbowKit v2 integration with custom dark theme
- Multi-chain support (Sepolia, Arbitrum Sepolia, Base Sepolia)
- Type-safe contract interactions

## Features

- **Encrypted Metadata** - NFT data (name, description, image, price, attributes) encrypted on-chain
- **Sealed Bids** - Offers are hidden until settlement
- **FHE Powered** - Compute on encrypted data without decryption
- **Selective Disclosure** - Sellers control what to reveal
- **Particle Effects** - Animated hero section with floating particles
- **Glass UI** - Modern glass-morphism design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Wallet**: RainbowKit v2, wagmi v2, viem
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
        ├── components/  # UI components (Navigation, Hero, ParticleField, NFTGrid, NFTMinter)
        ├── hooks/       # React hooks (useStealthMarketplace, useNFT, useCoFHE)
        └── lib/         # Utilities (contracts.ts)
```

## Pages

- **/** - Landing page with particle effects and feature showcase
- **/marketplace** - Browse and buy encrypted NFTs with modal details
- **/create** - Mint new NFTs with encrypted metadata and attributes
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
- `FHE.publishDecryptResult()` - Publish decryption result on-chain
- `FHE.getDecryptResultSafe()` - Verify decryption result

## Future Waves (Production Readiness)

### Wave 3 - Production Features
- Real CoFHE SDK integration (currently using mock for build)
- WalletConnect v2 setup with proper project ID
- IPFS integration for decentralized metadata storage
- Royalty system for creators

### Wave 4 - Advanced Privacy
- Shielded transactions for privacy-preserving swaps
- Encrypted bidding with reveal-only-on-win
- Multi-token support (ERC-1155)
- Fractional ownership with FHE

### Wave 5 - Enterprise Features
- Gasless transactions (meta-transactions)
- Layer 2 scaling support
- Oracle integration for price feeds
- Governance with confidential voting

## Testnet Configuration

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Sepolia | 11155111 | Infura/Alchemy |
| Arbitrum Sepolia | 421614 | https://sepolia-rollup.arbitrum.io/rpc |
| Base Sepolia | 84532 | https://sepolia.base.org |

## Environment Variables

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_rpc_url
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=your_rpc_url
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=your_rpc_url
NEXT_PUBLIC_NFT_ADDRESS=deployed_nft_contract
NEXT_PUBLIC_MARKETPLACE_ADDRESS=deployed_marketplace_contract
```

## Resources

- [Fhenix Documentation](https://docs.fhenix.io)
- [CoFHE SDK](https://www.npmjs.com/package/@cofhe/sdk)
- [Fhenix Examples](https://github.com/FhenixProtocol/awesome-fhenix)
- [Buildathon Info](./wavehachk.md)

## License

MIT