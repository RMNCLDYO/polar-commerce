import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // NEXT_PUBLIC_BASE_URL is used for absolute URL generation in metadata
  // Falls back to production URL if not set in environment
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://aisdk-storefront.vercel.app",
  ),
  title: "BANANA SPORTSWEAR - Premium Athletic Gear | Vercel AI SDK Showcase",
  description:
    "Shop premium sportswear with AI-powered virtual try-on and product mashup. Built with Vercel AI SDK, Next.js 15, and React 19.",
  keywords: [
    "Vercel AI SDK",
    "sportswear",
    "virtual try-on",
    "AI fashion",
    "athletic gear",
  ],
  authors: [{ name: "RMNCLDYO" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "BANANA SPORTSWEAR - Premium Athletic Gear",
    description: "AI-powered sportswear shopping with virtual try-on",
    type: "website",
    siteName: "BANANA SPORTSWEAR",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "BANANA SPORTSWEAR - Premium Athletic Gear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BANANA SPORTSWEAR",
    description: "AI-powered sportswear shopping with virtual try-on",
    images: ["/twitter-image.png"],
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
