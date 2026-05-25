/** Hosts that often block hotlink / CORS in <img>; serve via same-origin proxy. */
const PROXY_HOSTS = new Set([
  "plain-apac-prod-public.komododecks.com",
  "kommodo-ai-prod-static.komododecks.com",
]);

/**
 * Same-origin URL for banner images so the browser does not hit CDN CORS/hotlink limits.
 */
export function getBannerImageSrc(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return trimmed;
    if (PROXY_HOSTS.has(parsed.hostname)) {
      return `/api/banner-image?url=${encodeURIComponent(trimmed)}`;
    }
  } catch {
    /* use raw url */
  }
  return trimmed;
}
