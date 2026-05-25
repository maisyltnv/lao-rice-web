import type { Product } from "@/lib/store";

/** ເລືອກສິນຄ້າສຳລັບໜ້າຫຼັກ (ສູງສຸດ 4 ລາຍການ) */
export function pickFeaturedProducts(
  products: Product[],
  filter: "new" | "bestseller" | "all",
  limit = 4
): Product[] {
  if (products.length === 0) return [];

  let list: Product[];

  if (filter === "new") {
    list = products.filter((p) => p.isNew);
    if (list.length === 0) {
      list = [...products].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id);
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id);
        return tb - ta;
      });
    }
  } else if (filter === "bestseller") {
    list = products.filter((p) => p.isBestSeller);
    if (list.length === 0) {
      list = [...products].sort((a, b) => b.priceLAK - a.priceLAK);
    }
  } else {
    list = [...products];
  }

  return list.slice(0, limit);
}
