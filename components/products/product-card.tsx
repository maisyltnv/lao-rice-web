"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { Product, useStore } from "@/lib/store";
import { formatLAK } from "@/lib/format";
import { ProductImage } from "@/components/products/product-image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="block rounded-[20px] border border-border/70 bg-card p-2 shadow-app-card"
    >
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-muted">
        <ProductImage
          src={product.images[0]}
          alt={product.nameLao}
          productName={product.nameLao}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-1.5 top-1.5 rounded-[10px] bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-primary backdrop-blur-sm">
          {product.categoryLao}
        </span>
        <button
          onClick={handleAddToCart}
          aria-label="ເພີ່ມໃສ່ກະຕ່າ"
          className={`absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition-colors ${
            isAdded ? "bg-green-600" : "bg-primary"
          }`}
        >
          {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>
      <div className="px-1 pb-1 pt-2">
        <h3 className="line-clamp-2 min-h-[34px] text-[13px] font-medium leading-snug">
          {product.nameLao}
        </h3>
        <p className="mt-1 text-[15px] font-extrabold tracking-tight text-primary">
          {formatLAK(product.priceLAK)}
        </p>
      </div>
    </Link>
  );
}
