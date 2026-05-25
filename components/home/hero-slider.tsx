"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ApiBanner } from "@/lib/api-types";
import { apiListPublicBanners, isApiConfigured } from "@/lib/api";
import { getBannerImageSrc } from "@/lib/banner-image-url";
import { RICE_HERO_IMAGES } from "@/lib/rice-images";

type HeroSlide = {
  id: number;
  titleLao: string;
  subtitleLao: string;
  descriptionLao: string;
  image: string;
  ctaLao: string;
  href: string;
};

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 1,
    titleLao: "ເຂົ້າສານຄຸນນະພາບດີ",
    subtitleLao: "ຈັດສົ່ງພາຍໃນນະຄອນຫຼວງວຽງຈັນ",
    descriptionLao: "ເຂົ້າຈ້າວ · ເຂົ້າໜຽວ · ສັ່ງອອນລາຍ ຮັບເຖິງບ້ານ",
    image: RICE_HERO_IMAGES.field,
    ctaLao: "ເລືອກຊື້ເຂົ້າ",
    href: "/products",
  },
  {
    id: 2,
    titleLao: "ເຂົ້າໜຽວ 25 ກິໂລ",
    subtitleLao: "ນາປີ · ນາແຊງ · ໄກ່ນ້ອຍ",
    descriptionLao: "ເລືອກຊະນິດທີ່ທ່ານມັກ ແລະ ກຳນົດຈຸດສົ່ງດ້ວຍແຜນທີ່",
    image: RICE_HERO_IMAGES.grains,
    ctaLao: "ເບິ່ງສິນຄ້າ",
    href: "/products",
  },
  {
    id: 3,
    titleLao: "ເຂົ້າຈ້າວຫອມນຸ່ມ",
    subtitleLao: "ມະລິ · ເຈົ້າໄຮ່",
    descriptionLao: "ສົ່ງໄວ ຊຳລະ BCEL QR ຫຼື COD",
    image: RICE_HERO_IMAGES.bowl,
    ctaLao: "ສັ່ງເລີຍ",
    href: "/products",
  },
];

function bannerToSlide(b: ApiBanner): HeroSlide {
  return {
    id: b.id,
    titleLao: b.title,
    subtitleLao: b.subtitle ?? "",
    descriptionLao: b.description ?? "",
    image: getBannerImageSrc(b.image_url),
    ctaLao: b.cta_label?.trim() || "ເບິ່ງເພີ່ມເຕີມ",
    href: b.link_url?.trim() || "/products",
  };
}

export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  const loadBanners = useCallback(async () => {
    if (!isApiConfigured()) return;
    try {
      const items = await apiListPublicBanners();
      const active = items
        .filter((b) => b.is_active !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      if (active.length > 0) {
        setSlides(active.map(bannerToSlide));
        setCurrentSlide(0);
      }
    } catch {
      /* keep fallback slides */
    }
  }, []);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];
  if (!slide) return null;

  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-muted">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <motion.div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.titleLao}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
          </motion.div>

          <motion.div className="relative h-full container mx-auto px-4 flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-xl text-primary-foreground"
            >
              {slide.subtitleLao ? (
                <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-full mb-4">
                  {slide.subtitleLao}
                </span>
              ) : null}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-balance">
                {slide.titleLao}
              </h1>
              {slide.descriptionLao ? (
                <p className="text-lg md:text-xl text-primary-foreground/90 mb-8">
                  {slide.descriptionLao}
                </p>
              ) : null}
              <Link href={slide.href}>
                <Button
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 group"
                >
                  {slide.ctaLao}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-foreground hover:bg-background/40 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-foreground hover:bg-background/40 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((s, index) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-secondary"
                    : "w-2 bg-primary-foreground/50 hover:bg-primary-foreground/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
