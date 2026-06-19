"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/products/product-card";
import { CategoryChips } from "@/components/home/category-chips";

export function ProductBrowser() {
  const { products, productsLoading } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter((p) => {
      const okQ =
        !t ||
        p.nameLao.toLowerCase().includes(t) ||
        p.name.toLowerCase().includes(t) ||
        p.categoryLao.toLowerCase().includes(t);
      const okC = !cat || p.category === cat;
      return okQ && okC;
    });
  }, [products, q, cat]);

  return (
    <div>
      <div className="px-4 pt-3 pb-1">
        <div className="flex h-12 items-center gap-2 rounded-[14px] border border-border bg-card px-3 focus-within:border-primary">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ຄົ້ນຫາສິນຄ້າ, ລາຍລະອຽດ..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="px-4 pt-2 pb-1">
        <h2 className="text-base font-bold">ຫມວດສິນຄ້າ</h2>
      </div>
      <CategoryChips value={cat} onChange={setCat} />

      {productsLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 px-4 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[0.62] animate-pulse rounded-[20px] bg-muted"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4 py-16 text-center text-sm text-muted-foreground">
          ບໍ່ພົບສິນຄ້າ
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 px-4 py-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
