"use client";

import { LoginScreen } from "@/components/auth/login-screen";

export default function CustomerLoginPage() {
  return (
    <LoginScreen
      portal="customer"
      brandTitle="ເຂົ້າລະບົບລູກຄ້າ"
      brandSubtitle="ສັ່ງເຂົ້າອອນລາຍ ແລະ ຕິດຕາມຄຳສັ່ງຊື້"
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
