# SuiCred

SuiCred builds a reputation score from a Sui wallet’s on-chain history and DeFi activity. Scores can be minted for 1 SUI, with payment routed to the treasury.

## Features
- Sui wallet connect
- On-chain + DeFi scoring
- Animated “airdrop” style score reveal
- Twitter OAuth (backend included)
- Mintable SuiCred badge (1 SUI)

## Quick Start
```bash
npm install
npm run dev
```

## Twitter OAuth
Create a `.env` file:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_SESSION_SECRET=change_me
```

## Move Contract
Publish the package, then set `SUICRED_PACKAGE_ID` in `lib/config.ts`:
```bash
sui client publish move/suicred
```

## Notes
- DeFi protocol detection uses partial package ID matching in `lib/sui.ts`. Update for production accuracy.
- Roadmap: swap + portfolio tools.
