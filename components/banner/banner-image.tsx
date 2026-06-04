"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getBannerImageSrc } from "@/lib/banner-image-url";
import { isKommodoShareUrl } from "@/lib/product-image";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { RICE_HERO_IMAGES } from "@/lib/rice-images";

function normalizeBannerSrc(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/uploads/")) {
    return resolveApiAssetUrl(trimmed) ?? trimmed;
  }
  return getBannerImageSrc(trimmed);
}

type BannerImageProps = {
  src: string | undefined | null;
  alt: string;
  className?: string;
  fallback?: string;
};

const DEFAULT_FALLBACK = RICE_HERO_IMAGES.field;

export function BannerImage({
  src,
  alt,
  className,
  fallback = DEFAULT_FALLBACK,
}: BannerImageProps) {
  const raw = src?.trim() ?? "";
  const [currentSrc, setCurrentSrc] = useState(() =>
    raw ? normalizeBannerSrc(raw) : fallback
  );

  useEffect(() => {
    if (!raw) {
      setCurrentSrc(fallback);
      return;
    }

    setCurrentSrc(normalizeBannerSrc(raw));

    if (!isKommodoShareUrl(raw)) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/resolve-product-image?url=${encodeURIComponent(raw)}`
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { directUrl?: string | null };
        if (cancelled || !data.directUrl?.trim()) return;
        setCurrentSrc(normalizeBannerSrc(data.directUrl.trim()));
      } catch {
        /* keep initial src */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [raw, fallback]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(className)}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
    />
  );
}
