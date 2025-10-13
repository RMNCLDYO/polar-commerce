import type { Metadata } from 'next';
import { CartManager } from '@/components/cart/cart-manager';
import { Toaster } from '@/components/ui/sonner';
import { WishlistManager } from '@/components/wishlist/wishlist-manager';
import { ConvexProvider } from '@/lib/client/providers/convex';
import { ThemeProvider } from '@/lib/client/providers/theme';
import { geistMono, geistSans } from '@/lib/shared/fonts';
import './globals.css';

export const metadata: Metadata = {
  // NEXT_PUBLIC_BASE_URL is used for absolute URL generation in metadata
  // Must be configured in production environment
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  ),
  title: 'BANANA SPORTSWEAR - Premium Athletic Gear | Vercel AI SDK Showcase',
  description:
    'Shop premium sportswear with AI-powered virtual try-on and product mashup. Built with Vercel AI SDK, Next.js 16, and React 19.2.',
  keywords: [
    'Vercel AI SDK',
    'sportswear',
    'virtual try-on',
    'AI fashion',
    'athletic gear',
  ],
  authors: [{ name: 'RMNCLDYO' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'BANANA SPORTSWEAR - Premium Athletic Gear',
    description: 'AI-powered sportswear shopping with virtual try-on',
    type: 'website',
    siteName: 'BANANA SPORTSWEAR',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'BANANA SPORTSWEAR - Premium Athletic Gear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BANANA SPORTSWEAR',
    description: 'AI-powered sportswear shopping with virtual try-on',
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className={`${geistSans.className} antialiased`}>
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
