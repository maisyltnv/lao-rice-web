"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Minus, Plus, Check } from "lucide-react";
import { useStore, Product } from "@/lib/store";
import { formatLAK } from "@/lib/format";
import { ProductCard } from "@/components/products/product-card";
import { apiGetProduct, isApiConfigured } from "@/lib/api";
import { apiProductToStoreProduct } from "@/lib/map-api-product";
import { ProductImage } from "@/components/products/product-image";
import { AppTopBar } from "@/components/layout/app-top-bar";

export default function ProductDetailPage() {
  const params = useParams();
  const { products, addToCart } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [viewersCount, setViewersCount] = useState(0);

  useEffect(() => {
    const idParam = params.id;
    if (!idParam || typeof idParam !== "string") return;

    const fromStore = products.find((p) => p.id === idParam);
    if (fromStore) {
      setProduct(fromStore);
      setLoadError(null);
      setViewersCount(Math.floor(Math.random() * 15) + 5);
      return;
    }

    if (!isApiConfigured()) {
      setProduct(null);
      setLoadError("ບໍ່ພົບສິນຄ້າ");
      return;
    }

    setProduct(null);
    setLoadError(null);

    let cancelled = false;
    (async () => {
      try {
        const api = await apiGetProduct(idParam);
        if (cancelled) return;
        setProduct(apiProductToStoreProduct(api));
        setLoadError(null);
        setViewersCount(Math.floor(Math.random() * 15) + 5);
      } catch {
        if (!cancelled) {
          setProduct(null);
          setLoadError("ໂຫຼດສິນຄ້າບໍ່ສຳເລັດ ຫຼື ບໍ່ມີລາຍການນີ້");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.id, products]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <AppTopBar back={true} />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <p className="text-center text-muted-foreground">
            {loadError ?? "ກຳລັງໂຫຼດ..."}
          </p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar back={true} title={product.nameLao} />

      <div className="pb-44">
        {/* Hero image */}
        <div className="px-4 pt-4">
          <div className="relative aspect-square overflow-hidden rounded-[20px] bg-muted">
            <ProductImage
              src={product.images[selectedImageIndex]}
              alt={product.nameLao}
              productName={product.nameLao}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {product.isNew && (
                <span className="rounded-[24px] bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  ໃໝ່
                </span>
              )}
              {product.isBestSeller && (
                <span className="rounded-[24px] bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  ຂາຍດີ
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="no-scrollbar mt-3 flex items-center gap-3 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-[14px] bg-muted ${
                    selectedImageIndex === index ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <ProductImage
                    src={image}
                    alt={`${product.nameLao} ${index + 1}`}
                    productName={product.nameLao}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-5">
          <span className="inline-block rounded-[10px] bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {product.categoryLao}
          </span>
          <h1 className="mt-2 text-[22px] font-extrabold leading-tight text-foreground">
            {product.nameLao}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
          <p className="mt-3 text-[22px] font-extrabold text-primary">
            {formatLAK(product.priceLAK)}
          </p>

          {/* Stock / viewers */}
          <div className="mt-4 flex flex-col gap-2 rounded-[20px] bg-muted px-4 py-3">
            {product.stock < 20 && (
              <div className="flex items-center gap-2 text-destructive">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                <span className="text-sm font-medium">
                  ເຫຼືອ {product.stock} ຖົງ
                </span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              ມີຄົນກຳລັງເບິ່ງສິນຄ້ານີ້ {viewersCount} ຄົນ
            </span>
          </div>

          {/* Quantity selector */}
          <div className="mt-5 flex items-center gap-4">
            <span className="text-[15px] font-bold">ຈຳນວນ</span>
            <div className="flex items-center gap-2 rounded-[10px] bg-muted p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] text-primary"
                aria-label="ຫຼຸດ"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] text-primary"
                aria-label="ເພີ່ມ"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-[15px] font-bold">ລາຍລະອຽດ</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {product.descriptionLao}
            </p>
          </div>

          {/* How to use / storage */}
          <div className="mt-5">
            <h3 className="text-[15px] font-bold">ວິທີເກັບຮັກສາ</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {product.howToUseLao ||
                "ເກັບໃນບ່ອນແຫ້ງ ປ້ອງກັນແມງໄມ້. ປິດຖົງໃຫ້ສົນຫຼັງເປີດແລ້ວ."}
            </p>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-[17px] font-extrabold">
                ສິນຄ້າທີ່ກ່ຽວຂ້ອງ
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-[68px] left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-card px-4 pt-4 pb-4 shadow-app-soft">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">ລາຄາ</span>
            <span className="text-[18px] font-extrabold text-primary">
              {formatLAK(product.priceLAK)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground"
          >
            {isAdded ? (
              <>
                <Check className="h-5 w-5" />
                ເພີ່ມແລ້ວ!
              </>
            ) : (
              "ເພີ່ມໃສ່ກະຕ່າ"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
