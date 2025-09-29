import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { SearchInput } from "@/components/search-input";

export default function StorefrontHeader() {
  return (
    <header className="px-8 py-6 border-b border-border animate-slide-down">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="BANANA SPORTSWEAR"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-x-12">
          {["NEW", "MEN", "WOMEN", "KIDS"].map((item, index) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              prefetch={true}
              className="text-xs font-semibold tracking-widest uppercase hover:text-muted-foreground animate-slide-up transition-colors"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {item}
            </Link>
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
