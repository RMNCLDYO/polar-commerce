# Polar Commerce

An experiment combining Convex (real-time database), Polar (payments), and Better Auth into an e-commerce platform. These tools weren't designed for this, but that's what made it interesting.

## The Problem

I wanted to build an e-commerce platform but:
- Polar handles payments beautifully but has no cart system
- Convex is built for SaaS apps, not e-commerce
- Better Auth works great but needed to integrate with both

So I built workarounds.

## The Solution

**Cart bundling:** Built a custom system where multiple cart items bundle into a single ephemeral Polar product at checkout. The full cart composition gets stored in checkout metadata, then reconstructed server-side after payment confirmation via webhook. This workaround lets Polar handle payments for multi-item carts without native support.

**Guest/auth cart merging:** Implemented seamless cart and wishlist migration when guests sign in. Items added while browsing anonymously automatically merge with their account data on login - no lost items, no duplicates.

**JSON-based product seeding:** Built a comprehensive seeding system that starts with JSON product definitions, uploads images to Polar's CDN, creates products via Polar API, then syncs everything to Convex. One command (`npm run polar:seed`) populates both systems with full inventory, pricing, images, and metadata - all kept in sync automatically.

**Tech stack:**
- Next.js 16 + React 19
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

I was curious if I could make e-commerce work with tools designed for different purposes. Convex's real-time subscriptions turned out to be perfect for cart sync. Polar's payment processing is solid even without native cart support. The bundling workaround isn't elegant, but it works.

## Credits

Started from [@estebansuarez](https://github.com/estebansuarez)'s [v0 template](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5). Built with Next.js 16, Convex, Better Auth, and Polar.

## License

MIT
