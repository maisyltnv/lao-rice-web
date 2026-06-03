"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Package, Phone, ShoppingCart, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CustomerProfileForm } from "@/components/account/customer-profile-form";
import { getCustomerPhone } from "@/lib/customer-account";
import { useStore } from "@/lib/store";

export default function AccountPage() {
  const router = useRouter();
  const { user, token, isReady, logout } = useAuth();
  const { cartCount } = useStore();
  const phone = getCustomerPhone(user);

  useEffect(() => {
    if (isReady && !token) {
      router.replace(`/login?redirect=${encodeURIComponent("/account")}`);
    }
  }, [isReady, token, router]);

  if (!isReady || !token) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        ກຳລັງໂຫຼດ...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              ບັນຊີຂອງຂ້ອຍ
            </p>
            <h1 className="text-xl font-bold">ເຂົ້າລະບົບແລ້ວ</h1>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
            <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">ເບີໂທລະສັບ</p>
              <p className="font-semibold">{phone || "—"}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            ຄຳສັ່ງຊື້ຜູກກັບເບີໂທນີ້ ແລະ ບັນຊີທີ່ເຂົ້າລະບົບດ້ວຍ OTP
          </p>
        </div>

        <CustomerProfileForm />

        <div className="space-y-2 mt-8">
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/orders">
              <Package className="h-4 w-4" />
              ຄຳສັ່ງຊື້ຂອງຂ້ອຍ
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/products">
              <ShoppingCart className="h-4 w-4" />
              ກະຕ່າສິນຄ້າ
              {cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/shipping">
              <Truck className="h-4 w-4" />
              ການຈັດສົ່ງ ແລະ ຄ່າສົ່ງ
            </Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full mt-6 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          onClick={() => {
            logout();
            router.replace("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          ອອກຈາກລະບົບ
        </Button>
      </div>
    </div>
  );
}
