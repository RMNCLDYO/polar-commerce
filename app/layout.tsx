import { CartManager } from '@/components/cart/cart-manager';
import { Toaster } from '@/components/ui/sonner';
import { WishlistManager } from '@/components/wishlist/wishlist-manager';
import { ConvexProvider } from '@/lib/client/providers/convex';
import { ThemeProvider } from '@/lib/client/providers/theme';
import type { Metadata } from "next";
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
  title: 'Polar Commerce - E-commerce Platform | Next.js 16 + Convex + Better Auth',
  description:
    'Experimental e-commerce platform demonstrating Polar payment bundling, Convex real-time database, and Better Auth integration. Features cart/wishlist with real-time sync and multi-item checkout workaround. Built with Next.js 16 canary and React 19.',
  keywords: [
    'e-commerce',
    'Next.js 16',
    'Convex',
    'Better Auth',
    'Polar',
    'real-time cart',
    'React 19',
    'e-commerce platform',
  ],
  authors: [{ name: 'RMNCLDYO' }],
  manifest: '/manifest.json',
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
    description: 'Experimental e-commerce platform with Polar, Convex, and Better Auth',
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
    description: 'Experimental e-commerce platform with Polar, Convex, and Better Auth',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
