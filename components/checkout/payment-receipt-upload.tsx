"use client";

import { useRef } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  compact?: boolean;
  id?: string;
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
  compact = false,
  id = "payment-receipt-input",
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
    <div className="space-y-2">
      <p className="font-medium text-sm">ອັບໂຫຼດຫຼັກຖານການຊຳລະເງິນ *</p>
      <p className="text-xs text-muted-foreground">
        ອັບໂຫຼດ screenshot ຫຼັງຊຳລະຜ່ານ BCEL One (JPEG, PNG, WebP — ສູງສຸດ 5 MB)
      </p>

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

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 transition-colors hover:border-primary/40 hover:bg-muted/60 disabled:opacity-50"
      >
        {value ? (
          <div className="space-y-3">
            <img
              src={value.previewUrl}
              alt="ຫຼັກຖານການຊຳລະ"
              className={`mx-auto max-w-full rounded-lg object-contain ${
                compact ? "max-h-28" : "max-h-44"
              }`}
            />
            <p className="text-xs text-muted-foreground truncate">{value.file.name}</p>
          </div>
        ) : (
          <div className="py-2 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-70" />
            <p className="text-sm font-medium text-primary">ກົດເພື່ອເລືອກຮູບ</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <ImagePlus className="h-3.5 w-3.5" />
              ຈາກແກລເລີຍ ຫຼື ກ້ອງ
            </p>
          </div>
        )}
      </button>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={handleClear}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          ລຶບຮູບ
        </Button>
      )}
    </div>
  );
}
