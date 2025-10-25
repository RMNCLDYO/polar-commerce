# Polar Commerce

Experimental e-commerce platform built with Next.js 16, Convex, Better Auth, and Polar. Features custom cart bundling, seamless guest-to-auth migration, and automated product seeding. Polar wasn't built for multi-item carts - that's what made this interesting.

## The Challenge

Polar handles payments beautifully but has zero cart system - no multi-item checkout, no cart management, nothing. I needed to figure out how to make it work for a full e-commerce platform without those features.

## The Solution

**Cart bundling:** Built a custom system where multiple cart items bundle into a single ephemeral Polar product at checkout. The full cart composition gets stored in checkout metadata, then reconstructed server-side after payment confirmation via webhook. This workaround lets Polar handle payments for multi-item carts without native support.

**Real-time cart sync:** Convex's real-time subscriptions make the magic happen - cart and wishlist updates sync instantly across all devices and tabs. Add an item on your phone, see it immediately on desktop. No polling, no refresh needed.

**Guest/auth cart merging:** Seamless migration when guests sign in. Items added while browsing anonymously automatically merge with their account data on login - no lost items, no duplicates. Better Auth integration made this straightforward.

**JSON-based product seeding:** Built a comprehensive seeding system that starts with JSON product definitions, uploads images to Polar's CDN, creates products via Polar API, then syncs everything to Convex. One command (`npm run polar:seed`) populates both systems with full inventory, pricing, images, and metadata - all kept in sync automatically.

**Tech stack:**
- Next.js 16.0.1-canary.2 with React Compiler, Turbopack dev/build caching, component-level caching, and PPR
- React 19.2 with useEffectEvent, View Transitions API
- Experimental: `cacheLife`, `cacheTag`, typed routes, inline CSS
- Convex (real-time database with type-safe schema)
- Better Auth with Convex adapter
- Polar (payments for subscriptions and one-time purchases)

## Setup

#### Install and Configure
```bash
git clone https://github.com/RMNCLDYO/polar-commerce.git
cd polar-commerce
npm install
cp .env.example .env.local
```

#### Seed & Run
```bash
npm run polar:seed
npm run dev
```

## What Works

- Cart with real-time sync across devices/tabs
- Wishlist functionality
- Full auth flow (email/OAuth/2FA)
- Checkout with item bundling
- Order reconstruction from webhooks
- Subscription and one-time payments

## Known Issues

- **Account menu positioning bug:** The user menu dropdown renders in the top-left corner when navigating to protected pages. Working on a fix ASAP.

## What's Missing

Still figuring out:
- Cart expiration and cleanup
- Bundle lifecycle management
- Per-item tax calculations
- Partial refund logic

## Why Build This

I wanted to see if I could build e-commerce on Polar despite the missing cart system. Turns out Convex's real-time sync is perfect for carts and wishlists, Better Auth integrates seamlessly, and Next.js 16's experimental features (React Compiler, component-level caching, Turbopack dev caching) combined with React 19.2's useEffectEvent and View Transitions push performance and UX even further. The bundling workaround for Polar isn't elegant, but it works.

## Credits

Started from [@estebansuarez](https://github.com/estebansuarez)'s [v0 template](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5). Built with Next.js 16, Convex, Better Auth, and Polar.

## License

MIT
