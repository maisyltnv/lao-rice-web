"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, ShoppingBag, ReceiptText, User } from "lucide-react";
import { useStore } from "@/lib/store";

type Tab = {
  href: string;
  icon: typeof Store;
  label: string;
  badge?: boolean;
  match: (p: string) => boolean;
};

const TABS: Tab[] = [
  {
    href: "/",
    icon: Store,
    label: "ຮ້ານ",
    match: (p) => p === "/" || p.startsWith("/products") || p.startsWith("/product"),
  },
  { href: "/cart", icon: ShoppingBag, label: "ກະຕ່າ", badge: true, match: (p) => p.startsWith("/cart") || p.startsWith("/checkout") },
  { href: "/orders", icon: ReceiptText, label: "ຄຳສັ່ງຊື້", match: (p) => p.startsWith("/orders") },
  { href: "/account", icon: User, label: "ບັນຊີ", match: (p) => p.startsWith("/account") || p.startsWith("/login") },
];

export function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useStore();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-card shadow-app-nav">
      <div className="flex items-stretch px-1.5 pt-2 pb-[max(10px,env(safe-area-inset-bottom))]">
        {TABS.map((t) => {
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span
                className={`relative flex items-center justify-center rounded-2xl px-5 py-1 transition-colors ${
                  active ? "bg-accent text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
                {t.badge && cartCount > 0 && (
                  <span className="absolute -top-1 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                    {cartCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] ${
                  active ? "font-semibold text-primary" : "font-medium text-muted-foreground"
                }`}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
