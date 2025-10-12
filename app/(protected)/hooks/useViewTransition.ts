'use client';

import { useCallback } from 'react';

/**
 * Custom hook for React 19.2 View Transitions
 * Uses the browser's native View Transitions API with React's concurrent features
 *
 * @see https://react.dev/reference/react/ViewTransition
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 */
export function useViewTransition() {
  const startViewTransition = useCallback((callback: () => void) => {
    // Check if the browser supports View Transitions API
    if ('startViewTransition' in document && document.startViewTransition) {
      // Use native browser View Transitions API
      // TypeScript DOM types include ViewTransition API in lib.dom.d.ts
      document.startViewTransition(() => {
        callback();
      });
    } else {
      // Fallback for browsers without View Transitions support
      callback();
    }
  }, []);

  return { startViewTransition };
}
