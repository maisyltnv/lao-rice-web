"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Receipt } from "lucide-react";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";

type PaymentReceiptPreviewProps = {
  receiptUrl?: string | null;
  paymentMethod?: string;
  className?: string;
  /** Customer order cards: small thumb + lightbox. Admin detail: large inline image. */
  variant?: "thumbnail" | "full";
};

export function PaymentReceiptPreview({
  receiptUrl,
  paymentMethod,
  className = "",
  variant = "full",
}: PaymentReceiptPreviewProps) {
  const resolved = resolveApiAssetUrl(receiptUrl);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [resolved]);

  const emptyMessage = paymentMethod?.includes("COD")
    ? "ຄຳສັ່ງ COD — ບໍ່ມີຮູບສະລິບການໂອນ"
    : "ຍັງບໍ່ມີຮູບຫຼັກຖານການຊຳລະ ຫຼື ອັບໂຫຼດບໍ່ສຳເລັດ";

  return (
    <div className={className}>
      <p className="text-sm font-medium mb-2 flex items-center gap-2">
        <Receipt className="h-4 w-4 text-primary" />
        ຫຼັກຖານການຊຳລະເງິນ
      </p>

      {!resolved || loadFailed ? (
        <div
          className={
            variant === "thumbnail"
              ? "rounded-lg border border-dashed border-border bg-muted/40 p-3 text-center"
              : "rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center"
          }
        >
          <ImageIcon
            className={
              variant === "thumbnail"
                ? "h-6 w-6 text-muted-foreground mx-auto mb-1 opacity-60"
                : "h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-60"
            }
          />
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : variant === "thumbnail" ? (
        <div className="flex items-center gap-3">
          <ImagePreviewDialog
            src={resolved}
            alt="ຫຼັກຖານການຊຳລະເງິນ"
            title="ຫຼັກຖານການຊຳລະເງິນ"
            thumbnailClassName="w-16 h-16"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolved}
              alt="ຫຼັກຖານການຊຳລະເງິນ"
              className="w-full h-full object-cover"
              onError={() => setLoadFailed(true)}
            />
          </ImagePreviewDialog>
          <p className="text-xs text-muted-foreground">ແຕະຮູບເພື່ອເບິ່ງໃຫຍ່</p>
        </div>
      ) : (
        <div className="space-y-3">
          <ImagePreviewDialog
            src={resolved}
            alt="ຫຼັກຖານການຊຳລະເງິນ"
            title="ຫຼັກຖານການຊຳລະເງິນ"
            thumbnailClassName="w-full max-h-80 min-h-[120px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolved}
              alt="ຫຼັກຖານການຊຳລະເງິນ"
              className="w-full h-full min-h-[120px] max-h-80 object-contain bg-background"
              onError={() => setLoadFailed(true)}
            />
          </ImagePreviewDialog>
          <p className="text-xs text-muted-foreground text-center">
            ແຕະຮູບເພື່ອເບິ່ງໃຫຍ່
          </p>
        </div>
      )}
    </div>
  );
}
