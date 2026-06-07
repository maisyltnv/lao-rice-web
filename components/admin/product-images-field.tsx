"use client";

import { ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProductImageField,
  type ProductImageUploadValue,
} from "@/components/admin/product-image-field";
import type { ProductImageSourceMode } from "@/lib/product-upload-image";

export const MAX_PRODUCT_IMAGES = 12;

export type ProductImageEntry = {
  url: string;
  mode: ProductImageSourceMode;
  upload: ProductImageUploadValue | null;
};

export function createEmptyImageEntry(): ProductImageEntry {
  return { url: "", mode: "link", upload: null };
}

export function imageEntriesFromUrls(urls: string[]): ProductImageEntry[] {
  const cleaned = urls.map((u) => u.trim()).filter(Boolean);
  if (cleaned.length === 0) return [createEmptyImageEntry()];
  return cleaned.map((url) => ({
    url,
    mode: "link" as const,
    upload: null,
  }));
}

type ProductImagesFieldProps = {
  entries: ProductImageEntry[];
  onChange: (entries: ProductImageEntry[]) => void;
  productName?: string;
  disabled?: boolean;
};

export function ProductImagesField({
  entries,
  onChange,
  productName,
  disabled = false,
}: ProductImagesFieldProps) {
  const updateEntry = (index: number, patch: Partial<ProductImageEntry>) => {
    onChange(
      entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    );
  };

  const removeEntry = (index: number) => {
    const next = entries.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [createEmptyImageEntry()]);
  };

  const moveEntry = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addEntry = () => {
    if (entries.length >= MAX_PRODUCT_IMAGES) return;
    onChange([...entries, createEmptyImageEntry()]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">ຮູບສິນຄ້າ</p>
          <p className="text-xs text-muted-foreground">
            ຮູບທຳອິດ = ໜ້າປົກ · ສູງສຸດ {MAX_PRODUCT_IMAGES} ຮູບ
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || entries.length >= MAX_PRODUCT_IMAGES}
          onClick={addEntry}
          className="gap-1.5"
        >
          <ImagePlus className="h-4 w-4" />
          ເພີ່ມຮູບ
        </Button>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-muted/20 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                {index === 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Star className="h-3 w-3" />
                    ໜ້າປົກ
                  </span>
                ) : (
                  <span className="text-muted-foreground">ຮູບ #{index + 1}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => moveEntry(index, -1)}
                  >
                    ↑
                  </Button>
                )}
                {index < entries.length - 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => moveEntry(index, 1)}
                  >
                    ↓
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled || (entries.length === 1 && !entry.url && !entry.upload)}
                  onClick={() => removeEntry(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ProductImageField
              mode={entry.mode}
              onModeChange={(mode) => updateEntry(index, { mode, upload: null })}
              imageUrl={entry.url}
              onImageUrlChange={(url) => updateEntry(index, { url })}
              uploadValue={entry.upload}
              onUploadValueChange={(upload) => updateEntry(index, { upload })}
              productName={productName}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
