"use client";

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { useStore, type Product } from "@/lib/store";
import { apiListProducts, isApiConfigured } from "@/lib/api";
import { apiProductToStoreProduct } from "@/lib/map-api-product";

const sortOptions = [
  { id: "newest", nameLao: "ໃໝ່ສຸດ" },
  { id: "price-low", nameLao: "ລາຄາຕ່ຳ - ສູງ" },
  { id: "price-high", nameLao: "ລາຄາສູງ - ຕ່ຳ" },
  { id: "bestseller", nameLao: "ຂາຍດີ" },
];

function sortProducts(list: Product[], sortBy: string): Product[] {
  const result = [...list];
  switch (sortBy) {
    case "price-low":
      result.sort((a, b) => a.priceLAK - b.priceLAK);
      break;
    case "price-high":
      result.sort((a, b) => b.priceLAK - a.priceLAK);
      break;
    case "bestseller":
      result.sort(
        (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
      );
      break;
    case "newest":
    default:
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
  }
  return result;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    const timer = window.setTimeout(() => {
      void fetchProducts();
    }, searchQuery.trim() ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [fetchProducts, searchQuery]);

  const sortedProducts = useMemo(
    () => sortProducts(products, sortBy),
    [products, sortBy]
  );

  const applySearchToUrl = () => {
    const params = new URLSearchParams();
    const q = searchQuery.trim();
    if (q) params.set("q", q);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    router.push("/products");
  };

  return (
    <motion.div className="min-h-screen bg-background">
      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-primary-foreground text-center"
          >
            ສິນຄ້າທັງໝົດ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary-foreground/80 text-center mt-2"
          >
            ເລືອກຊື້ເຂົ້າສານຄຸນນະພາບດີ — ສົ່ງພາຍໃນນະຄອນຫຼວງວຽງຈັນ
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loadError && (
          <motion.div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {loadError}
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <form
            className="relative flex-1 max-w-md flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              applySearchToUrl();
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ຄົ້ນຫາສິນຄ້າ (ຊື່, ລາຍລະອຽດ)..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" className="shrink-0">
              ຄົ້ນຫາ
            </Button>
          </form>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.nameLao}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-muted border-0 text-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nameLao}
                </option>
              ))}
            </select>

            <motion.div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid" ? "bg-background shadow-sm" : ""
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list" ? "bg-background shadow-sm" : ""
                }`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </motion.div>
          </div>

          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            ຕົວກອງ
          </Button>
        </div>

        <p className="text-muted-foreground mb-6">
          {loading
            ? "ກຳລັງໂຫຼດ..."
            : `ພົບ ${total} ສິນຄ້າ${searchQuery.trim() ? ` ສຳລັບ «${searchQuery.trim()}»` : ""}`}
        </p>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            ກຳລັງໂຫຼດສິນຄ້າຈາກ API...
          </div>
        ) : sortedProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ
            </p>
            <Button variant="link" onClick={clearFilters}>
              ລ້າງການຄົ້ນຫາ
            </Button>
          </div>
        )}
      </div>

      {isFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => setIsFilterOpen(false)}
            aria-hidden
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl z-50 p-6 max-h-[80vh] overflow-auto"
          >
            <motion.div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">ຕົວກອງ</h3>
              <button type="button" onClick={() => setIsFilterOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </motion.div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">ໝວດໝູ່</h4>
                <div className="flex flex-wrap gap-2">
                  {categoryFilters.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat.nameLao}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">ຈັດລຽງ</h4>
                <motion.div className="flex flex-wrap gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        sortBy === opt.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {opt.nameLao}
                    </button>
                  ))}
                </motion.div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setIsFilterOpen(false);
                  applySearchToUrl();
                }}
              >
                ສະແດງຜົນ ({total} ສິນຄ້າ)
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center py-24 text-muted-foreground">
          ກຳລັງໂຫຼດ...
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
