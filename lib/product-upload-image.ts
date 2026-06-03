/** Paths returned by POST /products/upload-image on lao-rice-api. */
export const PRODUCT_IMAGE_UPLOAD_SEGMENT = "/uploads/product-images/";

export function isUploadedProductImageUrl(
  url: string | null | undefined
): boolean {
  const t = url?.trim() ?? "";
  return t.includes(PRODUCT_IMAGE_UPLOAD_SEGMENT);
}

export type ProductImageSourceMode = "link" | "upload";

export function imageSourceModeForUrl(
  url: string | null | undefined
): ProductImageSourceMode {
  return isUploadedProductImageUrl(url) ? "upload" : "link";
}
