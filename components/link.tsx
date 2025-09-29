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

  const getPrefetchValue = () => {
    if (prefetchStrategy === 'never') return false;
    if (prefetchStrategy === 'always') return true;
    if (prefetchStrategy === 'visible') return null;
    if (prefetchStrategy === 'hover') {
      return shouldPrefetch ? null : false;
    }
    return null;
  };

  const linkProps = {
    ...props,
    prefetch: getPrefetchValue(),
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetchStrategy === 'hover' && !shouldPrefetch) {
        setShouldPrefetch(true);
      }
      props.onMouseEnter?.(e);
    },
  };

  return <NextLink {...linkProps}>{children}</NextLink>;
}
