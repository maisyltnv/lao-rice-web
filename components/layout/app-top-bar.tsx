"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AppTopBar({
  title,
  back = false,
  right,
}: {
  title?: ReactNode;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-4">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="ກັບຄືນ"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-accent"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <h1 className="flex-1 truncate text-[18px] font-bold tracking-tight">
          {title}
        </h1>
        {right}
      </div>
    </header>
  );
}
