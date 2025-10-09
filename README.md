# AI SDK Storefront

**Experimental SaaS/E-commerce demo** showcasing Next.js 15 Canary features with Better Auth, Polar, Convex, React 19, shadcn/ui, Tailwind, and Vercel AI SDK.

⚠️ **Not Production Ready** - Uses experimental Next.js 15 canary features and workarounds for multi-product checkout

Clone → ENV setup → Seed → Run → `https://localhost:3000` 🚀

[![Next.js 15](https://img.shields.io/badge/Next.js-15.6.0--canary.53-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Convex](https://img.shields.io/badge/Convex-1.27.4-FF6B35?style=flat-square)](https://convex.dev)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3.8-7C3AED?style=flat-square)](https://better-auth.com)
[![Polar](https://img.shields.io/badge/Polar-0.35.4-007ACC?style=flat-square)](https://polar.sh)

## Features

✅ **Auth** - Email/password, GitHub OAuth, 2FA (Better Auth)
✅ **Payments** - Subscriptions + one-time purchases (Polar)
✅ **Database** - Real-time with auto-generated types (Convex)
✅ **E-commerce** - Cart, checkout, orders, inventory
✅ **AI** - Virtual try-on with Google Gemini (Vercel AI SDK)
✅ **Next.js 15** - PPR, Server Components, modern caching
✅ **shadcn/ui** - Beautiful components (Tailwind v4)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/RMNCLDYO/aisdk-storefront.git
cd aisdk-storefront
npm install

# 2. Setup ENV vars
cp .env.example .env.local

# Add to .env.local:
# - GOOGLE_GENERATIVE_AI_API_KEY      (for AI try-on)
# - POLAR_ORGANIZATION_TOKEN           (for payments)
# - POLAR_WEBHOOK_SECRET               (for webhooks)
# - GITHUB_CLIENT_ID/SECRET            (for OAuth)
# - Run `npx convex dev` to auto-add Convex vars

# 3. Seed data
npm run polar:seed

# 4. Start dev server
npm run dev

# 5. Open https://localhost:3000
```

**That's it!** You now have a working demo showcasing Next.js 15 canary features in a real-world app.

## What You Get

- **Authentication**: Sign up/in, GitHub OAuth, 2FA, password reset
- **Subscriptions**: 3-tier pricing (Free, Starter $9.99, Premium $19.99)
- **Shopping**: Product catalog, cart, checkout, order history
- **AI Features**: Virtual try-on (upload photo, see yourself in products)
- **Dashboard**: Protected routes, user settings, customer portal
- **Real-time**: Live cart updates, no page refresh needed

## Important Notes

### Multi-Product Checkout Workaround

Polar doesn't currently support multi-product checkout (cart with multiple items). This demo works around this limitation by:

1. **Convex Cart** - Using Convex to store cart state, inventory, and checkout sessions
2. **Bundle Hack** - When checking out, multiple items are bundled and sent to Polar as custom metadata
3. **Order Reconstruction** - After payment, we reconstruct the full order from metadata

This gives an e-commerce-like experience but **is not production-ready**. When Polar adds native cart support, this workaround can be replaced.

### Experimental Features

This project uses **Next.js 15 canary** experimental features:
- Partial Prerendering (PPR)
- `use cache` directive
- `unstable_cacheLife()`
- `experimental.cacheComponents`

These APIs may change before stable release.

## Tech Stack

| Category | Tech |
|----------|------|
| **Framework** | Next.js 15.6 (canary), React 19.2 |
| **Database** | Convex (real-time, type-safe) |
| **Auth** | Better Auth (email + OAuth + 2FA) |
| **Payments** | Polar SDK (subscriptions + products) |
| **UI** | shadcn/ui, Tailwind v4, Radix UI |
| **AI** | Vercel AI SDK, Google Gemini 2.5 |

## Project Structure

```
app/
├── (protected)/        # Auth-required routes
│   ├── dashboard/      # User dashboard
│   ├── settings/       # Account settings
│   └── portal/         # Customer portal
└── (public)/           # Public routes
    ├── (shop)/         # E-commerce (PPR enabled)
    └── (auth)/         # Sign in/up flows

convex/
├── auth/               # Authentication
├── cart/               # Shopping cart
├── checkout/           # Checkout flow
├── orders/             # Order management
├── products/           # Product catalog
└── polar/              # Polar component

components/
├── cart/               # Cart UI
├── layout/             # Header, footer
└── products/           # Product components

lib/
├── client/             # Client utilities
└── server/             # Server utilities
```

## Environment Variables

```env
# AI (optional - for virtual try-on)
GOOGLE_GENERATIVE_AI_API_KEY=your_key

# Convex (auto-configured by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site

# Better Auth
BETTER_AUTH_SECRET=your_secret_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Polar
POLAR_ORGANIZATION_TOKEN=your_polar_token
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_SERVER=sandbox  # or production

# App
SITE_URL=https://localhost:3000
NEXT_PUBLIC_BASE_URL=https://localhost:3000
```

## Scripts

```bash
# Development
npm run dev                 # Start dev server (https://localhost:3000)
npm run build               # Production build

# Data Management
npm run polar:seed          # Seed products + subscriptions
npx convex run factoryReset:factoryReset  # Wipe all data
```

## Next.js 15 Canary `Experimental` Features

This project demonstrates:

- ✅ **Partial Prerendering (PPR)** - Static shell + streaming
- ✅ **Server Components** - 37% bundle reduction
- ✅ **Modern Caching** - `use cache` directive
- ✅ **Request Deduplication** - Automatic with PPR
- ✅ **Smart Prefetching** - Hover-based navigation
- ✅ **Turbopack** - Next-gen bundler

## Credits

**Original v0 Template:** [@estebansuarez](https://github.com/estebansuarez)

See [CHANGELOG.md](CHANGELOG.md) for detailed changes.

## License

MIT - See [LICENSE](LICENSE)
