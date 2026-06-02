"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Eye,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, Product } from "@/lib/store";
import { formatLAK } from "@/lib/format";
import { ProductCard } from "@/components/products/product-card";
import { apiGetProduct, isApiConfigured } from "@/lib/api";
import { apiProductToStoreProduct } from "@/lib/map-api-product";
import { ProductImage } from "@/components/products/product-image";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted-foreground text-center">
          {loadError ?? "ກຳລັງໂຫຼດ..."}
        </p>
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
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => router.push("/")} className="hover:text-primary">
            ໜ້າຫຼັກ
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => router.push("/products")} className="hover:text-primary">
            ສິນຄ້າ
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.nameLao}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
              <ProductImage
                src={product.images[selectedImageIndex]}
                alt={product.nameLao}
                productName={product.nameLao}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                    ໃໝ່
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    ຂາຍດີ
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <ProductImage
                      src={image}
                      alt={`${product.nameLao} ${index + 1}`}
                      productName={product.nameLao}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category & Trust Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {product.categoryLao}
              </span>
              {product.trustBadges.map((badge, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.nameLao}
              </h1>
              <p className="text-muted-foreground">{product.name}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatLAK(product.priceLAK)}
              </span>
            </div>

            {/* Urgency Features */}
            <div className="flex flex-col gap-2 p-4 bg-muted/50 rounded-xl">
              {product.stock < 20 && (
                <div className="flex items-center gap-2 text-destructive">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-sm font-medium">
                    ເຫຼືອ {product.stock} ຖົງ
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-sm">
                  ມີຄົນກຳລັງເບິ່ງສິນຄ້ານີ້ {viewersCount} ຄົນ
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">ຈຳນວນ:</span>
              <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-md bg-background flex items-center justify-center hover:bg-muted-foreground/10 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 rounded-md bg-background flex items-center justify-center hover:bg-muted-foreground/10 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className={`flex-1 ${
                  isAdded ? "bg-green-600 hover:bg-green-600" : ""
                }`}
                onClick={handleAddToCart}
              >
                {isAdded ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    ເພີ່ມແລ້ວ!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    ເພີ່ມໃສ່ກະຕ່າ
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">ສົ່ງຟຣີ</p>
                  <p className="text-xs text-muted-foreground">ຄຳສັ່ງເກີນ 500k</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">ເຂົ້າຄຸນນະພາບ</p>
                  <p className="text-xs text-muted-foreground">ຄັດເລືອກແລ້ວ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">ສົ່ງຄືນໄດ້</p>
                  <p className="text-xs text-muted-foreground">ພາຍໃນ 7 ວັນ</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-border">
            <div className="flex items-center gap-8">
              <button className="pb-4 border-b-2 border-primary text-primary font-medium">
                ລາຍລະອຽດສິນຄ້າ
              </button>
              <button className="pb-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
                ວິທີເກັບຮັກສາ
              </button>
            </div>
          </div>

          <div className="py-8">
            <div className="max-w-3xl">
              <h3 className="text-lg font-semibold mb-4">ລາຍລະອຽດ</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.descriptionLao}
              </p>

              <h3 className="text-lg font-semibold mb-4">ວິທີເກັບຮັກສາ</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.howToUseLao ||
                  "ເກັບໃນບ່ອນແຫ້ງ ປ້ອງກັນແມງໄມ້. ປິດຖົງໃຫ້ສົນຫຼັງເປີດແລ້ວ."}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">ສິນຄ້າທີ່ກ່ຽວຂ້ອງ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
