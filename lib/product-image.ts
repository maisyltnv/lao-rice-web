import {
  RICE_PLACEHOLDER,
  isBrokenRemoteImage,
  resolveProductImageUrl,
  riceImageForProduct,
} from "@/lib/rice-images";

export const PRODUCT_PLACEHOLDER_IMAGE = RICE_PLACEHOLDER;

export { riceImageForProduct, resolveProductImageUrl, isBrokenRemoteImage };

const KOMODO_SHARE_RE = /kommodo\.ai\/i\/([^/?#]+)/i;

export function isKommodoShareUrl(url: string): boolean {
  return KOMODO_SHARE_RE.test(url.trim());
}

export function extractKommodoShareId(url: string): string | null {
  const m = url.trim().match(KOMODO_SHARE_RE);
  return m?.[1] ?? null;
}

export function isImageViewerPageUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (!u) return false;
  if (isKommodoShareUrl(u)) return false;
  if (/imgur\.com\/(a|gallery)\//.test(u)) return true;
  if (/drive\.google\.com\/file\//.test(u)) return true;
  if (/dropbox\.com\/(s|sh)\//.test(u) && !u.includes("raw=1")) return true;
  return false;
}

export function normalizeProductImageUrl(
  url: string | undefined | null,
  productName?: string
): string {
  if (isImageViewerPageUrl(url ?? "")) {
    return productName ? riceImageForProduct(productName) : PRODUCT_PLACEHOLDER_IMAGE;
  }
  return resolveProductImageUrl(url, productName);
}

export const IMAGE_URL_FIELD_HINT =
  "ວາງລິ້ງ .jpg/.png ໂດຍກົງ ຫຼື ປ່ອຍວ່າງໃຫ້ໃຊ້ຮູບເຂົ້າຕົວຢ່າງອັດຕະໂນມັດ";

export const IMAGE_VIEWER_PAGE_WARNING =
  "ລິ້ງນີ້ເປັນໜ້າເວັບແບ່ງຮູບ ບໍ່ແມ່ນ URL ຮູບໂດຍກົງ";
