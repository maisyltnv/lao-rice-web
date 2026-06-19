"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { useStore } from "@/lib/store";
import { formatLAK } from "@/lib/format";
import { ProductImage } from "@/components/products/product-image";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useStore();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <>
        <AppTopBar title="ກະຕ່າ" />
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-primary">
            <ShoppingBag className="h-9 w-9" />
          </div>
          <p className="mt-4 text-[17px] font-bold">ກະຕ່າຫວ່າງເປົ່າ</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ເລືອກສິນຄ້າເພື່ອເພີ່ມໃສ່ກະຕ່າ
          </p>
          <Link
            href="/"
            className="mt-6 rounded-[14px] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            ໄປຊື້ເຄື່ອງ
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AppTopBar title="ກະຕ່າ" />
      <div className="space-y-3 px-4 py-3 pb-44">
        {cart.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="flex gap-3 rounded-[20px] border border-border/70 bg-card p-2.5 shadow-app-soft"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-muted">
              <ProductImage
                src={product.images[0]}
                alt={product.nameLao}
                productName={product.nameLao}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-[14px] font-medium leading-snug">
                  {product.nameLao}
                </h3>
                <button
                  onClick={() => removeFromCart(product.id)}
                  aria-label="ລຶບ"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[13px] font-extrabold text-primary">
                {formatLAK(product.priceLAK)}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-[10px] bg-muted p-1">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    aria-label="ຫຼຸດ"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-primary"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[24px] text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    aria-label="ເພີ່ມ"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-[14px] font-bold text-primary">
                  {formatLAK(product.priceLAK * quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-[68px] left-1/2 z-30 app-width -translate-x-1/2 rounded-t-[24px] border-t border-border bg-card px-4 pb-4 pt-4 shadow-app-soft">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[15px] text-muted-foreground">ລວມຍ່ອຍ</span>
          <span className="text-[20px] font-extrabold text-primary">
            {formatLAK(cartTotal)}
          </span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="w-full rounded-[14px] bg-primary py-3.5 text-center text-[15px] font-semibold text-primary-foreground"
        >
          ດຳເນີນການຊຳລະ ({cartCount})
        </button>
      </div>
    </>
  );
}
