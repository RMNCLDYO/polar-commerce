'use client';

import { type ComponentProps, type ReactNode } from 'react';

/**
 * React 19.2 ViewTransition Wrapper Component
 *
 * This component provides a forward-compatible API for React's ViewTransition.
 * In React 19.2 stable, ViewTransition is experimental/canary only, so we use
 * the browser's native View Transitions API via viewTransitionName.
 *
 * When ViewTransition becomes stable, this wrapper can be replaced with:
 * import { ViewTransition } from 'react';
 *
 * @see https://react.dev/reference/react/ViewTransition
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
 */

interface ViewTransitionProps {
  /**
   * Unique name for this view transition element.
   * Used to create shared element transitions between routes.
   */
  name: string;
  /**
   * Content to render with view transition
   */
  children: ReactNode;
  /**
   * Additional className for styling
   */
  className?: string;
  /**
   * Additional inline styles (merged with viewTransitionName)
   */
  style?: ComponentProps<'div'>['style'];
}

/**
 * ViewTransition Component
 *
 * Usage:
 * ```tsx
 * <ViewTransition name="product-detail">
 *   <ProductContent />
 * </ViewTransition>
 * ```
 *
 * This creates a shared element transition when navigating between pages.
 * The browser will automatically animate elements with matching names.
 */
export function ViewTransition({
  name,
  children,
  className,
  style,
}: ViewTransitionProps) {
  // Use browser's native View Transitions API via viewTransitionName
  // This is supported in React 19.2 stable via inline styles
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

/**
 * Future migration note:
 *
 * When React's ViewTransition component becomes stable (post-19.2), replace this file with:
 *
 * export { ViewTransition } from 'react';
 *
 * Or update the implementation to use React's component directly:
 *
 * import { ViewTransition as ReactViewTransition } from 'react';
 * export const ViewTransition = ReactViewTransition;
 */
