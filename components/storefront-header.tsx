import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { OptimizedLink } from "@/components/optimized-link";
import { SearchInput } from "@/components/search-input";

export function StorefrontHeader() {
  return (
    <header className="px-8 py-6 border-b border-border animate-slide-down">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center">
          <OptimizedLink href="/" prefetchStrategy="always">
            <Image
              src="/logo.png"
              alt="BANANA SPORTSWEAR"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </OptimizedLink>
        </div>

        <nav className="hidden md:flex items-center gap-x-12">
          {["NEW", "MEN", "WOMEN", "KIDS"].map((item, index) => (
            <OptimizedLink
              key={item}
              href={`/${item.toLowerCase()}`}
              prefetchStrategy="hover"
              className="text-xs font-semibold tracking-widest uppercase hover:text-muted-foreground animate-slide-up transition-colors"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {item}
            </OptimizedLink>
          ))}
        </nav>

        <div
          className="flex items-center gap-x-6 animate-slide-right"
          style={{ animationDelay: "500ms" }}
        >
          <SearchInput />
          <Heart className="size-4 cursor-pointer hover:text-muted-foreground transition-colors" />
          <ShoppingBag className="size-4 cursor-pointer hover:text-muted-foreground transition-colors" />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
