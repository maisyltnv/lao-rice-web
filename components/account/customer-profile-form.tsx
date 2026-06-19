"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { getCustomerPhone } from "@/lib/customer-account";
import {
  getCustomerProfileFromUser,
  hasSavedCustomerProfile,
  profileToUpdateBody,
  type CustomerShippingProfile,
} from "@/lib/customer-profile";
import {
  DeliveryLocationPicker,
  isInsideVientiane,
} from "@/components/checkout/delivery-location-picker";

export function CustomerProfileForm() {
  const { user, updateCustomerProfile } = useAuth();
  const accountPhone = getCustomerPhone(user);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profile = getCustomerProfileFromUser(user);
    const p = profile?.shippingPhone || accountPhone;
    setPhone(p);
    if (profile) {
      setName(profile.recipientName);
      setAddress(profile.addressDetail);
      if (
        profile.deliveryLatitude !== 0 &&
        profile.deliveryLongitude !== 0
      ) {
        setLat(profile.deliveryLatitude);
        setLng(profile.deliveryLongitude);
      }
    } else if (accountPhone && !phone) {
      setPhone(accountPhone);
    }
  }, [user, accountPhone]);

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim() || accountPhone;
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      setError("ກະລຸນາໃສ່ຊື່ຜູ້ຮັບ");
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 8) {
      setError("ກະລຸນາໃສ່ເບີໂທທີ່ຖືກຕ້ອງ");
      return;
    }
    if (!trimmedAddress) {
      setError("ກະລຸນາໃສ່ທີ່ຢູ່ຈັດສົ່ງ");
      return;
    }
    if (lat == null || lng == null || !isInsideVientiane(lat, lng)) {
      setError("ກະລຸນາເລືອກຈຸດສົ່ງພາຍໃນນະຄອນຫຼວງວຽງຈັນ");
      return;
    }

    const body: CustomerShippingProfile = {
      recipientName: trimmedName,
      shippingPhone: trimmedPhone,
      province: "ນະຄອນຫຼວງວຽງຈັນ",
      addressDetail: trimmedAddress,
      deliveryLatitude: lat,
      deliveryLongitude: lng,
    };

    setSaving(true);
    try {
      await updateCustomerProfile(profileToUpdateBody(body));
      setMessage("ບັນທຶກຂໍ້ມູນຈັດສົ່ງແລ້ວ — ຈະໃຊ້ຕອນສັ່ງຊື້ອັດຕະໂນມັດ");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setSaving(false);
    }
  };

  const hasProfile = hasSavedCustomerProfile(getCustomerProfileFromUser(user));

  return (
    <div className="rounded-[20px] border border-border bg-card shadow-app-soft p-5 space-y-4">
      <div>
        <h2 className="font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          ທີ່ຢູ່ຈັດສົ່ງປະຈຳ
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {hasProfile
            ? "ຂໍ້ມູນນີ້ຈະຖືກເຕີມໃຫ້ອັດຕະໂນມັດຕອນສັ່ງຊື້ (ແກ້ໄຂໄດ້ທຸກເທື່ອ)"
            : "ບັນທຶກເພື່ອບໍ່ຕ້ອງພິມຊ້ຳທຸກຄັ້ງ — ຫຼື ຂໍ້ມູນຈາກການສັ່ງຊື້ຄັ້ງລ່າສຸດຈະຖືກບັນທຶກໃຫ້"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-name">ຊື່ຜູ້ຮັບ</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="profile-name"
            className="h-12 rounded-[14px] border border-border bg-card pl-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ຊື່ຜູ້ຮັບເຄື່ອງ"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-phone">ເບີໂທຈັດສົ່ງ</Label>
        <Input
          id="profile-phone"
          className="h-12 rounded-[14px] border border-border bg-card px-3"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="020 xxxx xxxx"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-address">ທີ່ຢູ່ / ບ້ານ / ຖະໜົນ</Label>
        <Input
          id="profile-address"
          className="h-12 rounded-[14px] border border-border bg-card px-3"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ລາຍລະອຽດທີ່ຢູ່"
        />
      </div>

      <DeliveryLocationPicker
        latitude={lat}
        longitude={lng}
        onChange={(newLat, newLng) => {
          setLat(newLat);
          setLng(newLng);
        }}
      />

      {error && (
        <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-primary rounded-lg bg-primary/10 px-3 py-2">
          {message}
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={saving}
        onClick={() => void handleSave()}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        ບັນທຶກທີ່ຢູ່ຈັດສົ່ງ
      </Button>

      {lat == null && lng == null && (
        <p className="text-xs text-muted-foreground text-center">
          ຍັງບໍ່ມີຈຸດໃນແຜນທີ່ — ກົດ «ໃຊ້ຕຳແໜ່ງຂອງຂ້ອຍ» ຫຼື ປັກຫມຸດໃນແຜນທີ່
        </p>
      )}
    </div>
  );
}
