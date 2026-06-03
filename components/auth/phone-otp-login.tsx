"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/lib/auth";
import { apiSendOtp } from "@/lib/api";
import { useStore } from "@/lib/store";

type Step = "phone" | "otp";

/** ຫຼັງ login: ມີສິນຄ້າໃນກະຕ່າ → checkout, ບໍ່ມີ → ໜ້າຫຼັກ (ຖ້າມີ ?redirect= ໃຊ້ຄ່ານັ້ນ) */
function resolvePostLoginRedirect(
  explicitRedirect: string | null,
  cartItemCount: number
): string {
  if (explicitRedirect) return explicitRedirect;
  return cartItemCount > 0 ? "/checkout" : "/";
}

export function PhoneOtpLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");
  const { cart } = useStore();
  const redirectTo = useMemo(
    () => resolvePostLoginRedirect(explicitRedirect, cart.length),
    [explicitRedirect, cart.length]
  );
  const { loginWithPhoneOtp, token, isReady } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && token) {
      router.replace(redirectTo);
    }
  }, [isReady, token, redirectTo, router]);

  const sendOtp = useCallback(async () => {
    setError(null);
    const trimmed = phone.trim();
    if (trimmed.length < 8) {
      setError("ກະລຸນາໃສ່ເບີໂທລະສັບຢ່າງໜ້ອຍ 8 ຕົວເລກ");
      return;
    }
    setLoading(true);
    try {
      await apiSendOtp(trimmed);
      setStep("otp");
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ສົ່ງ OTP ບໍ່ສຳເລັດ");
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const verifyOtp = useCallback(async () => {
    setError(null);
    if (code.length < 4) {
      setError("ກະລຸນາໃສ່ລະຫັດ OTP 4 ຕົວ");
      return;
    }
    setLoading(true);
    try {
      await loginWithPhoneOtp(phone.trim(), code);
      router.replace(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ລະຫັດ OTP ບໍ່ຖືກຕ້ອງ");
    } finally {
      setLoading(false);
    }
  }, [code, loginWithPhoneOtp, phone, redirectTo, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <BrandLogo size={44} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              ຮ້ານເຂົ້າສານ
            </p>
            <h1 className="text-xl font-bold">ເຂົ້າລະບົບດ້ວຍເບີໂທ</h1>
            <p className="text-sm text-muted-foreground">
              ຕ້ອງເຂົ້າລະບົບກ່ອນສັ່ງຊື້
            </p>
          </div>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ເບີໂທລະສັບ</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="020 1234 5678"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void sendOtp()}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => void sendOtp()}>
              {loading ? "ກຳລັງສົ່ງ..." : "ສົ່ງລະຫັດ OTP"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ທົດລອງ: ໃຊ້ລະຫັດ <strong>1234</strong> (ຈົນກວ່າ SMS API ພ້ອມ)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ສົ່ງລະຫັດໄປເບີ <strong>{phone.trim()}</strong>
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={4} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => void verifyOtp()}>
              {loading ? "ກຳລັງກວດ..." : "ຢືນຢັນ ແລະ ເຂົ້າລະບົບ"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              disabled={loading}
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
            >
              ປ່ຽນເບີໂທ
            </Button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          ທ່ານແມ່ນພະນັກງານ?{" "}
          <Link href="/admin/login" className="text-primary font-medium hover:underline">
            ເຂົ້າແອັດມິນ
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
