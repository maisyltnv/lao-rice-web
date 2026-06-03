import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

/** Local + fallback product images (Unsplash links in DB often 404). */

const IMG = "/images/rice";

export const RICE_PLACEHOLDER = `${IMG}/grains.jpg`;

export const RICE_HERO_IMAGES = {
  field: `${IMG}/field.jpg`,
  grains: `${IMG}/grains.jpg`,
  bowl: `${IMG}/bowl.jpg`,
} as const;

/** Per-product image — served from /public/images/rice */
export const RICE_PRODUCT_IMAGES: Record<string, string> = {
  "ເຂົ້ານາປີ": `${IMG}/grains.jpg`,
  "ເຂົ້ານາແຊງ": `${IMG}/sticky.jpg`,
  "ເຂົ້າໄກ່ນ້ອຍ": `${IMG}/bowl.jpg`,
  "ເຂົ້າຈ້າວມະລິ": `${IMG}/field.jpg`,
  "ເຂົ້າເຈົ້າໄຮ່": `${IMG}/bag.jpg`,
};

export function riceImageForProduct(name: string): string {
  return RICE_PRODUCT_IMAGES[name.trim()] ?? RICE_PLACEHOLDER;
}

/** Remote URLs that are not rice (old skincare/food seeds) — use local rice photos */
const NON_RICE_REMOTE_PATTERNS = [
  "1586201375767",
  "1604329766861",
  "1536304993881",
  "1589302168068",
  "1556228578",
  "1620916566398",
  "1608248597279",
  "1584308666744",
  "1570194065650",
  "1550572017",
  "1596755389378",
  "images.unsplash.com",
  "images.pexels.com",
];

export function isBrokenRemoteImage(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (!u) return true;
  if (u.startsWith("/images/")) return false;
  if (NON_RICE_REMOTE_PATTERNS.some((id) => u.includes(id))) return true;
  return false;
}

/** Pick display URL: local file by product name when remote link is empty or known-bad */
export function resolveProductImageUrl(
  url: string | undefined | null,
  productName?: string
): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed || isBrokenRemoteImage(trimmed)) {
    return productName ? riceImageForProduct(productName) : RICE_PLACEHOLDER;
  }
  if (trimmed.startsWith("/uploads/")) {
    return resolveApiAssetUrl(trimmed) ?? trimmed;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return trimmed;
}
