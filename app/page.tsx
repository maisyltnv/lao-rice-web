"use client";

import { MessageCircle } from "lucide-react";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { AppPromoBanner } from "@/components/home/app-promo-banner";
import { ProductBrowser } from "@/components/products/product-browser";

export default function HomePage() {
  return (
    <>
      <AppTopBar
        title={
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-[10px]" />
            ຮ້ານເຂົ້າສານ
          </span>
        }
        right={
          <a
            href="https://wa.me/8562055551234"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            ແຊັດ
          </a>
        }
      />
      <div className="pt-3">
        <AppPromoBanner />
      </div>
      <ProductBrowser />
    </>
  );
}
