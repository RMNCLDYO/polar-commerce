# AI SDK Storefront

**Next.js 15 canary experimental features demo** - SaaS/e-commerce with Better Auth, Polar, Convex, React 19, shadcn/ui, and Vercel AI SDK.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.6.0--canary.53-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Convex](https://img.shields.io/badge/Convex-1.27.4-FF6B35?style=flat-square)](https://convex.dev)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3.8-7C3AED?style=flat-square)](https://better-auth.com)
[![Polar](https://img.shields.io/badge/Polar-0.35.4-007ACC?style=flat-square)](https://polar.sh)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> [!WARNING]
> **Experimental Project** - Uses Next.js 15 canary features and custom workarounds. Not production-ready.

## What is this?

A full-stack e-commerce demo showcasing **Next.js 15 experimental features** in a real-world application. Built as a learning project to explore PPR, modern caching, Server Components, and bleeding-edge React patterns.

Fork of [@estebansuarez](https://github.com/estebansuarez)'s [v0 Storefront Template](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5), upgraded from Next.js 14 → 15.6 canary with complete backend integration.

## Features

- ✅ **Authentication** - Email/password, GitHub OAuth, 2FA (Better Auth)
- ✅ **Payments** - Subscriptions + one-time purchases (Polar)
- ✅ **Database** - Real-time with auto-generated types (Convex)
- ✅ **E-commerce** - Cart, checkout, orders, inventory
- ✅ **AI** - Virtual try-on with Google Gemini (Vercel AI SDK)
- ✅ **Next.js 15** - PPR, Server Components, modern caching
- ✅ **shadcn/ui** - Production-ready components (Tailwind v4)

## Installation

```bash
# Clone repository
git clone https://github.com/RMNCLDYO/aisdk-storefront.git
cd aisdk-storefront

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Requirements

- Node.js 18.17 or later
- npm 9 or later
- Convex account (free tier available)
- Polar account (sandbox mode for testing)
- GitHub OAuth app (for social login)
- Google AI API key (optional, for virtual try-on)

### Environment Configuration

Add these to `.env.local`:

```env
# AI (optional - for virtual try-on)
GOOGLE_GENERATIVE_AI_API_KEY=your_key

# Convex (auto-configured by npx convex dev)
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

### Seed Data

```bash
# Seed products and subscriptions
npm run polar:seed
```

## Usage

```bash
# Start development server (frontend + backend)
npm run dev

# Open https://localhost:3000
```

The application includes:

- **Shop** - Browse products, add to cart, checkout
- **Pricing** - View subscription tiers, purchase plans
- **Dashboard** - Protected route with todo list
- **Settings** - Account management, 2FA setup
- **Portal** - Customer billing portal

## Project Status

🚧 **Active Development** - This is an experimental learning project demonstrating Next.js 15 canary features.

**Known Limitations:**

- Uses experimental APIs that may change before stable release
- Multi-product checkout uses custom workaround (Polar doesn't support native cart)
- Not recommended for production use

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Important Notes

### Multi-Product Checkout Workaround

> [!CAUTION]
> Polar doesn't currently support multi-product checkout. This demo implements a workaround.

**Implementation:**

1. **Convex Cart** - Cart state, inventory, and sessions stored in Convex
2. **Bundle Strategy** - Multiple items bundled and sent to Polar as custom metadata
3. **Order Reconstruction** - Full order reconstructed from metadata after payment

This provides an e-commerce-like experience but **is not production-ready**. When Polar adds native cart support, this workaround can be removed.

### Experimental Features

> [!NOTE]
> This project uses **Next.js 15 canary** experimental features.

**Features used:**

- Partial Prerendering (PPR)
- `use cache` directive
- `unstable_cacheLife()`
- `unstable_cacheTag()`
- `experimental.cacheComponents`

These APIs may change before stable release.

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15.6 (canary), React 19.2 |
| **Database** | Convex (real-time, type-safe) |
| **Auth** | Better Auth (email + OAuth + 2FA) |
| **Payments** | Polar SDK (subscriptions + products) |
| **UI** | shadcn/ui, Tailwind v4, Radix UI |
| **AI** | Vercel AI SDK, Google Gemini 2.5 |
| **TypeScript** | 5 (strict mode) |

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

## Scripts

```bash
# Development
npm run dev                 # Start dev server (https://localhost:3000)
npm run build               # Production build
npm run lint                # Run linter

# Data Management
npm run polar:seed          # Seed products + subscriptions
npx convex run factoryReset:factoryReset  # Wipe all data
npx convex run inspectData:inspectAll     # Debug database
```

## Support

- **Issues** - [GitHub Issues](https://github.com/RMNCLDYO/aisdk-storefront/issues)
- **Discussions** - [GitHub Discussions](https://github.com/RMNCLDYO/aisdk-storefront/discussions)
- **Documentation** - [CHANGELOG.md](CHANGELOG.md)

## Roadmap

- [ ] Add native Polar cart support (when available)
- [ ] Stabilize experimental Next.js features
- [ ] Add product reviews and ratings
- [ ] Implement wishlist functionality
- [ ] Add admin dashboard
- [ ] Improve test coverage
- [ ] Add Stripe as payment alternative
- [ ] Multi-language support

## Contributing

Contributions welcome! This is a learning project, so feel free to experiment.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

> [!TIP]
> Please use [conventional commits](https://www.conventionalcommits.org/) for commit messages.

## Authors

**Original v0 Template:** [@estebansuarez](https://github.com/estebansuarez)
**Next.js 15 Upgrade:** [@RMNCLDYO](https://github.com/RMNCLDYO)

## License

[MIT](LICENSE) - See LICENSE file for details.

---

⭐ **Star this repo** if it helped you learn Next.js 15 experimental features!
