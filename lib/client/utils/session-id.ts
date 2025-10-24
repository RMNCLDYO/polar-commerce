/**
 * Get or create a session ID for guest users
 * Session IDs are stored in localStorage and persist across page reloads
 * @param key - The localStorage key to use (e.g., 'cart-session-id', 'wishlist-session-id')
 * @returns The session ID string, or empty string if running on server
 */
export function getOrCreateSessionId(key: string): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    sessionId = `${key}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(key, sessionId);
  }

  return sessionId;
}
