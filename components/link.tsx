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
  const [shouldPrefetch, setShouldPrefetch] = useState(
    prefetchStrategy !== 'hover',
  );

  // Simplified prefetch logic
  const prefetchValue =
    prefetchStrategy === 'never'
      ? false
      : prefetchStrategy === 'always'
        ? true
        : prefetchStrategy === 'hover' && !shouldPrefetch
          ? false
          : null;

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetchStrategy === 'hover' && !shouldPrefetch) {
      setShouldPrefetch(true);
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
