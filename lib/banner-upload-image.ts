import type { ProductImageSourceMode } from "@/lib/product-upload-image";

/** Paths returned by POST /banners/upload-image on lao-rice-api. */
export const BANNER_IMAGE_UPLOAD_SEGMENT = "/uploads/banner-images/";

export function isUploadedBannerImageUrl(
  url: string | null | undefined
): boolean {
  const t = url?.trim() ?? "";
  return t.includes(BANNER_IMAGE_UPLOAD_SEGMENT);
}

export function bannerImageSourceModeForUrl(
  url: string | null | undefined
): ProductImageSourceMode {
  return isUploadedBannerImageUrl(url) ? "upload" : "link";
}
