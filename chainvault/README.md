# ChainVault

**Secure Non-Custodial Cryptocurrency Transaction Platform**

> **Development Preview — Testnet Only**  
> This platform operates exclusively on test networks. Do not use with real cryptocurrency until a full security audit and production launch are completed.

---

## What is ChainVault?

ChainVault is a non-custodial cryptocurrency transaction platform. Users connect their own external wallets (MetaMask, WalletConnect) and send/receive cryptocurrency directly — ChainVault never holds or controls user funds.

### Core Principle

Every transaction requires explicit user authorization through their external wallet. ChainVault prepares and displays the transaction; the user's wallet signs it.

---

## Features

- 🔐 Secure email + password authentication (bcrypt, HttpOnly cookies)
- 👛 MetaMask and WalletConnect integration (wagmi + viem)
- 📤 Send cryptocurrency with server-side validation
- 📥 Receive cryptocurrency via QR code + address display
- 📊 Transaction history with live status updates
- ✅ On-chain transaction receipt verification
- 🌙 Dark and light themes
- 📱 Fully responsive design
- 🛡️ SIWE (Sign-In with Ethereum) wallet verification
- 👮 Admin dashboard (monitoring only)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Blockchain | wagmi v2, viem v2, WalletConnect |
| Backend | Next.js API Routes, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | iron-session, bcrypt, SIWE, TOTP |
| Testing | Vitest |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- WalletConnect Project ID (from [cloud.reown.com](https://cloud.reown.com))

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 3. Set up the database
npx prisma migrate dev
npx prisma db seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

See `.env.example` for all required variables. Critical ones:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `IRON_SESSION_PASSWORD` | Session encryption (32+ chars) |
| `JWT_SECRET` | JWT signing secret |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Sepolia testnet RPC |

---

## Security

See `SECURITY_REPORT.md` for a complete security architecture overview, implemented controls, and known gaps.

**Never use this platform on mainnet until:**
1. Independent security audit is complete
2. Legal and compliance review is done
3. All production requirements in SECURITY_REPORT.md are addressed

---

## Testing

```bash
# Unit tests
npm run test

# Type checking
npx tsc --noEmit
```

---

## Network Support

| Network | Status |
|---------|--------|
| Ethereum Sepolia | ✅ Enabled (Testnet) |
| Polygon Amoy | ✅ Enabled (Testnet) |
| Ethereum Mainnet | ❌ Disabled (pending security audit) |
| Polygon Mainnet | ❌ Disabled (pending security audit) |

---

## License

Development preview. License to be determined before production launch.
