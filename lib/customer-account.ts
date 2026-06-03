import type { ApiUser } from "@/lib/api-types";

export const CUSTOMER_PHONE_STORAGE_KEY = "hb_customer_phone";

/** Phone from OTP account (username holds normalized phone on API). */
export function getCustomerPhone(user: ApiUser | null | undefined): string {
  if (!user) return "";
  return (user.phone ?? user.username ?? "").trim();
}

export function getStoredCustomerPhone(): string | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CUSTOMER_PHONE_STORAGE_KEY);
  return v && v.length > 0 ? v : null;
}

export function setStoredCustomerPhone(phone: string): void {
  if (typeof window === "undefined") return;
  const trimmed = phone.trim();
  if (trimmed) localStorage.setItem(CUSTOMER_PHONE_STORAGE_KEY, trimmed);
  else localStorage.removeItem(CUSTOMER_PHONE_STORAGE_KEY);
}

export function clearStoredCustomerPhone(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CUSTOMER_PHONE_STORAGE_KEY);
}
