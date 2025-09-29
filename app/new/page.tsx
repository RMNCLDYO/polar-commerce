import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 py-6 border-b border-border">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono tracking-wider uppercase hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </header>
      <main className="px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            New Arrivals
          </h1>
          <p className="text-muted-foreground">
            Check back soon for our latest collection
          </p>
        </div>
      </main>
    </div>
  );
}

export const metadata = {
  title: "New Arrivals - BANANA SPORTSWEAR",
  description:
    "Discover the latest additions to our premium sportswear collection",
};
