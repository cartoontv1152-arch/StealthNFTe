# Vercel Deployment Configuration

## Environment Variables

Set these in your Vercel project settings:

### Required
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` - Sepolia RPC URL
- `NEXT_PUBLIC_MARKETPLACE_ADDRESS` - Deployed marketplace contract
- `NEXT_PUBLIC_NFT_ADDRESS` - Deployed NFT contract
- `NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK` - first block to scan for marketplace history (`10966950` for the current Sepolia deployment)

### Optional
- `PINATA_JWT` - server-only Pinata token for IPFS metadata pinning
- `PINATA_API_KEY` and `PINATA_API_SECRET` - server-only Pinata fallback credentials when JWT is unavailable or invalid
- `INDEXER_BLOCK_CHUNK` - event log chunk size for hosted index reads

## Build Settings

- Framework: Next.js
- Build Command: `npm run release:check`
- Output Directory: `.next`
- Node Version: 20+

## Production Checklist

1. [x] Deploy contracts to Sepolia testnet
2. [x] Update contract addresses in env vars
3. [x] Confirm injected browser wallet connection on Sepolia
4. [x] Add environment validation and release checks
5. [x] Test wallet connection path
6. [x] Test mint, approve, encrypted reserve, and list flow
7. [x] Test sealed offer submission
8. [x] Test seller reveal preparation
9. [x] Test buyer finalize flow with decrypt proofs
10. [x] Check mobile responsiveness with screenshots
