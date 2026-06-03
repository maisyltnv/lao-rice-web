"use client";

import { useState, type ReactNode } from "react";
import { ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ImagePreviewDialogProps = {
  src: string;
  alt: string;
  title?: string;
  thumbnailClassName?: string;
  children?: ReactNode;
};

/** Small tappable thumbnail; opens a lightbox with the full image. */
export function ImagePreviewDialog({
  src,
  alt,
  title,
  thumbnailClassName,
  children,
}: ImagePreviewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative shrink-0 rounded-lg border border-border overflow-hidden bg-muted/40",
          "hover:ring-2 hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-shadow group",
          thumbnailClassName ?? "w-14 h-14"
        )}
        aria-label={`ເບິ່ງຮູບ: ${alt}`}
      >
        {children ?? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
          <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 drop-shadow" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] p-3 gap-2 overflow-hidden"
          showCloseButton
        >
          <DialogTitle className="sr-only">{title ?? alt}</DialogTitle>
          <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center min-h-[200px] max-h-[75vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
            />
          </div>
          {title ? (
            <p className="text-sm text-muted-foreground text-center px-2">
              {title}
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
