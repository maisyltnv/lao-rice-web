"use client";

import { useRef } from "react";
import { ImagePlus, Link2, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/products/product-image";
import {
  IMAGE_URL_FIELD_HINT,
  IMAGE_VIEWER_PAGE_WARNING,
  isImageViewerPageUrl,
} from "@/lib/product-image";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import type { ProductImageSourceMode } from "@/lib/product-upload-image";

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

export type ProductImageUploadValue = {
  file: File;
  previewUrl: string;
};

type ProductImageFieldProps = {
  mode: ProductImageSourceMode;
  onModeChange: (mode: ProductImageSourceMode) => void;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  uploadValue: ProductImageUploadValue | null;
  onUploadValueChange: (value: ProductImageUploadValue | null) => void;
  productName?: string;
  disabled?: boolean;
};

export function validateProductImageFile(file: File): string | null {
  if (
    !file.type ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  ) {
    return "ຮູບຕ້ອງເປັນ JPEG, PNG ຫຼື WebP";
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return "ຮູບຕ້ອງບໍ່ເກີນ 5 MB";
  }
  return null;
}

function previewSrcForUploadMode(
  uploadValue: ProductImageUploadValue | null,
  imageUrl: string
): string | null {
  if (uploadValue?.previewUrl) return uploadValue.previewUrl;
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;
  return resolveApiAssetUrl(trimmed) ?? trimmed;
}

export function ProductImageField({
  mode,
  onModeChange,
  imageUrl,
  onImageUrlChange,
  uploadValue,
  onUploadValueChange,
  productName,
  disabled = false,
}: ProductImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const switchMode = (next: ProductImageSourceMode) => {
    if (next === mode) return;
    if (uploadValue?.previewUrl) URL.revokeObjectURL(uploadValue.previewUrl);
    onUploadValueChange(null);
    if (inputRef.current) inputRef.current.value = "";
    onModeChange(next);
  };

  const handlePick = (file: File | undefined) => {
    if (!file) return;
    const err = validateProductImageFile(file);
    if (err) {
      alert(err);
      return;
    }
    if (uploadValue?.previewUrl) URL.revokeObjectURL(uploadValue.previewUrl);
    onUploadValueChange({
      file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const handleClearUpload = () => {
    if (uploadValue?.previewUrl) URL.revokeObjectURL(uploadValue.previewUrl);
    onUploadValueChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const uploadPreview = previewSrcForUploadMode(uploadValue, imageUrl);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium">ຮູບສິນຄ້າ</label>
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
          <button
            type="button"
            disabled={disabled}
            onClick={() => switchMode("link")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "link"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            ລິ້ງ
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => switchMode("upload")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            ອັບໂຫຼດ
          </button>
        </div>
      </div>

      {mode === "link" ? (
        <>
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://cdn.example.com/photo.jpg"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">{IMAGE_URL_FIELD_HINT}</p>
          {imageUrl.trim() && isImageViewerPageUrl(imageUrl) && (
            <p className="text-xs text-destructive">{IMAGE_VIEWER_PAGE_WARNING}</p>
          )}
          {imageUrl.trim() && !isImageViewerPageUrl(imageUrl) && (
            <div className="h-24 w-24 overflow-hidden rounded-lg border border-border bg-muted">
              <ProductImage
                src={imageUrl}
                alt="ຕົວຢ່າງຮູບ"
                productName={productName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            ເລືອຮູບ JPEG, PNG ຫຼື WebP ຈາກຄອມພິວເຕີ (ສູງສຸດ 5 MB). ເມື່ອແກ້ໄຂ ແລະ
            ອັບໂຫຼດຮູບໃໝ່ ຮູບເກົ່າທີ່ເກັບໃນເຊີບເວີຈະຖືກລຶບອັດຕະໂນມັດ.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              handlePick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 transition-colors hover:border-primary/40 hover:bg-muted/60 disabled:opacity-50"
          >
            {uploadPreview ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadPreview}
                  alt="ຕົວຢ່າງຮູບ"
                  className="mx-auto max-h-32 max-w-full rounded-lg object-contain"
                />
                {uploadValue && (
                  <p className="text-xs text-muted-foreground truncate">
                    {uploadValue.file.name}
                  </p>
                )}
                {!uploadValue && imageUrl.trim() && (
                  <p className="text-xs text-muted-foreground">
                    ຮູບປັດຈຸບັນ — ເລືອກໄຟລ໌ໃໝ່ເພື່ອປ່ຽນ
                  </p>
                )}
              </div>
            ) : (
              <div className="py-2 text-center">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-70" />
                <p className="text-sm font-medium text-primary">ກົດເພື່ອເລືອກຮູບ</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <ImagePlus className="h-3.5 w-3.5" />
                  ຈາກແກລເລີຍ ຫຼື ກ້ອງ
                </p>
              </div>
            )}
          </button>
          {uploadValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={handleClearUpload}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              ລຶບຮູບທີ່ເລືອກໃໝ່
            </Button>
          )}
        </>
      )}
    </div>
  );
}
