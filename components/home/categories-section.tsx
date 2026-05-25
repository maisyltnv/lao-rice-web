"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductImage } from "@/components/products/product-image";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/product-image";
import { RICE_HERO_IMAGES } from "@/lib/rice-images";

export function CategoriesSection() {
  const { categories, categoriesLoading, categoriesError, products } = useStore();

  const displayCategories = useMemo(() => {
    return categories.map((cat) => {
      const slug = cat.slug?.trim() || `category-${cat.id}`;
      const inCategory = products.filter((p) => p.category === slug);
      const defaultCover =
        slug === "khao-jao" ? RICE_HERO_IMAGES.grains : RICE_HERO_IMAGES.bowl;
      const cover =
        inCategory.find((p) => p.images[0] && p.images[0] !== PRODUCT_PLACEHOLDER_IMAGE)
          ?.images[0] ?? defaultCover;

      return {
        id: cat.id,
        name: cat.name,
        slug,
        description: cat.description?.trim() || cat.name,
        image: cover,
        productCount: inCategory.length,
      };
    });
  }, [categories, products]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            ໝວດໝູ່ສິນຄ້າ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            ເລືອກຊະນິດເຂົ້າທີ່ທ່ານມັກ — ເຂົ້າຈ້າວ ແລະ ເຂົ້າໜຽວ
          </motion.p>
        </motion.div>

        {categoriesError && (
          <p className="mb-6 text-center text-sm text-destructive">
            {categoriesError}
          </p>
        )}

        {categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-72 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : displayCategories.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            ຍັງບໍ່ມີໝວດໝູ່ — ສ້າງທີ່ແອັດມິນ /admin/categories
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/products?category=${encodeURIComponent(category.slug)}`}>
                  <div className="group relative h-72 rounded-xl overflow-hidden">
                    <ProductImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground">
                      <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                      <p className="text-sm text-primary-foreground/80 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {category.productCount} ສິນຄ້າ
                        </span>
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
