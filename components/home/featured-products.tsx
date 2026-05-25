"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { useStore } from "@/lib/store";
import { pickFeaturedProducts } from "@/lib/home-products";

interface FeaturedProductsProps {
  title: string;
  filter?: "new" | "bestseller" | "all";
}

export function FeaturedProducts({ title, filter = "all" }: FeaturedProductsProps) {
  const { products, productsLoading, productsError } = useStore();

  const filteredProducts = useMemo(
    () => pickFeaturedProducts(products, filter, 4),
    [products, filter]
  );

  return (
    <section className="py-16 bg-muted/30">
      <motion.div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/products">
              <Button variant="ghost" className="group text-primary">
                ເບິ່ງທັງໝົດ
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {productsError && (
          <p className="mb-4 text-sm text-destructive">{productsError}</p>
        )}

        {productsLoading ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-muted animate-pulse"
              />
            ))}
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            ຍັງບໍ່ມີສິນຄ້າ — ເພີ່ມສິນຄ້າທີ່ແອັດມິນ ຫຼື ກວດ API
          </p>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
