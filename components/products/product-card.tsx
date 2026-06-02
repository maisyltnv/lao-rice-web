"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, useStore } from "@/lib/store";
import { formatLAK } from "@/lib/format";
import { ProductImage } from "@/components/products/product-image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <div
          className="relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <ProductImage
              src={product.images[0]}
              alt={product.nameLao}
              productName={product.nameLao}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNew && (
                <span className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  ໃໝ່
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  ຂາຍດີ
                </span>
              )}
            </div>

            {/* Trust Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {product.trustBadges.slice(0, 2).map((badge, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-medium rounded-full border border-primary/20"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute bottom-3 left-3 right-3 flex items-center gap-2"
            >
              <Button
                onClick={handleAddToCart}
                className={`flex-1 ${
                  isAdded
                    ? "bg-green-600 hover:bg-green-600"
                    : "bg-primary hover:bg-primary/90"
                } text-primary-foreground`}
                size="sm"
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    ເພີ່ມແລ້ວ
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    ເພີ່ມໃສ່ກະຕ່າ
                  </>
                )}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="shrink-0"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="shrink-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              {product.categoryLao}
            </p>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {product.nameLao}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary">
                {formatLAK(product.priceLAK)}
              </p>
              {product.stock < 10 && (
                <span className="text-xs text-destructive">
                  ເຫຼືອ {product.stock} ຖົງ
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
