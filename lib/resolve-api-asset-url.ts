import { getApiBaseUrl } from "@/lib/api";

/** Turns API-relative paths (/uploads/...) into absolute URLs for <img src>. */
export function resolveApiAssetUrl(
  url: string | null | undefined
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = getApiBaseUrl();
  if (!base) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}
