import type { ApiUser } from "@/lib/api-types";

export type CustomerShippingProfile = {
  recipientName: string;
  shippingPhone: string;
  province: string;
  addressDetail: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
};

export type UpdateCustomerProfileBody = {
  recipient_name: string;
  shipping_phone?: string;
  province?: string;
  address_detail: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
};

function readString(u: ApiUser | null | undefined, key: string): string {
  if (!u) return "";
  const v = u[key];
  return typeof v === "string" ? v.trim() : "";
}

function readNumber(u: ApiUser | null | undefined, key: string): number {
  if (!u) return 0;
  const v = u[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function getCustomerProfileFromUser(
  user: ApiUser | null | undefined
): CustomerShippingProfile | null {
  if (!user) return null;
  const recipientName = readString(user, "recipient_name");
  const addressDetail = readString(user, "address_detail");
  if (!recipientName && !addressDetail) return null;

  const shippingPhone =
    readString(user, "shipping_phone") ||
    readString(user, "phone") ||
    readString(user, "username");

  return {
    recipientName,
    shippingPhone,
    province: readString(user, "province") || "ນະຄອນຫຼວງວຽງຈັນ",
    addressDetail,
    deliveryLatitude: readNumber(user, "delivery_latitude"),
    deliveryLongitude: readNumber(user, "delivery_longitude"),
  };
}

export function hasSavedCustomerProfile(
  profile: CustomerShippingProfile | null
): boolean {
  if (!profile) return false;
  return (
    profile.recipientName.length > 0 && profile.addressDetail.length > 0
  );
}

export function profileToUpdateBody(
  profile: CustomerShippingProfile
): UpdateCustomerProfileBody {
  return {
    recipient_name: profile.recipientName,
    shipping_phone: profile.shippingPhone || undefined,
    province: profile.province || "ນະຄອນຫຼວງວຽງຈັນ",
    address_detail: profile.addressDetail,
    delivery_latitude: profile.deliveryLatitude || undefined,
    delivery_longitude: profile.deliveryLongitude || undefined,
  };
}
