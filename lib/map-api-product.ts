import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/store";
import { normalizeProductImageUrl } from "@/lib/product-image";

/** Backend profit_margin is often a ratio (e.g. 0.1 = 10%). */
export function profitMarginToPercent(value: number): number {
  if (value <= 1 && value >= 0) return Math.round(value * 100);
  return Math.round(value);
}

export function marginPercentToRatio(percent: number): number {
  return percent / 100;
}

function inferredFinalPriceLak(api: ApiProduct): number {
  const { original_price_cny, exchange_rate, profit_margin } = api;
  return Math.round(original_price_cny * exchange_rate * (1 + profit_margin));
}

export function apiProductToStoreProduct(api: ApiProduct): Product {
  const img = normalizeProductImageUrl(api.image_url, api.name);
  const nested = api.category;
  const slug =
    nested?.slug?.trim() ||
    (api.category_id != null ? `category-${api.category_id}` : "uncategorized");
  const categoryLao =
    nested?.name?.trim() ||
    (api.category_id != null ? `ໝວດ #${api.category_id}` : "—");
  const marginPct = profitMarginToPercent(api.profit_margin);
  const priceLak =
    typeof api.final_price_lak === "number" && !Number.isNaN(api.final_price_lak)
      ? Math.round(api.final_price_lak)
      : inferredFinalPriceLak(api);

  const createdAt = api.created_at;
  const isNew = createdAt
    ? Date.now() - new Date(createdAt).getTime() <
      30 * 24 * 60 * 60 * 1000
    : false;

  return {
    id: String(api.id),
    name: api.name,
    nameLao: api.name,
    description: api.description ?? "",
    descriptionLao: api.description ?? "",
    howToUse: "",
    howToUseLao: "",
    priceCNY: api.original_price_cny,
    priceLAK: priceLak,
    marginPercent: marginPct,
    images: [img],
    category: slug,
    categoryLao,
    stock: 999,
    sourceUrl: api.source_url ?? "",
    trustBadges: ["ຄຸນນະພາບດີ", "ສົ່ງໃນນະຄອນຫຼວງ"],
    isNew,
    isBestSeller: false,
    createdAt,
  };
}
