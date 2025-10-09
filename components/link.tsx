'use client';

import NextLink from 'next/link';
import { type ComponentProps, useState } from 'react';

type LinkProps = ComponentProps<typeof NextLink> & {
  prefetchStrategy?: 'hover' | 'visible' | 'always' | 'never';
};

export function Link({
  prefetchStrategy = 'visible',
  children,
  ...props
}: LinkProps) {
  const [hovered, setHovered] = useState(false);

  // Determine prefetch behavior based on strategy
  const prefetchValue =
    prefetchStrategy === 'never'
      ? false
      : prefetchStrategy === 'always'
        ? true
        : prefetchStrategy === 'hover'
          ? hovered
            ? null
            : false // null = restore default prefetch on hover
          : null; // 'visible' uses default behavior

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetchStrategy === 'hover' && !hovered) {
      setHovered(true);
    }
    props.onMouseEnter?.(e);
  };

  return (
    <NextLink
      {...props}
      prefetch={prefetchValue}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </NextLink>
  );
}
