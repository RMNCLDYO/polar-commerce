"use client";

import NextLink from "next/link";
import { type ComponentProps, useState } from "react";

type OptimizedLinkProps = ComponentProps<typeof NextLink> & {
  prefetchStrategy?: "hover" | "visible" | "always" | "never";
};

export function OptimizedLink({
  prefetchStrategy = "visible",
  children,
  prefetch,
  ...props
}: OptimizedLinkProps) {
  const [shouldPrefetch, setShouldPrefetch] = useState(
    prefetchStrategy === "always",
  );

  const getPrefetchValue = () => {
    if (prefetchStrategy === "never") return false;
    if (prefetchStrategy === "always") return undefined; // Use default prefetch
    return shouldPrefetch ? undefined : false;
  };

  const handleMouseEnter = () => {
    if (prefetchStrategy === "hover" && !shouldPrefetch) {
      setShouldPrefetch(true);
    }
  };

  const linkProps = {
    ...props,
    prefetch: getPrefetchValue(),
    ...(prefetchStrategy === "hover" && {
      onMouseEnter: handleMouseEnter,
    }),
  };

  return <NextLink {...linkProps}>{children}</NextLink>;
}
