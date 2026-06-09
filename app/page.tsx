"use client";

import { HeroSlider } from "@/components/home/hero-slider";
import { FeaturesSection } from "@/components/home/features-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <FeaturesSection />
      <FeaturedProducts title="ສິນຄ້າຂາຍດີ" filter="bestseller" />
      <CategoriesSection />
      <FeaturedProducts title="ສິນຄ້າໃໝ່" filter="new" />
    </>
  );
}
