"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CreditCard,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  QrCode,
  ReceiptText,
  Save,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  apiGetShopSettings,
  apiUpdateShopSettings,
  getStoredAdminAccessToken,
  isApiConfigured,
} from "@/lib/api";
import type { ApiShopSettings } from "@/lib/api-types";

const notificationItems = [
  {
    key: "newOrders",
    title: "ແຈ້ງເຕືອນຄຳສັ່ງຊື້ໃໝ່",
    description: "ເມື່ອມີອໍເດີເຂົ້າ",
    icon: Bell,
  },
  {
    key: "lowStock",
    title: "ເຕືອນສິນຄ້າໃກ້ໝົດ",
    description: "ເຫຼືອນ້ອຍກວ່າ 10 ຖົງ",
    icon: PackageCheck,
  },
  {
    key: "dailySummary",
    title: "ສະຫຼຸບຍອດຂາຍປະຈຳວັນ",
    description: "ສົ່ງທຸກມື້ຕອນ 20:00",
    icon: ReceiptText,
  },
] as const;

type SettingsState = {
  shopName: string;
  phone: string;
  email: string;
  province: string;
  address: string;
  description: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  shippingFee: string;
  freeShipping: string;
  bcelQrEnabled: boolean;
  codEnabled: boolean;
  newOrders: boolean;
  lowStock: boolean;
  dailySummary: boolean;
  twoFactor: boolean;
  staffApproval: boolean;
};

const emptySettings = (): SettingsState => ({
  shopName: "",
  phone: "",
  email: "",
  province: "",
  address: "",
  description: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  shippingFee: "0",
  freeShipping: "0",
  bcelQrEnabled: true,
  codEnabled: true,
  newOrders: true,
  lowStock: true,
  dailySummary: false,
  twoFactor: false,
  staffApproval: true,
});

function settingsFromApi(data: ApiShopSettings): SettingsState {
  const prefs = data.admin_prefs;
  return {
    shopName: data.shop_name ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    province: data.province ?? "",
    address: data.address ?? "",
    description: data.description ?? "",
    bankName: data.bank_name ?? "",
    accountName: data.account_name ?? "",
    accountNumber: data.account_number ?? "",
    shippingFee: String(Math.round(data.shipping_fee_lak || 0)),
    freeShipping: String(Math.round(data.free_shipping_min_subtotal_lak || 0)),
    bcelQrEnabled: data.bcel_qr_enabled ?? true,
    codEnabled: data.cod_enabled ?? true,
    newOrders: prefs?.new_orders ?? true,
    lowStock: prefs?.low_stock ?? true,
    dailySummary: prefs?.daily_summary ?? false,
    twoFactor: prefs?.two_factor ?? false,
    staffApproval: prefs?.staff_approval ?? true,
  };
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(emptySettings);

  const completion = useMemo(() => {
    const required = [
      settings.shopName,
      settings.phone,
      settings.email,
      settings.address,
      settings.bankName,
      settings.accountNumber,
      settings.shippingFee,
      settings.freeShipping,
    ];
    return Math.round(
      (required.filter((value) => value.trim().length > 0).length /
        required.length) *
        100
    );
  }, [settings]);

  const paymentMethodsLabel = useMemo(() => {
    const methods: string[] = [];
    if (settings.bcelQrEnabled) methods.push("BCEL QR");
    if (settings.codEnabled) methods.push("COD");
    return methods.length > 0 ? methods.join(" + ") : "ປິດທັງໝົດ";
  }, [settings.bcelQrEnabled, settings.codEnabled]);

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      setLoadError("ບໍ່ພົບ NEXT_PUBLIC_API_URL — ກວດ .env.local");
      return;
    }
    void apiGetShopSettings()
      .then((data) => {
        setSettings(settingsFromApi(data));
        setLoadError(null);
      })
      .catch(() => {
        setLoadError("ໂຫຼດການຕັ້ງຄ່າຈາກ API ບໍ່ສຳເລັດ");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateSetting = (key: keyof SettingsState, value: string | boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaveError(null);
    const shippingFee = Number.parseFloat(settings.shippingFee);
    const freeShipping = Number.parseFloat(settings.freeShipping);
    if (!Number.isFinite(shippingFee) || shippingFee < 0) {
      setSaveError("ຄ່າສົ່ງບໍ່ຖືກຕ້ອງ");
      return;
    }
    if (!Number.isFinite(freeShipping) || freeShipping < 0) {
      setSaveError("ຍອດສົ່ງຟຣີບໍ່ຖືກຕ້ອງ");
      return;
    }
    if (!settings.bcelQrEnabled && !settings.codEnabled) {
      setSaveError("ຕ້ອງເປີດຢ່າງໜ້ອຍ 1 ວິທີຊຳລະ");
      return;
    }

    if (!isApiConfigured()) {
      setSaveError("ບໍ່ພົບ NEXT_PUBLIC_API_URL — ກວດ .env.local");
      return;
    }
    if (!getStoredAdminAccessToken()) {
      setSaveError("ກະລຸນາເຂົ້າສູ່ລະບົບ admin ກ່ອນບັນທຶກ");
      return;
    }

    setSaving(true);
    try {
      const updated = await apiUpdateShopSettings({
        shipping_fee_lak: shippingFee,
        free_shipping_min_subtotal_lak: freeShipping,
        bcel_qr_enabled: settings.bcelQrEnabled,
        cod_enabled: settings.codEnabled,
        shop_name: settings.shopName.trim(),
        phone: settings.phone.trim(),
        email: settings.email.trim(),
        province: settings.province.trim(),
        address: settings.address.trim(),
        description: settings.description.trim(),
        bank_name: settings.bankName.trim(),
        account_name: settings.accountName.trim(),
        account_number: settings.accountNumber.trim(),
        admin_prefs: {
          new_orders: settings.newOrders,
          low_stock: settings.lowStock,
          daily_summary: settings.dailySummary,
          two_factor: settings.twoFactor,
          staff_approval: settings.staffApproval,
        },
      });
      setSettings(settingsFromApi(updated));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "ບັນທຶກການຕັ້ງຄ່າຜ່ານ API ບໍ່ສຳເລັດ";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ຕັ້ງຄ່າຮ້ານຄ້າ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ຂໍ້ມູນຮ້ານ · ການຈັດສົ່ງ · ການຊຳລະເງິນ
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {(loadError || saveError) && (
            <p className="text-sm text-destructive">{saveError ?? loadError}</p>
          )}
          <Button
            onClick={() => void handleSave()}
            disabled={saving || loading}
            className="gap-2"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved
              ? "ບັນທຶກແລ້ວ"
              : saving
                ? "ກຳລັງບັນທຶກ..."
                : loading
                  ? "ກຳລັງໂຫຼດ..."
                  : "ບັນທຶກການຕັ້ງຄ່າ"}
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-muted/30 p-3 text-center text-sm">
        <div>
          <p className="text-muted-foreground">ຂໍ້ມູນຮ້ານ</p>
          <p className="mt-0.5 font-semibold">{completion}%</p>
        </div>
        <div className="border-x border-border">
          <p className="text-muted-foreground">ການຊຳລະ</p>
          <p className="mt-0.5 font-semibold">{paymentMethodsLabel}</p>
        </div>
        <div>
          <p className="text-muted-foreground">ຄ່າສົ່ງ</p>
          <p className="mt-0.5 font-semibold">
            {Number(settings.shippingFee).toLocaleString()} ₭
          </p>
        </div>
      </div>

      {/* 1. Shop info */}
      <SettingsSection
        icon={Store}
        title="ຂໍ້ມູນຮ້ານ"
        description="ຊື່, ທີ່ຢູ່ ແລະຂໍ້ມູນຕິດຕໍ່"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ຊື່ຮ້ານ" icon={Store}>
            <Input
              value={settings.shopName}
              onChange={(e) => updateSetting("shopName", e.target.value)}
            />
          </Field>
          <Field label="ແຂວງ" icon={MapPin}>
            <Input
              value={settings.province}
              onChange={(e) => updateSetting("province", e.target.value)}
            />
          </Field>
          <Field label="ເບີໂທ" icon={Phone}>
            <Input
              value={settings.phone}
              onChange={(e) => updateSetting("phone", e.target.value)}
            />
          </Field>
          <Field label="ອີເມວ" icon={Mail}>
            <Input
              value={settings.email}
              onChange={(e) => updateSetting("email", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="ທີ່ຢູ່ຮ້ານ" icon={MapPin}>
              <Input
                value={settings.address}
                onChange={(e) => updateSetting("address", e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="ຄຳອະທິບາຍຮ້ານ" icon={MessageCircle}>
              <Textarea
                value={settings.description}
                onChange={(e) => updateSetting("description", e.target.value)}
                className="min-h-20 resize-none"
              />
            </Field>
          </div>
        </div>
      </SettingsSection>

      {/* 2. Shipping */}
      <SettingsSection
        icon={Truck}
        title="ການຈັດສົ່ງ"
        description="ຄ່າສົ່ງ ແລະຍອດສົ່ງຟຣີ"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ຄ່າສົ່ງມາດຕະຖານ (LAK)" icon={Truck}>
            <Input
              type="number"
              value={settings.shippingFee}
              onChange={(e) => updateSetting("shippingFee", e.target.value)}
            />
          </Field>
          <Field label="ສົ່ງຟຣີເມື່ອຊື້ຄົບ (LAK)" icon={PackageCheck}>
            <Input
              type="number"
              value={settings.freeShipping}
              onChange={(e) => updateSetting("freeShipping", e.target.value)}
            />
          </Field>
        </div>
      </SettingsSection>

      {/* 3. Payment */}
      <SettingsSection
        icon={CreditCard}
        title="ການຊຳລະເງິນ"
        description="ເປີດ/ປິດວິທີຊຳລະ ແລະຂໍ້ມູນບັນຊີ"
      >
        <p className="text-sm font-medium text-foreground">ວິທີຊຳລະ</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CompactToggle
            icon={QrCode}
            title="BCEL One QR"
            description="ລູກຄ້າອັບໂຫຼດສລິບ"
            checked={settings.bcelQrEnabled}
            onCheckedChange={(value) => updateSetting("bcelQrEnabled", value)}
          />
          <CompactToggle
            icon={Wallet}
            title="ເກັບເງິນປາຍທາງ (COD)"
            description="ຈ່າຍເມື່ອຮັບສິນຄ້າ"
            checked={settings.codEnabled}
            onCheckedChange={(value) => updateSetting("codEnabled", value)}
          />
        </div>

        <Separator className="my-6" />

        <p className="text-sm font-medium text-foreground">ບັນຊີຮັບເງິນ</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="ທະນາຄານ / Wallet" icon={CreditCard}>
            <Input
              value={settings.bankName}
              onChange={(e) => updateSetting("bankName", e.target.value)}
            />
          </Field>
          <Field label="ຊື່ບັນຊີ" icon={UserRound}>
            <Input
              value={settings.accountName}
              onChange={(e) => updateSetting("accountName", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="ເລກບັນຊີ" icon={ReceiptText}>
              <Input
                value={settings.accountNumber}
                onChange={(e) => updateSetting("accountNumber", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </SettingsSection>

      {/* 4. Notifications & security */}
      <SettingsSection
        icon={ShieldCheck}
        title="ແຈ້ງເຕືອນ ແລະ ຄວາມປອດໄພ"
        description="ການແຈ້ງເຕືອນ admin ແລະການເຂົ້າໃຊ້"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {notificationItems.map((item) => (
            <CompactToggle
              key={item.key}
              icon={item.icon}
              title={item.title}
              description={item.description}
              checked={Boolean(settings[item.key])}
              onCheckedChange={(value) => updateSetting(item.key, value)}
            />
          ))}
          <CompactToggle
            icon={KeyRound}
            title="Two-factor login"
            description="OTP ຕອນ login"
            checked={settings.twoFactor}
            onCheckedChange={(value) => updateSetting("twoFactor", value)}
          />
          <CompactToggle
            icon={Lock}
            title="Staff approval"
            description="ອະນຸມັດ staff ໃໝ່"
            checked={settings.staffApproval}
            onCheckedChange={(value) => updateSetting("staffApproval", value)}
          />
        </div>
      </SettingsSection>

      {/* Footer links */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Link href="/admin/products" className="hover:text-foreground">
          → ຈັດການສິນຄ້າ
        </Link>
        <Link href="/admin/orders" className="hover:text-foreground">
          → ຄຳສັ່ງຊື້
        </Link>
      </div>
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Store;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-semibold leading-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Store;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function CompactToggle({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: typeof Store;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
