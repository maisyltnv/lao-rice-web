"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/** ສະແດງ Header/Footer ຮ້ານລູກຄ້າເທົ່ານັ້ນ — ໜ້າ `/admin/*` ໃຊ້ chrome ຂອງ admin layout ເອງ */
export function ShopChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
