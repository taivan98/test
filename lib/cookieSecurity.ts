/**
 * Browsers only send `Secure` cookies back over HTTPS. Basing this on
 * NODE_ENV alone is wrong: `next start` sets NODE_ENV=production even when
 * a host is only reachable over plain HTTP (e.g. during initial setup
 * before TLS/DNS is wired up), which would silently break sign-in — the
 * cookie gets set but never comes back, so the user looks logged out.
 */
export function isHttpsOrigin(origin: string): boolean {
  return origin.startsWith("https://");
}
