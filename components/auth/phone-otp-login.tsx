"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone } from "lucide-react";
import { AppTopBar } from "@/components/layout/app-top-bar";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { onlyDigits } from "@/lib/input-utils";
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
    <div className="min-h-screen bg-background">
      <AppTopBar back title="ເຂົ້າສູ່ລະບົບ" />

      <div className="px-4 pt-8 pb-12">
        <Image
          src="/icon-192.png"
          alt="Lao Rice"
          width={64}
          height={64}
          className="mx-auto h-16 w-16 rounded-[16px] shadow-app-soft"
          priority
        />
        <h1 className="mt-5 text-center text-[20px] font-extrabold">
          ຍິນດີຕ້ອນຮັບ
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          ເຂົ້າສູ່ລະບົບດ້ວຍເບີໂທລະສັບ
        </p>

        <div className="mx-auto mt-8 w-full max-w-sm">
          {step === "phone" ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  ເບີໂທລະສັບ
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="020 1234 5678"
                    className="h-12 w-full rounded-[14px] border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary"
                    value={phone}
                    onChange={(e) => setPhone(onlyDigits(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && void sendOtp()}
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="button"
                className="w-full rounded-[14px] bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
                disabled={loading}
                onClick={() => void sendOtp()}
              >
                {loading ? "ກຳລັງສົ່ງ..." : "ສົ່ງລະຫັດ OTP"}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                ທົດລອງ: ໃຊ້ລະຫັດ <strong>1234</strong> (ຈົນກວ່າ SMS API ພ້ອມ)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                ສົ່ງລະຫັດໄປເບີ <strong>{phone.trim()}</strong>
              </p>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={code}
                  onChange={(v) => setCode(onlyDigits(v))}
                  inputMode="numeric"
                  pattern={REGEXP_ONLY_DIGITS}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}
              <button
                type="button"
                className="w-full rounded-[14px] bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
                disabled={loading}
                onClick={() => void verifyOtp()}
              >
                {loading ? "ກຳລັງກວດ..." : "ຢືນຢັນ ແລະ ເຂົ້າລະບົບ"}
              </button>
              <button
                type="button"
                className="w-full rounded-[14px] py-3 text-[15px] font-medium text-muted-foreground hover:bg-accent disabled:opacity-60"
                disabled={loading}
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setError(null);
                }}
              >
                ປ່ຽນເບີໂທ
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ທ່ານແມ່ນພະນັກງານ?{" "}
            <Link href="/admin/login" className="font-medium text-primary hover:underline">
              ເຂົ້າແອັດມິນ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
