"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";

/**
 * Mobile-app style shell for the storefront: a centered phone-width column.
 * `/admin/*` keeps its own dashboard layout (no app chrome).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-[oklch(0.95_0.02_85)]">
      <div className="relative flex min-h-screen w-full max-w-[480px] flex-col bg-background shadow-app-soft">
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
