# StealthNFT - Privacy-First NFT Marketplace on Fhenix

**Buildathon Wave 2 Submission**

StealthNFT is a privacy-preserving NFT marketplace built on Fhenix testnet using Fully Homomorphic Encryption (FHE). Our platform enables users to create, list, and trade NFTs with fully encrypted metadata and prices - no one can see your data unless you choose to reveal it.

## What is StealthNFT?

StealthNFT solves the privacy problem in NFT marketplaces. In traditional marketplaces, all listing prices, bids, and metadata are publicly visible on-chain. This creates several issues:

- **MEV Vulnerability**: Front-runers can see your bids and outbid you
- **No Privacy**: Competitors can see your pricing strategy
- **Forced Transparency**: Some data should remain private until settlement

Our solution uses FHE to keep prices and metadata encrypted throughout the entire transaction lifecycle.

## How It Works

### Core Flow

1. **Mint NFT** - Create an NFT with encrypted metadata (name, description, image, attributes)
2. **List with Encrypted Price** - Encrypt your asking price client-side using FHE
3. **Sealed Bids** - Buyers submit encrypted offers; the contract compares them without decryption
4. **Settlement** - Seller authorizes decryption of winning buyer; transaction completes on-chain

### Technical Implementation

```
User Action           ->  Client-side FHE  ->  Encrypted Data  ->  On-chain Storage
                                            (prices/bids stay encrypted)
                                    
Seller Authorizes     ->  Threshold Network  ->  Decryption Proof  ->  Settlement
```

### FHE Operations Used

| Operation | Smart Contract Function |
|-----------|------------------------|
| Encrypt | `FHE.asEuint64()` |
| Compare | `FHE.gte(offer, price)` |
| Select Winner | `FHE.select(condition, winner, loser)` |
| Authorize Reveal | `FHE.allowPublic(encryptedValue)` |
| Verify Decrypt | `FHE.getDecryptResultSafe()` |

## Features (Wave 2)

### Smart Contracts
- **StealthNFT.sol**: ERC-721 with metadata storage
- **StealthMarketplace.sol**: FHE-powered marketplace with encrypted prices/bids

### Frontend
- **Particle Effects Hero**: Animated floating particles with glowing elements
- **Glass Morphism UI**: Modern transparent design with blur effects
- **NFT Grid**: Hover animations, encrypted badges, modal details
- **Mint Form**: Full metadata encryption, attribute support
- **Multi-chain Support**: Sepolia, Arbitrum Sepolia, Base Sepolia

### Wave 1 Judge Feedback
> "Great use of FHE ops, new SDK & decrypt flow. Encrypting NFT metadata (not just price) would be a strong differentiation step for Wave 2."

**Implemented from feedback:**
- Full metadata encryption (name, description, image, price, attributes)
- Enhanced UI with particle effects and animations
- Improved UX flow for encrypted transactions

## Deployment

### Deployed Contracts (Sepolia Testnet)

| Contract | Address |
|----------|---------|
| StealthNFT | `0xa60CBf3A438Dc82751362a2E9b3F5D95Da812099` |
| StealthMarketplace | `0x5a0bc72F4794fb04a28d7d2eE42fc6ec3EBD71Ce` |

### Links

- **Live App**: Open `web/` folder and run `npm run dev`
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Fhenix Docs**: https://docs.fhenix.io

## Project Structure

```
StealthNFTe/
├── contracts/           # Smart contracts
│   ├── contracts/
│   │   ├── StealthNFT.sol
│   │   └── StealthMarketplace.sol
│   ├── scripts/deploy.ts
│   └── hardhat.config.ts
└── web/                 # Next.js frontend
    └── src/
        ├── app/
        │   ├── page.tsx          # Landing + hero
        │   ├── marketplace/      # Browse NFTs
        │   ├── create/          # Mint NFT
        │   └── about/           # FHE explanation
        ├── components/
        │   ├── ParticleField.tsx # Animated particles
        │   ├── Hero.tsx         # Hero section
        │   ├── NFTGrid.tsx      # NFT marketplace
        │   └── NFTMinter.tsx    # Mint form
        └── hooks/
            ├── useStealthMarketplace.ts
            ├── useNFT.ts
            └── useCoFHE.ts
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Wallet | RainbowKit v2, wagmi v2, viem |
| Encryption | CoFHE SDK (@cofhe/sdk) |
| Blockchain | Fhenix (Sepolia, Arbitrum Sepolia, Base Sepolia) |
| Contracts | Solidity 0.8.28, Hardhat, OpenZeppelin |

## Future Waves (Roadmap)

### Wave 3 - Production Features
- Real CoFHE SDK integration (with proper browser context)
- WalletConnect v2 with official project ID
- IPFS for decentralized metadata storage
- Royalty system for creators

### Wave 4 - Advanced Privacy
- Shielded transactions for complete privacy
- Reveal-only-on-win encrypted bidding
- ERC-1155 multi-token support
- Fractional ownership with FHE

### Wave 5 - Enterprise
- Gasless meta-transactions
- Layer 2 scaling optimization
- Oracle integration for real-time price feeds
- Confidential DAO governance

## Setup Instructions

```bash
# 1. Install dependencies
cd web && npm install
cd ../contracts && npm install

# 2. Deploy contracts (already done)
npx hardhat run scripts/deploy.ts --network sepolia

# 3. Update web/.env.local with contract addresses

# 4. Run development server
cd web && npm run dev
```

## Environment Variables

### Contracts (.env)
```
SEPOLIA_RPC_URL=your_rpc_url
DEPLOYER_PRIVATE_KEY=your_private_key
```

### Web (.env.local)
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_rpc_url
NEXT_PUBLIC_NFT_ADDRESS=deployed_nft_address
NEXT_PUBLIC_MARKETPLACE_ADDRESS=deployed_marketplace_address
```

## Resources

- [Fhenix Documentation](https://docs.fhenix.io)
- [CoFHE SDK](https://www.npmjs.com/package/@cofhe/sdk)
- [Fhenix Examples](https://github.com/FhenixProtocol/awesome-fhenix)
- [Buildathon Info](./wavehachk.md)

## License

MIT