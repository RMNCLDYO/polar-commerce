import { CartManager } from '@/components/cart/cart-manager';
import { Toaster } from '@/components/ui/sonner';
import { WishlistManager } from '@/components/wishlist/wishlist-manager';
import { ConvexProvider } from '@/lib/client/providers/convex';
import { ThemeProvider } from '@/lib/client/providers/theme';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  ),
  applicationName: 'Polar Commerce',
  title: {
    default: 'Polar Commerce - E-commerce Platform | Next.js 16 + Convex + Better Auth',
    template: '%s | Polar Commerce',
  },
  description:
    'Experimental e-commerce platform built with Next.js 16, Convex, Better Auth, and Polar. Features custom cart bundling, seamless guest-to-auth migration, and automated product seeding.',
  keywords: [
    'ecommerce',
    'real-time',
    'typescript',
    'serverless',
    'checkout',
    'nextjs',
    'payments',
    'seeding',
    'cart',
    'polar',
    'product-catalog',
    'convex',
    'react19',
    'better-auth',
    'subscription-payments',
    'nextjs16',
  ],
  authors: [{ name: 'Ray', url: 'https://github.com/RMNCLDYO' }],
  creator: 'Ray',
  publisher: 'Ray',
  generator: 'Next.js',
  category: 'shopping',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Polar Commerce - E-commerce Platform',
    description: 'Experimental e-commerce platform built with Next.js 16, Convex, Better Auth, and Polar. Features custom cart bundling, seamless guest-to-auth migration, and automated product seeding.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    type: 'website',
    siteName: 'Polar Commerce',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Polar Commerce - E-commerce Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polar Commerce',
    description: 'Experimental e-commerce platform built with Next.js 16, Convex, Better Auth, and Polar. Features custom cart bundling, seamless guest-to-auth migration, and automated product seeding.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout(props: LayoutProps<'/'>) {
  const { children } = props;
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CartManager />
            <WishlistManager />
            {children}
            <Toaster position="bottom-left" />
          </ThemeProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
