"use client";

import { Heart } from "lucide-react";
import { LoginScreen } from "@/components/auth/login-screen";

export default function CustomerLoginPage() {
  return (
    <LoginScreen
      portal="customer"
      Icon={Heart}
      brandTitle="ເຂົ້າລະບົບລູກຄ້າ"
      brandSubtitle="ສັ່ງຊື້, ຕິດຕາມຄຳສັ່ງ ແລະ ສິດທິພິເສດ"
      redirectIfAuthed="/"
      redirectAfterAuth="/"
      alternateHint={{
        href: "/admin/login",
        label: "ໄປໜ້າເຂົ້າແອັດມິນ",
        description: "ທ່ານແມ່ນພະນັກງານຮ້ານ?",
      }}
    />
  );
}
