import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
  icons: {
    icon: "/acme-logo.png",
    shortcut: "/acme-logo.png",
    apple: "/acme-logo.png",
  },
  openGraph: {
    title: "BANANA SPORTSWEAR - Premium Athletic Gear",
    description: "AI-powered sportswear shopping with virtual try-on",
    type: "website",
    siteName: "BANANA SPORTSWEAR",
  },
  twitter: {
    card: "summary_large_image",
    title: "BANANA SPORTSWEAR",
    description: "AI-powered sportswear shopping with virtual try-on",
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
