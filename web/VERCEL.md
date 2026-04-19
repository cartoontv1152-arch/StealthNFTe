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

## Build Settings

- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Node Version: 18+

## Production Checklist

1. [ ] Deploy contracts to testnet
2. [ ] Update contract addresses in env vars
3. [ ] Add WalletConnect project ID
4. [ ] Test wallet connection
5. [ ] Test NFT minting flow
6. [ ] Test buy/list flow with encryption
7. [ ] Verify particle effects working
8. [ ] Check mobile responsiveness