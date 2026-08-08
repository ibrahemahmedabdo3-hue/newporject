# OTPProvider — Starter Platform

A working Next.js + Prisma + PostgreSQL foundation for the OTPProvider
communication-API aggregation platform: auth, RBAC, wallet ledger, a
generic (name-agnostic) payment-gateway system, a generic provider-adapter
architecture for SMS/OTP/Voice/WhatsApp/Email, EN/AR with RTL, an
admin-moderated animated news ticker, and dynamic contact settings.

## ⚠️ Honest scope note

This is a **real, functioning core**, not the entire 90-section spec built
out in full. What's genuinely working:

- Auth (credentials + optional Google OAuth), JWT sessions, role-based route
  protection in `src/middleware.ts`
- RBAC: permissions catalogue (`src/lib/rbac.ts`), seeded roles, server-side
  enforcement on every sensitive API route
- Wallet: ledger-only balance changes (`src/app/api/wallet/adjust`)
- Provider adapter pattern with a real Twilio implementation + routing
  engine with automatic failover (`src/providers/`)
- Generic payment gateway system — admin adds/enables/disables ANY gateway
  by name, no vendor hardcoded (`src/payments/`, `/admin/settings/payments`)
- EN/AR i18n + RTL, animated hero, animated site-wide news ticker with an
  Admin/Support/Marketing → Admin-approval workflow (`/admin/news`)
- Dynamic contact settings (email + WhatsApp per department) driving the
  public `/contact` page and `wa.me` links
- Prisma schema covering the wider domain (CRM, support tickets, invoices,
  audit log, etc.) so you can build those modules without re-architecting
  the database

**Now also working** (added in this pass): Support ticketing (`/support`,
customer + agent view, internal notes), Sales CRM (`/sales` pipeline +
leads, discount approval gated to Admin), Marketing Hub with a real
Draft → Submit → Approve/Reject workflow (`/marketing`, `/admin/marketing`),
Diagnostics with a real "Discover Errors" scan (DB connectivity, provider
health, payment gateway config, wallet-ledger consistency) and a safe,
audited "Fix Now" auto-fix (`/admin/diagnostics`), Meetings with real
external URLs only (`/admin/meetings`), Internal chat scoped to employees
only (`/admin/chat`), a real Audit Log viewer (`/admin/audit`), Admin
Users/Roles management with a live permission matrix (`/admin/users`,
`/admin/roles`), the Developer Portal with real API key issuance
(`/developer`), a Finance wallet overview (`/finance`), System Settings
(`/admin/settings`) for company info including the Hong Kong address, and
a live `/status` page driven by actual DB/provider health.

**Still not built out**: social (Facebook/Instagram/X) and Google Ads
OAuth integrations, an email campaign/template builder with delivery
tracking, and admin "view as customer" impersonation. Their database
models exist in `prisma/schema.prisma` where relevant; follow the same
pattern as `/admin/news` or `/admin/settings/payments` to add them.

## 1. Local setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, NEXTAUTH_SECRET, ENCRYPTION_KEY, SUPERADMIN_*
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Generate secrets:
```bash
openssl rand -hex 32   # for NEXTAUTH_SECRET
openssl rand -hex 32   # for ENCRYPTION_KEY
```

## 2. Deploy: GitHub → Neon → Vercel

1. **Neon**: create a project, copy the pooled connection string into
   `DATABASE_URL` and the direct one into `DIRECT_URL`.
2. **GitHub**: push this repo to a new GitHub repository.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. **Vercel**: import the GitHub repo, add all variables from
   `.env.example` in Project Settings → Environment Variables, then deploy.
4. After the first deploy, run migrations + seed against the Neon database
   (locally, pointed at the production `DATABASE_URL`, or via a one-off
   Vercel build command):
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
5. Log in at `/login` with `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`, then
   go to `/admin/settings/contact` to set your real WhatsApp numbers and
   `/admin/settings/payments` to add your payment gateways.

## 3. Adding a new communication provider

Copy `src/providers/twilioAdapter.ts`, implement the same `ProviderAdapter`
interface for the new vendor's API, and call `registerAdapter("VONAGE", …)`.
Then create a `Provider` row (kind `VONAGE`) from the admin panel or
Prisma Studio and enable it.

## 4. Adding a new payment gateway

No code changes needed for basic on/off control — admins add a gateway by
any `key`/name from `/admin/settings/payments`. To make it actually process
payments, implement `GatewayAdapter` in `src/payments/` (see the
`manual_bank_transfer` example) and call `registerGateway()` with the same
key.

## 5. Company registered address

Default seed sets `company_country = "Hong Kong"` in `SystemSetting`. Set
the full registered address string in `/admin/settings` (extend that page
to edit `SystemSetting` rows, following the same pattern as the contact
settings page) — nothing is hardcoded into components.
