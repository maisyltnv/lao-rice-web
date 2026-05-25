"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  PRODUCT_PLACEHOLDER_IMAGE,
  isKommodoShareUrl,
  normalizeProductImageUrl,
  riceImageForProduct,
} from "@/lib/product-image";

type ProductImageProps = {
  src: string | undefined | null;
  alt: string;
  productName?: string;
  className?: string;
};

export function ProductImage({ src, alt, productName, className }: ProductImageProps) {
  const fallback = productName
    ? riceImageForProduct(productName)
    : PRODUCT_PLACEHOLDER_IMAGE;

  const normalized = normalizeProductImageUrl(src, productName);
  const [currentSrc, setCurrentSrc] = useState(normalized);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const next = normalizeProductImageUrl(src, productName);
    setCurrentSrc(next);
    setResolved(false);

    const raw = src?.trim() ?? "";
    if (!raw || !isKommodoShareUrl(raw)) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/resolve-product-image?url=${encodeURIComponent(raw)}`
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { directUrl?: string };
        if (cancelled || !data.directUrl) return;
        setCurrentSrc(normalizeProductImageUrl(data.directUrl, productName));
      } catch {
        /* keep normalized */
      } finally {
        if (!cancelled) setResolved(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, productName]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(className)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      data-kommodo-resolved={isKommodoShareUrl(src ?? "") ? resolved : undefined}
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
    />
  );
}
