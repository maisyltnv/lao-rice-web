import type { ProductImageEntry } from "@/components/admin/product-images-field";
import { isImageViewerPageUrl, IMAGE_VIEWER_PAGE_WARNING } from "@/lib/product-image";
import { apiUploadProductImage } from "@/lib/api";

export async function resolveProductImageEntriesForSave(
  entries: ProductImageEntry[],
  options: {
    adminToken: string | null;
    isApiConfigured: boolean;
    fallbackUrl: string;
  }
): Promise<{ urls: string[] } | { error: string }> {
  const resolved: string[] = [];

  for (const entry of entries) {
    if (entry.mode === "upload" && entry.upload) {
      if (!options.isApiConfigured || !options.adminToken) {
        return {
          error:
            "ອັບໂຫຼດຮູບຕ້ອງເຊື່ອມ API ແລະ ເຂົ້າສູ່ລະບົບແອັດມິນ — ໄປ /admin/login",
        };
      }
      try {
        const url = await apiUploadProductImage(entry.upload.file);
        resolved.push(url);
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : "ອັບໂຫຼດຮູບບໍ່ສຳເລັດ",
        };
      }
      continue;
    }

    const trimmed = entry.url.trim();
    if (!trimmed) continue;
    if (isImageViewerPageUrl(trimmed)) {
      return { error: IMAGE_VIEWER_PAGE_WARNING };
    }
    resolved.push(trimmed);
  }

  const unique = [...new Set(resolved)];
  if (unique.length === 0) {
    return { urls: [options.fallbackUrl] };
  }
  return { urls: unique };
}
