import Image from "next/image";

export function Footer() {
  return (
    <footer
      className="border-t border-border bg-muted/30 px-8 py-16 animate-slide-up"
      style={{ animationDelay: "1100ms" }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="BANANA SPORTSWEAR"
            width={128}
            height={32}
            className="h-8 w-auto opacity-40"
          />
        </div>
        <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          © 2025 BANANA SPORTSWEAR, INC. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
