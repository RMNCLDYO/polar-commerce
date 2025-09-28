# Vercel AI SDK Storefront Showcase

**Built with [Vercel AI SDK](https://sdk.vercel.ai)** - A v0 template showcase demonstrating modern AI integration patterns.

[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-5.0.52-FF6B6B?style=flat-square&logo=vercel)](https://sdk.vercel.ai)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square)](https://tailwindcss.com)
[![v0 Template](https://img.shields.io/badge/v0-Template-purple?style=flat-square)](https://v0.dev)

## Overview

Showcase for **Vercel AI SDK** demonstrating seamless AI model integration in modern web applications. Originally a v0 template, enhanced to exemplify AI SDK's power for building AI features with minimal code.

## Why Vercel AI SDK

- **Unified AI Interface**: Single API for multiple AI providers
- **Type-Safe Integration**: Full TypeScript support
- **Streaming Responses**: Built-in real-time AI responses
- **Production Patterns**: Best practices for AI in Next.js

## Features

- **Vercel AI SDK Powered**: Seamless integration with Google Gemini 2.5 Flash
- **AI Virtual Try-On**: Upload photo to see yourself wearing products
- **Product Mashup**: Combine product images to generate unique designs
- **Modern Stack**: Next.js 15, React 19, Tailwind CSS v4, TypeScript 5
- **Fast Development**: Turbopack compilation, Biome linting
- **Responsive Design**: Mobile-first with shadcn/ui components

## Quick Start

### Prerequisites

- Node.js 20.0+
- Google Cloud API key with Gemini API access

### Installation

```bash
git clone https://github.com/RMNCLDYO/aisdk-storefront.git
cd aisdk-storefront
npm install
```

### Configuration

```bash
cp .env.example .env.local
```

Add your Google API key to `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── api/                    # AI endpoints
│   ├── generate-image/     # Product mashup
│   └── generate-model-image/ # Virtual try-on
├── globals.css            # Tailwind v4 with @theme layer
├── layout.tsx             # Root layout
└── page.tsx               # Main storefront

components/ui/             # shadcn/ui components
lib/                      # Utilities
├── image-loader.ts       # Next.js image optimization
├── logger.ts             # Error handling
└── utils.ts              # Helper functions
```

## Tech Stack

- **Next.js 15.5.4**: App Router with Turbopack
- **React 19.1.0**: Latest React features
- **Tailwind CSS v4**: Modern CSS with @theme layer
- **Vercel AI SDK**: Unified AI model interface
- **Google Gemini 2.5 Flash**: Image generation model
- **TypeScript 5**: Type safety
- **Biome**: Fast linting/formatting
- **shadcn/ui**: Component library

## Key Implementation Details

### Vercel AI SDK Integration

Demonstrates the simplicity of AI SDK with Google's Gemini 2.5 Flash:

```typescript
const result = await generateText({
  model: "google/gemini-2.5-flash-image-preview",
  providerOptions: {
    google: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  },
  messages: [...]
});
```

### Tailwind CSS v4

Leverages new @theme layer with OKLCH colors:

```css
@theme {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
}
```

### Custom Image Loader

Handles local and external images with optimization:

```typescript
// lib/image-loader.ts
export default function imageLoader({ src, width, quality }) {
  // Handles data URLs, blob URLs, external URLs, and local images
}
```

## Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Development server with Turbopack |
| `npm run build` | Production build |
| `npm run lint` | Run Biome checks |
| `npm run format` | Format with Biome |

## Educational Purpose

This project demonstrates:
- Integration of AI models in web applications
- Modern React patterns with Server Components
- Tailwind CSS v4's new features
- Type-safe API routes with TypeScript
- Error handling and logging best practices
- Image optimization strategies

## Credits

Based on the original [v0 Storefront Template](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5) by [Esteban Suarez](https://x.com/EstebanSuarez), DevRel at v0/Vercel.

Modernized with Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui components.

## Author

**Ray** ([@RMNCLDYO](https://github.com/RMNCLDYO))
- Email: hi@rmncldyo.com
- GitHub: [github.com/RMNCLDYO](https://github.com/RMNCLDYO)

## License

MIT - See [LICENSE](LICENSE) for details

## Contributing

Contributions welcome. Please use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `refactor:` Code changes
- `chore:` Maintenance
