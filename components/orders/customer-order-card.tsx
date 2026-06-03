"use client";

import { useState } from "react";
import {
  ChevronDown,
  CreditCard,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";
import type { Order } from "@/lib/store";
import { formatDateLao, formatLAK } from "@/lib/format";
import { normalizeProductImageUrl } from "@/lib/product-image";
import { PaymentReceiptPreview } from "@/components/orders/payment-receipt-preview";
import { ProductImage } from "@/components/products/product-image";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const statusLabel: Record<Order["status"], string> = {
  pending: "ລໍຖ້າ",
  processing: "ກຳລັງດຳເນີນ",
  shipped: "ສົ່ງແລ້ວ",
  delivered: "ສຳເລັດ",
};

type CustomerOrderCardProps = {
  order: Order;
  className?: string;
};

export function CustomerOrderCard({ order, className = "" }: CustomerOrderCardProps) {
  const [open, setOpen] = useState(false);

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const itemsSubtotal = order.items.reduce(
    (sum, i) => sum + i.product.priceLAK * i.quantity,
    0
  );
  const subtotal = order.subtotalLAK ?? itemsSubtotal;
  const shipping = order.shippingFeeLAK ?? Math.max(0, order.totalLAK - subtotal);
  const total = order.totalLAK;
  const addressLine = [order.customerInfo.province, order.customerInfo.address]
    .filter(Boolean)
    .join(" · ");
  const firstItemName = order.items[0]?.product.nameLao;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <article
        className={cn(
          "rounded-xl border border-border bg-card shadow-sm overflow-hidden",
          className
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full text-left p-4 hover:bg-muted/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-primary">{order.id}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                    {statusLabel[order.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateLao(order.createdAt)}
                </p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                  {order.customerInfo.name}
                  {itemCount > 0 ? ` · ${itemCount} ຊິ້ນ` : ""}
                  {firstItemName && !open ? ` · ${firstItemName}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="text-lg font-bold text-primary leading-tight">
                  {formatLAK(total)}
                </p>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </div>
            </div>
            <p className="text-xs text-primary/80 mt-2">
              {open ? "ແຕະເພື່ອຫຍໍ້ລາຍລະອຽດ" : "ແຕະເພື່ອເບິ່ງລາຍລະອຽດຄຳສັ່ງ"}
            </p>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border">
            <div className="grid gap-2 text-sm pt-4">
              <div className="flex items-start gap-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="text-foreground font-medium">
                  {order.customerInfo.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{order.customerInfo.phone}</span>
              </div>
              {addressLine ? (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{addressLine}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>{order.paymentMethod}</span>
              </div>
            </div>

            {order.items.length > 0 ? (
              <div className="border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  ລາຍການສິນຄ້າ ({itemCount} ຊິ້ນ)
                </p>
                <ul className="space-y-3">
                  {order.items.map((item, idx) => {
                    const thumbSrc = normalizeProductImageUrl(
                      item.product.images[0],
                      item.product.nameLao
                    );
                    return (
                      <li
                        key={`${item.product.id}-${idx}`}
                        className="flex gap-3 text-sm"
                      >
                        <ImagePreviewDialog
                          src={thumbSrc}
                          alt={item.product.nameLao}
                          title={item.product.nameLao}
                          thumbnailClassName="w-14 h-14"
                        >
                          <ProductImage
                            src={item.product.images[0]}
                            alt={item.product.nameLao}
                            productName={item.product.nameLao}
                            className="w-full h-full object-cover"
                          />
                        </ImagePreviewDialog>
                        <div className="flex-1 min-w-0 flex justify-between gap-2">
                          <span className="text-foreground min-w-0">
                            <span className="line-clamp-2">
                              {item.product.nameLao}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              ×{item.quantity}
                            </span>
                          </span>
                          <span className="font-medium shrink-0">
                            {formatLAK(item.product.priceLAK * item.quantity)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground border-t border-border pt-3">
                ບໍ່ມີລາຍລະອຽດສິນຄ້າໃນຄຳສັ່ງນີ້
              </p>
            )}

            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>ລວມສິນຄ້າ</span>
                <span>{formatLAK(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ຄ່າຈັດສົ່ງ</span>
                <span>{shipping <= 0 ? "ຟຣີ" : formatLAK(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-primary text-base pt-1">
                <span>ລວມທັງໝົດ</span>
                <span>{formatLAK(total)}</span>
              </div>
            </div>

            <PaymentReceiptPreview
              receiptUrl={order.paymentReceiptUrl}
              paymentMethod={order.paymentMethod}
              variant="thumbnail"
              className="border-t border-border pt-3"
            />
          </div>
        </CollapsibleContent>
      </article>
    </Collapsible>
  );
}
