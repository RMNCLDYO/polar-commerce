'use client';

import { type ComponentProps, type ReactNode } from 'react';

interface ViewTransitionProps {
  name: string;
  children: ReactNode;
  className?: string;
  style?: ComponentProps<'div'>['style'];
}

export function ViewTransition({
  name,
  children,
  className,
  style,
}: ViewTransitionProps) {
  return (
    <div
      className={className}
      style={{
        ...style,
        viewTransitionName: name,
      }}
    >
      {children}
    </div>
  );
}
