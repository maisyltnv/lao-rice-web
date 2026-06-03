"use client";

import { Suspense } from "react";
import { PhoneOtpLogin } from "@/components/auth/phone-otp-login";

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/40" />}>
      <PhoneOtpLogin />
    </Suspense>
  );
}
