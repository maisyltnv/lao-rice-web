"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Package, ShoppingCart, Truck, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiDeleteCustomerAccount } from "@/lib/api";
import { CustomerProfileForm } from "@/components/account/customer-profile-form";
import { getCustomerPhone } from "@/lib/customer-account";
import { getCustomerProfileFromUser } from "@/lib/customer-profile";
import { useStore } from "@/lib/store";
import { AppTopBar } from "@/components/layout/app-top-bar";

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

  const displayName = (
    getCustomerProfileFromUser(user)?.recipientName || ""
  ).trim();
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "";

  const tiles = [
    { href: "/orders", label: "ຄຳສັ່ງຊື້ຂອງຂ້ອຍ", icon: Package },
    { href: "/shipping", label: "ຂໍ້ມູນການຈັດສົ່ງ", icon: Truck },
    {
      href: "/cart",
      label: `ກະຕ່າ${cartCount > 0 ? ` (${cartCount})` : ""}`,
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="pb-6">
      <AppTopBar title="ບັນຊີ" />

      {/* PROFILE HEADER */}
      <div className="px-4 mt-3">
        <div className="rounded-[24px] border border-border bg-accent p-4 flex items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
            {initial ? (
              <span className="text-[24px] font-extrabold text-primary">
                {initial}
              </span>
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[20px] font-extrabold truncate">
              {displayName || "ບັນຊີຂອງຂ້ອຍ"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {phone || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ACTION TILES */}
      <div className="px-4 mt-4 space-y-2">
        {tiles.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-[14px] bg-card shadow-app-soft px-4 py-3.5"
          >
            <Icon className="h-5 w-5 text-primary shrink-0" />
            <span className="font-medium flex-1">{label}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>

      {/* PROFILE EDIT FORM */}
      <div className="px-4 mt-4">
        <CustomerProfileForm />
      </div>

      {/* LOGOUT */}
      <div className="px-4 mt-4">
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/");
          }}
          className="w-full rounded-[14px] border border-destructive/40 py-3 font-semibold text-destructive"
        >
          ອອກຈາກລະບົບ
        </button>
      </div>

      {/* DELETE ACCOUNT */}
      <div className="px-4 mt-2 mb-6">
        <button
          type="button"
          onClick={async () => {
            if (
              !window.confirm(
                "ການລຶບບັນຊີຈະລຶບຂໍ້ມູນສ່ວນຕົວຂອງທ່ານຖາວອນ ແລະ ບໍ່ສາມາດກູ້ຄືນໄດ້. ຢືນຢັນບໍ?"
              )
            )
              return;
            try {
              await apiDeleteCustomerAccount();
            } catch {
              window.alert("ລຶບບັນຊີບໍ່ສຳເລັດ ລອງໃໝ່ອີກຄັ້ງ");
              return;
            }
            logout();
            router.replace("/");
          }}
          className="w-full py-3 text-sm font-medium text-muted-foreground underline"
        >
          ລຶບບັນຊີ
        </button>
      </div>
    </div>
  );
}
