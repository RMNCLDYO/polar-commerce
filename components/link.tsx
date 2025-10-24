'use client';

import NextLink from 'next/link';
import { forwardRef, type ComponentProps, useState } from 'react';

type LinkProps = ComponentProps<typeof NextLink> & {
  prefetchStrategy?: 'hover' | 'visible' | 'always' | 'never';
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ prefetchStrategy = 'visible', children, ...props }, ref) => {
    const [hovered, setHovered] = useState(false);

    const prefetchValue =
      prefetchStrategy === 'never'
        ? false
        : prefetchStrategy === 'always'
          ? true
          : prefetchStrategy === 'hover'
            ? hovered
              ? null
              : false
            : null;

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetchStrategy === 'hover' && !hovered) {
        setHovered(true);
      }
      props.onMouseEnter?.(e);
    };

    return (
      <NextLink
        {...props}
        ref={ref}
        prefetch={prefetchValue}
        onMouseEnter={handleMouseEnter}
      >
        {children}
      </NextLink>
    );
  },
);

Link.displayName = 'Link';
