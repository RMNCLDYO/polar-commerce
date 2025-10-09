# AI SDK Storefront

Full-stack e-commerce with **Next.js 15 canary + Convex + Better Auth + Polar**. Showcases real-world integration of experimental features in production architecture.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.6.0--canary.53-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Convex](https://img.shields.io/badge/Convex-1.27.4-FF6B35?style=flat-square)](https://convex.dev)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3.8-7C3AED?style=flat-square)](https://better-auth.com)
[![Polar](https://img.shields.io/badge/Polar-0.35.4-007ACC?style=flat-square)](https://polar.sh)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> [!WARNING]
> Experimental features + custom workarounds. **Use at your own risk.**

## What's Inside

- **Authentication** - Better Auth (email/password, GitHub OAuth, 2FA)
- **Database** - Convex (real-time, type-safe, auto-generated API)
- **Payments** - Polar (subscriptions + one-time purchases)
- **Frontend** - Next.js 15 (PPR, Server Components, modern caching)
- **UI** - shadcn/ui + Tailwind v4
- **AI** - Vercel AI SDK + Google Gemini

## Quick Start

```bash
git clone https://github.com/RMNCLDYO/aisdk-storefront.git
cd aisdk-storefront
npm install
cp .env.example .env.local
# Add required environment variables
npm run polar:seed
npm run dev
# https://localhost:3000
```

## Why This Exists

Demonstrates production-grade integration of:

- **Convex** - Real-time database with type-safe client, server functions, and webhook handling
- **Better Auth** - Modern auth with built-in 2FA, social login, and session management
- **Polar** - Payment processing with subscription management and customer portals
- **Next.js 15** - PPR, `use cache`, Server Components, Request Deduplication

Shows how these technologies work together in a real application, not toy examples.

## Architecture Highlights

### Convex Integration

- **Real-time cart** - Live updates across tabs, no polling
- **Type-safe everything** - Auto-generated types from schema
- **Server functions** - CRUD, auth integration, webhook handlers
- **Components** - Local Polar component for extended functionality

### Better Auth Integration

- **Convex adapter** - Native Convex integration
- **User sync** - Auto-create Polar customers on signup
- **Tier detection** - Real-time subscription tier in auth context
- **Route protection** - Middleware with tier-based access control

### Polar Integration

- **Webhooks** - Order processing, subscription updates
- **Customer sync** - Bi-directional sync (Polar ↔ Convex)
- **Cart workaround** - Multi-product checkout via metadata (see [Important Notes](#important-notes))
- **Portal** - Customer billing portal integration

### Next.js 15 Features

- **PPR** - Static shell + streaming (4 routes)
- **Modern caching** - `use cache`, `cacheLife()`, `cacheTag()`
- **Server Components** - 37% bundle reduction
- **Request Deduplication** - Automatic with PPR

## Environment Variables

```env
# Convex (auto-configured by npx convex dev)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site

# Better Auth
BETTER_AUTH_SECRET=your_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret

# Polar
POLAR_ORGANIZATION_TOKEN=your_polar_token
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_SERVER=sandbox

# AI (optional)
GOOGLE_GENERATIVE_AI_API_KEY=your_key

# App
SITE_URL=https://localhost:3000
NEXT_PUBLIC_BASE_URL=https://localhost:3000
```

## Project Structure

```
app/
├── (protected)/              # Auth-required (Better Auth middleware)
│   ├── dashboard/            # Real-time todos (Convex live queries)
│   ├── settings/             # Account + 2FA management
│   └── portal/               # Polar customer portal
└── (public)/
    ├── (shop)/               # PPR-enabled e-commerce
    └── (auth)/               # Better Auth flows

convex/
├── auth/                     # Better Auth integration + user sync
├── cart/                     # Real-time cart with Convex
├── catalog/                  # Product/subscription catalog + inventory
├── checkout/                 # Polar checkout integration
├── demos/                    # Demo features (todos)
├── orders/                   # Order sync + webhook handlers
└── polar/                    # Polar component (extended API)

components/
├── cart/                     # Real-time cart UI
├── layout/                   # Header, footer, navigation
└── products/                 # Product grid, cards
```

## Important Notes

### Multi-Product Checkout

Polar doesn't support native cart functionality yet. This implementation uses a workaround:

1. Cart state in Convex (real-time sync)
2. Bundle multiple items as Polar metadata on checkout
3. Reconstruct order from metadata post-payment

**Working solution, not production-ready.** Remove when Polar adds native cart.

### Experimental Features

Uses Next.js 15 canary experimental APIs:
- Partial Prerendering (PPR)
- `use cache` directive
- `unstable_cacheLife()`
- `unstable_cacheTag()`
- `experimental.cacheComponents`

APIs may change before stable release.

## Commands

```bash
npm run dev                   # Start dev server
npm run build                 # Production build
npm run polar:seed            # Seed products + subscriptions
npm run db:reset              # Reset database
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.6 canary, React 19.2 |
| Database | Convex 1.27.4 |
| Auth | Better Auth 1.3.8 |
| Payments | Polar SDK 0.35.4 |
| UI | shadcn/ui, Tailwind v4 |
| AI | Vercel AI SDK, Google Gemini |

## What You Get

- Complete auth system (email, OAuth, 2FA)
- Real-time shopping cart
- Subscription management (3 tiers)
- Product catalog with inventory
- Order processing + webhooks
- AI virtual try-on
- Customer portal
- Protected routes with middleware
- Type-safe end-to-end

**100% functional.** Not toy code. Use at your own risk.

## Credits

Original v0 template by [@estebansuarez](https://github.com/estebansuarez) - [v0 Storefront](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5)

## License

[MIT](LICENSE)
