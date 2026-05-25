"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ImageIcon, Receipt } from "lucide-react";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { Button } from "@/components/ui/button";

type PaymentReceiptPreviewProps = {
  receiptUrl?: string | null;
  paymentMethod?: string;
  className?: string;
};

export function PaymentReceiptPreview({
  receiptUrl,
  paymentMethod,
  className = "",
}: PaymentReceiptPreviewProps) {
  const resolved = resolveApiAssetUrl(receiptUrl);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [resolved]);

  return (
    <div className={className}>
      <p className="text-sm font-medium mb-3 flex items-center gap-2">
        <Receipt className="h-4 w-4 text-primary" />
        ຫຼັກຖານການຊຳລະເງິນ
      </p>

      {!resolved || loadFailed ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-60" />
          <p className="text-sm text-muted-foreground">
            {paymentMethod?.includes("COD")
              ? "ຄຳສັ່ງ COD — ບໍ່ມີຮູບສະລິບການໂອນ"
              : "ຍັງບໍ່ມີຮູບຫຼັກຖານການຊຳລະ ຫຼື ອັບໂຫຼດບໍ່ສຳເລັດ"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <a
            href={resolved}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-border overflow-hidden bg-muted/30 hover:ring-2 hover:ring-primary/30 transition-shadow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolved}
              alt="ຫຼັກຖານການຊຳລະເງິນ"
              className="w-full max-h-80 object-contain bg-background"
              onError={() => setLoadFailed(true)}
            />
          </a>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={resolved} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              ເປີດຮູບເຕັມຂະໜາດ
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
