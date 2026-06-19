"use client";

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { ProductCard } from "@/components/products/product-card";
import { useStore, type Product } from "@/lib/store";
import { apiListProducts, isApiConfigured } from "@/lib/api";
import { apiProductToStoreProduct } from "@/lib/map-api-product";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { categories } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const categoryFilters = useMemo(
    () => [
      { id: "all", nameLao: "ທັງໝົດ" },
      ...categories.map((c) => ({
        id: c.slug?.trim() || `category-${c.id}`,
        nameLao: c.name,
      })),
    ],
    [categories]
  );

  const categoryId = useMemo(() => {
    if (selectedCategory === "all") return undefined;
    const cat = categories.find(
      (c) => (c.slug?.trim() || `category-${c.id}`) === selectedCategory
    );
    return cat?.id;
  }, [selectedCategory, categories]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get("q");
    setSearchQuery(q ?? "");
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    if (!isApiConfigured()) {
      setLoadError("ບໍ່ພົບ NEXT_PUBLIC_API_URL ໃນ .env");
      setProducts([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const { items, total: apiTotal } = await apiListProducts({
        q: searchQuery.trim() || undefined,
        category_id: categoryId,
        limit: 100,
        offset: 0,
      });
      setProducts(items.map(apiProductToStoreProduct));
      setTotal(apiTotal);
    } catch {
      setLoadError("ໂຫຼດສິນຄ້າຈາກ API ບໍ່ສຳເລັດ");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryId]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => void fetchProducts(),
      searchQuery.trim() ? 300 : 0
    );
    return () => window.clearTimeout(timer);
  }, [fetchProducts, searchQuery]);

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-[24px] px-4 py-2 text-[13px] font-semibold transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "border border-border bg-card text-muted-foreground"
    }`;

  return (
    <>
      <AppTopBar back title="ສິນຄ້າທັງໝົດ" />

      <div className="px-4 pt-3 pb-1">
        <div className="flex h-12 items-center gap-2 rounded-[14px] border border-border bg-card px-3 focus-within:border-primary">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ຄົ້ນຫາສິນຄ້າ (ຊື່, ລາຍລະອຽດ)..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
        {categoryFilters.map((cat) => (
          <button
            key={cat.id}
            className={chip(selectedCategory === cat.id)}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.nameLao}
          </button>
        ))}
      </div>

      {loadError && (
        <p className="mx-4 my-2 rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {loadError}
        </p>
      )}

      <p className="px-4 pb-1 pt-1 text-xs text-muted-foreground">
        {loading ? "ກຳລັງໂຫຼດ..." : `ພົບ ${total} ສິນຄ້າ`}
      </p>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 px-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[0.62] animate-pulse rounded-[20px] bg-muted"
            />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 px-4 py-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-16 text-center text-sm text-muted-foreground">
          ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          ກຳລັງໂຫຼດ...
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
