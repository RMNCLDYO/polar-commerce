"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useRef } from "react";

type OptimizedLinkProps = ComponentProps<typeof NextLink> & {
  prefetchStrategy?: "hover" | "visible" | "always" | "never";
};

export function OptimizedLink({
  prefetchStrategy = "visible",
  children,
  prefetch,
  ...props
}: OptimizedLinkProps) {
  const router = useRouter();
  const hasPrefetched = useRef(false);

  const getPrefetchValue = () => {
    if (prefetchStrategy === "never") return false;
    if (prefetchStrategy === "always") return true;
    if (prefetchStrategy === "visible") return undefined; // Default Next.js behavior
    if (prefetchStrategy === "hover") return false; // Don't prefetch until hover
    return undefined;
  };

  const handleMouseEnter = () => {
    if (prefetchStrategy === "hover" && !hasPrefetched.current) {
      hasPrefetched.current = true;
      router.prefetch(props.href.toString());
    }
  };

  const linkProps = {
    ...props,
    prefetch: getPrefetchValue(),
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      props.onMouseEnter?.(e);
    },
  };

  return <NextLink {...linkProps}>{children}</NextLink>;
}
