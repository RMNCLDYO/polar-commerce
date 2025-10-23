# Polar Commerce

Polar doesn't have a cart system. Convex isn't designed for e-commerce. This repo hacks around both limitations.

**The workaround:** Cart state lives in Convex with real-time sync. At checkout, multiple cart items bundle into a single ephemeral Polar product. Original cart composition stored in checkout metadata. Post-payment webhook reconstructs the full order.

Also testing Next.js 16 canary (Cache Components, Turbopack, React Compiler) + React 19 (View Transitions).

## Quick Start

```bash
git clone https://github.com/RMNCLDYO/polar-commerce.git
cd polar-commerce
npm install
cp .env.example .env.local
# Add CONVEX_DEPLOYMENT, POLAR_ORGANIZATION_TOKEN, etc. (see .env.example)
npm run db:reset        # Clear database (18s)
npm run polar:seed      # Seed products (29s)
npm run dev             # Start dev server
# Open https://localhost:3000
```

## How It Works

**Cart → Bundle → Payment:**
1. Cart items stored in Convex with real-time sync across devices
2. At checkout, [`createBundleProduct()`](convex/checkout/checkout.ts#L123) bundles N items into one Polar product
3. Original cart composition stored in checkout metadata
4. Polar processes payment for bundle
5. Webhook receives payment confirmation, reconstructs order from metadata

**Stack:**
- Next.js 16 canary (Cache Components, Turbopack, React Compiler)
- Convex (real-time database + Better Auth/Polar components)
- Better Auth (email/OAuth/2FA via Convex adapter)
- Polar (subscriptions + one-time payments)
- React 19 (View Transitions, useEffectEvent)

**What's implemented:**
Cart/wishlist with real-time sync, user authentication (Better Auth), checkout flow with bundling, webhook-based order reconstruction, subscription + one-time payment support.

**What's not (yet):**
Cart expiration crons, bundle cleanup strategy, per-item tax calculation. See [DOCS.md](DOCS.md) for implementation details.

## Why

Wanted to see if Convex's real-time subscriptions + type-safe schema would work for e-commerce despite being designed for SaaS. Turns out live cart sync across devices is trivial with Convex subscriptions. Inventory updates propagate instantly. Type generation catches schema mismatches at compile time.

Polar's payment infrastructure handles subscriptions well, but no native multi-product checkout meant building the bundling workaround. Side benefit: the same codebase demonstrates both SaaS patterns (recurring billing, tiered access) and e-commerce primitives (cart, checkout, inventory) using identical backend infrastructure.

This is an experiment - someone may have built cart/wishlist/checkout with Convex before, but I haven't seen it documented. The bundling hack for Polar's checkout limitation is definitely unique to this repo.

## Benchmarks

Apple Silicon M-series:

| Command | Time | Description |
|---------|------|-------------|
| `npm run lint` | 7s | ESLint + Convex TypeScript |
| `npm run format` | 4s | ESLint auto-fix |
| `npm run build` | 10s | Next.js production build (3.9s compile + 2.8s TS + 1.0s static gen) |
| `npm run dev` | 10s | Frontend (451ms) + Convex backend (9.3s) |

**Build output:**
- 35 routes (24 with Partial Prerendering)
- 165+ files, ~18.5K lines TypeScript
- Zero `any` types (except intentional suppressions)
- Zero deprecated Next.js 16 APIs

## Contributing

Open experiment. Contributions welcome on:

**Core challenges:**
- Bundle lifecycle management (when to delete bundled Polar products?)
- Cart expiration + cleanup crons
- Partial refund logic (unbundling individual items)
- Per-product tax calculation before bundling
- Better concurrent checkout handling

**Missing features:**
Multi-currency, shipping integrations, integration tests, deployment guides.

Fork it, break it, fix it, ship PRs.

## Credits

- **Original v0 template:** [@estebansuarez](https://github.com/estebansuarez) - [v0 Storefront](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5)
- **Next.js Team** - For Next.js 16 and experimental features
- **Convex Team** - For real-time database and component ecosystem
- **Better Auth Team** - For modern authentication solution
- **Polar Team** - For developer-friendly payments

## License

MIT - Experimental code. Use at your own risk.
