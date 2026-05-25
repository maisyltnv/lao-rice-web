"use client";

import { Shield } from "lucide-react";
import { LoginScreen } from "@/components/auth/login-screen";

export default function AdminLoginPage() {
  return (
    <LoginScreen
      portal="admin"
      Icon={Shield}
      brandTitle="ເຂົ້າລະບົບແອັດມິນ"
      brandSubtitle="ຈັດການສິນຄ້າ ແລະ ຄຳສັ່ງ (ຕ້ອງມີ JWT)"
      redirectIfAuthed="/admin"
      redirectAfterAuth="/admin"
      alternateHint={{
        href: "/login",
        label: "ໄປໜ້າເຂົ້າລູກຄ້າ",
        description: "ບໍ່ແມ່ນພະນັກງານ?",
      }}
    />
  );
}
