# Vercel Deployment Configuration

## Environment Variables

Set these in your Vercel project settings:

### Required
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect v2 project ID
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` - Sepolia RPC URL
- `NEXT_PUBLIC_MARKETPLACE_ADDRESS` - Deployed marketplace contract
- `NEXT_PUBLIC_NFT_ADDRESS` - Deployed NFT contract

### Optional
- `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL`
- `PINATA_JWT` - server-only Pinata token for IPFS metadata pinning

## Build Settings

- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Node Version: 20+

## Production Checklist

1. [ ] Deploy contracts to testnet
2. [ ] Update contract addresses in env vars
3. [ ] Add WalletConnect project ID
4. [ ] Test wallet connection
5. [ ] Test mint, approve, encrypted reserve, and list flow
6. [ ] Test sealed offer submission
7. [ ] Test seller reveal preparation
8. [ ] Test buyer finalize flow with decrypt proofs
9. [ ] Check mobile responsiveness
