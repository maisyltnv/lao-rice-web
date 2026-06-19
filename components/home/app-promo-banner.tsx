"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiListPublicBanners } from "@/lib/api";
import { getBannerImageSrc } from "@/lib/banner-image-url";
import type { ApiBanner } from "@/lib/api-types";

export function AppPromoBanner() {
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    let on = true;
    apiListPublicBanners()
      .then((b) => {
        if (on) setBanners(b.filter((x) => x.is_active !== false));
      })
      .catch(() => {});
    return () => {
      on = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="px-4">
        <div className="relative flex h-28 flex-col justify-center overflow-hidden rounded-[20px] bg-primary p-5 text-primary-foreground">
          <span className="mb-1 self-start rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">
            ໂປຣໂມຊັນ
          </span>
          <div className="text-[18px] font-extrabold leading-tight">
            ເຂົ້າສານຄຸນນະພາບ
          </div>
          <div className="text-[12px] opacity-90">ສົ່ງຮອດເຮືອນ ໃນນະຄອນຫຼວງວຽງຈັນ</div>
        </div>
      </div>
    );
  }

  const b = banners[i];
  const inner = (
    <div className="relative h-32 overflow-hidden rounded-[20px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getBannerImageSrc(b.image_url)}
        alt={b.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/5" />
      <div className="relative flex h-full flex-col justify-end p-4 text-white">
        <div className="line-clamp-2 text-[18px] font-extrabold leading-tight">
          {b.title}
        </div>
        {b.subtitle && (
          <div className="line-clamp-1 text-[12px] opacity-90">{b.subtitle}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-4">
      {b.link_url ? <Link href={b.link_url}>{inner}</Link> : inner}
      {banners.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {banners.map((_, k) => (
            <span
              key={k}
              className={`h-1.5 rounded-full transition-all ${
                k === i ? "w-4 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
