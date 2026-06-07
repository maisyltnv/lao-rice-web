"use client";

import { useRef } from "react";
import { ImagePlus, Upload, X } from "lucide-react";

export const PAYMENT_RECEIPT_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

export type PaymentReceiptFile = {
  file: File;
  previewUrl: string;
};

type PaymentReceiptUploadProps = {
  value: PaymentReceiptFile | null;
  onChange: (value: PaymentReceiptFile | null) => void;
  disabled?: boolean;
  id?: string;
  compact?: boolean;
};

export function validatePaymentReceiptFile(file: File): string | null {
  if (!file.type || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "ຮູບຕ້ອງເປັນ JPEG, PNG ຫຼື WebP";
  }
  if (file.size > PAYMENT_RECEIPT_MAX_BYTES) {
    return "ຮູບຕ້ອງບໍ່ເກີນ 5 MB";
  }
  return null;
}

export function PaymentReceiptUpload({
  value,
  onChange,
  disabled = false,
  id = "payment-receipt-input",
  compact = false,
}: PaymentReceiptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (file: File | undefined) => {
    if (!file) return;
    const err = validatePaymentReceiptFile(file);
    if (err) {
      alert(err);
      return;
    }
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl);
    onChange({
      file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const handleClear = () => {
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-2"}>
      <div>
        <p className="font-medium text-sm">ອັບໂຫຼດຫຼັກຖານການຊຳລະເງິນ *</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          ອັບໂຫຼດ screenshot ຫຼັງຊຳລະຜ່ານ BCEL One (JPEG, PNG, WebP — ສູງສຸດ 5 MB)
        </p>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          handlePick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {value ? (
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-muted/40 ${
            compact ? "w-full max-w-36" : "w-full max-w-40"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.previewUrl}
            alt="ຫຼັກຖານການຊຳລະ"
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            aria-label="ລຶບຮູບ"
            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/85 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed border-border bg-background/80 transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:opacity-50 ${
            compact
              ? "w-full max-w-sm p-3"
              : "w-full p-4 bg-muted/40 hover:bg-muted/60"
          }`}
        >
          <div className={compact ? "py-1 text-center" : "py-2 text-center"}>
            <Upload
              className={`text-muted-foreground mx-auto mb-2 opacity-70 ${
                compact ? "h-8 w-8" : "h-10 w-10"
              }`}
            />
            <p className="text-sm font-medium text-primary">ກົດເພື່ອເລືອກຮູບ</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <ImagePlus className="h-3.5 w-3.5" />
              ຈາກແກລເລີຍ ຫຼື ກ້ອງ
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
