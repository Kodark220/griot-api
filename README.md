# Griot API — Creator payment platform for AI citations

Stack: Arc Testnet + Supabase + Express.js

## Quick Start

```bash
npm install
cp .env.example .env   # Fill in your keys
npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/registry/register` | Register content (paywall or citation) |
| GET | `/api/registry/check?url=` | Check if URL is registered + price |
| GET | `/api/registry/creator/:id` | Creator dashboard with earnings |
| GET | `/api/read/:slug` | x402 payment gate (returns 402 or content) |
| POST | `/api/verify` | Verify a payment receipt on Arc |
| POST | `/api/pay` | Execute USDC payment to creator |
| POST | `/api/fetch-content` | Fetch + strip HTML from a URL |
| GET | `/api/health` | Health check |

## x402 Payment Flow

```
Agent → GET /api/read/:slug
Server ← 402 Payment Required (with payment details in JSON body)
Agent pays USDC on Arc Testnet → gets tx hash
Agent → GET /api/read/:slug (with X-Payment-Receipt header)
Server verifies tx hash on Arc RPC → serves content
```

## Environment Variables

```
ARC_RPC_URL=https://rpc.testnet.arc.network
ARC_CHAIN_ID=5042002
USDC_CONTRACT=0x3600000000000000000000000000000000000000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

## Circle Wallet (for real payments)

See `scripts/faucet.js` for wallet creation, balance checks, and USDC transfers.

## Supabase Schema

Run `supabase/migrations/001_init.sql` in your Supabase SQL Editor.

## Deploy

```bash
flyctl launch
flyctl deploy
```
