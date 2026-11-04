# BOND — Security Architecture Report

## Status: Development Preview (Testnet Only)

This document describes the security architecture implemented, known limitations,
and requirements before production use.

---

## Implemented Security Controls

### Authentication
- ✅ Passwords hashed with bcrypt (cost factor 12)
- ✅ Email verification before account activation
- ✅ Session management via iron-session (HttpOnly, SameSite=Strict cookies)
- ✅ Generic error messages to prevent email enumeration
- ✅ Login rate limiting (10 attempts / 15 minutes per IP)
- ✅ Registration rate limiting (5 per hour per IP)
- ✅ Brute-force detection with security event logging
- ✅ Two-factor authentication infrastructure (TOTP ready)
- ✅ Session revocation on password change

### Wallet Security
- ✅ Sign-In with Ethereum (SIWE) for wallet ownership verification
- ✅ SIWE nonces stored in database (single-use, expiry-checked)
- ✅ Replay attack prevention (nonces marked as used)
- ✅ Domain binding verification in SIWE messages
- ✅ Platform NEVER requests private keys or seed phrases
- ✅ No server-side transaction signing
- ✅ All transactions require explicit wallet authorization

### Transaction Security
- ✅ Server-side address validation with viem's isAddress + getAddress
- ✅ Token contract addresses validated against trusted static configuration only
- ✅ User-supplied contract addresses rejected
- ✅ Balance checked before transaction preparation
- ✅ Network validity checked server-side
- ✅ Transaction status verified on-chain (not trusted from client)
- ✅ Blockchain receipt verification before marking CONFIRMED
- ✅ Duplicate transaction hash prevention
- ✅ ERC-20 transfers use exact amounts (no unlimited approvals)

### API Security
- ✅ Authentication required for all protected endpoints
- ✅ Authorization checks on every route (user owns resource)
- ✅ Rate limiting on all auth endpoints
- ✅ Input validation with Zod on all API routes
- ✅ CSRF protection via SameSite=Strict cookies
- ✅ Secure HTTP headers via next.config.ts
- ✅ Content Security Policy configured
- ✅ X-Frame-Options: DENY (clickjacking protection)
- ✅ HSTS configured
- ✅ Permissions Policy restricting unused browser features

### Database Security
- ✅ Prisma ORM (parameterized queries — SQL injection protection)
- ✅ User isolation enforced at query level (userId filters)
- ✅ Session tokens hashed before storage
- ✅ No private keys or seed phrases in schema
- ✅ Audit log for all security-relevant actions
- ✅ Security event recording with severity levels

### Frontend Security
- ✅ Theme script prevents flash without XSS risk
- ✅ No sensitive data in NEXT_PUBLIC_ variables (except public RPC URLs)
- ✅ API keys not exposed in client bundles
- ✅ Reduced motion support
- ✅ Accessible form controls and error messages

---

## Known Limitations and Gaps (Must Address Before Production)

### HIGH PRIORITY
- ⚠️ **No independent security audit completed** — Required before handling real funds
- ⚠️ **2FA not fully implemented** — Infrastructure exists but flow incomplete
- ⚠️ **In-memory rate limiting** — Must be replaced with Redis in production
- ⚠️ **Email sending not wired** — SMTP integration stub only; tokens logged to console in dev
- ⚠️ **Transaction polling is inline** — Production requires a proper job queue (BullMQ, etc.)
- ⚠️ **Session token hashing incomplete** — DB session record uses placeholder; needs proper hash
- ⚠️ **No blockchain reorganization handling** — Reorg detection needed for mainnet
- ⚠️ **No emergency pause mechanism** — Required for production incident response

### MEDIUM PRIORITY
- ⚠️ **CSP nonces not implemented** — Using 'unsafe-inline'; production needs nonce-based CSP
- ⚠️ **No dependency vulnerability scanning in CI** — Must add `npm audit` to CI pipeline
- ⚠️ **No encrypted sensitive DB fields** — TOTP secrets should use application-level encryption
- ⚠️ **No key rotation mechanism** — Session secrets and JWT secrets need rotation procedure
- ⚠️ **Admin 2FA not enforced** — Admin accounts must require 2FA

### PRODUCTION REQUIREMENTS (Before Going Live)
1. ✋ Independent professional security audit by qualified firm
2. ✋ Legal and compliance review (jurisdiction-specific)
3. ✋ KYC/AML assessment (depending on jurisdiction)
4. ✋ Production infrastructure security hardening
5. ✋ Redis for session storage and rate limiting
6. ✋ Database connection pooling and access controls
7. ✋ Secure secrets management (HashiCorp Vault, AWS Secrets Manager, etc.)
8. ✋ Monitoring and alerting (Datadog, Sentry, etc.)
9. ✋ Incident response plan
10. ✋ Emergency pause / circuit-breaker mechanisms
11. ✋ Load testing and DDoS protection
12. ✋ Disaster recovery and backup procedures

---

## Testnet Configuration

Currently enabled:
- Ethereum Sepolia (Chain ID: 11155111) — Testnet ✅
- Polygon Amoy (Chain ID: 80002) — Testnet ✅

Production disabled:
- Ethereum Mainnet (Chain ID: 1) — DISABLED ❌
- Polygon Mainnet (Chain ID: 137) — DISABLED ❌

---

## Non-Custodial Architecture Verification

The platform is architecturally non-custodial:
- BOND holds no user funds at any point
- Private keys never leave the user's wallet
- Transactions signed exclusively by user's external wallet
- Platform only records public transaction data (hashes, addresses, amounts)
- Admin dashboard provides monitoring only — no fund access

---

_This report will be updated as the platform develops. It must not be used_
_as a substitute for a professional security audit._
