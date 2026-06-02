"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  Check,
  CreditCard,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ReceiptText,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const notificationItems = [
  {
    key: "newOrders",
    title: "ແຈ້ງເຕືອນຄຳສັ່ງຊື້ໃໝ່",
    description: "ສົ່ງສຽງ ແລະ notification ເມື່ອມີອໍເດີເຂົ້າ",
    icon: Bell,
  },
  {
    key: "lowStock",
    title: "ເຕືອນສິນຄ້າໃກ້ໝົດ",
    description: "ເມື່ອສິນຄ້າເຫຼືອນ້ອຍກວ່າ 10 ຖົງ",
    icon: PackageCheck,
  },
  {
    key: "dailySummary",
    title: "ສະຫຼຸບຍອດຂາຍປະຈຳວັນ",
    description: "ສົ່ງ summary ໃຫ້ທຸກມື້ຕອນ 20:00",
    icon: ReceiptText,
  },
];

const quickLinks = [
  {
    title: "ຈັດການສິນຄ້າ",
    description: "ເພີ່ມ, ແກ້ໄຂ ແລະກວດ stock",
    href: "/admin/products",
    icon: Store,
  },
  {
    title: "ອັດຕາແລກປ່ຽນ",
    description: "ປັບອັດຕາແລກປ່ຽນ ແລະຄິດລາຄາຂາຍໃໝ່",
    href: "/admin/currency",
    icon: Globe2,
  },
  {
    title: "ຄຳສັ່ງຊື້",
    description: "ກວດ payment, ສົ່ງຂອງ, ອັບເດດ status",
    href: "/admin/orders",
    icon: Truck,
  },
];

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    shopName: "ຮ້ານເຂົ້າສານ",
    phone: "020 5555 8888",
    email: "info@laorice.la",
    province: "ນະຄອນຫຼວງວຽງຈັນ",
    address: "ຖະໜົນສາມແສນໄທ, ນະຄອນຫຼວງວຽງຈັນ",
    description:
      "ຂາຍເຂົ້າຈ້າວ ເຂົ້າໜຽວ ຄຸນນະພາບດີ — ສັ່ງອອນລາຍ ແລະ ຈັດສົ່ງພາຍໃນນະຄອນຫຼວງວຽງຈັນ.",
    bankName: "BCEL OnePay",
    accountName: "ຮ້ານເຂົ້າສານ",
    accountNumber: "010-12-00-99999999",
    shippingFee: "30000",
    freeShipping: "500000",
    newOrders: true,
    lowStock: true,
    dailySummary: false,
    twoFactor: false,
    staffApproval: true,
  });

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

  const updateSetting = (key: keyof typeof settings, value: string | boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            ຕັ້ງຄ່າຮ້ານເຂົ້າສານ
          </div>
          <h1 className="text-2xl font-bold text-foreground">ຕັ້ງຄ່າຮ້ານຄ້າ</h1>
          <p className="text-muted-foreground">
            ຈັດການຂໍ້ມູນຮ້ານ, ການຊຳລະເງິນ, ການຈັດສົ່ງ ແລະຄວາມປອດໄພ
          </p>
        </div>
        <Button onClick={handleSave} className="w-full gap-2 sm:w-auto">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "ບັນທຶກແລ້ວ" : "ບັນທຶກການຕັ້ງຄ່າ"}
        </Button>
      </div>

      <motion.section
        {...cardMotion}
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold">ຮ້ານເຂົ້າສານ</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  ຕັ້ງຄ່າຂໍ້ມູນຮ້ານ, ການຊຳລະ ແລະການຈັດສົ່ງສຳລັບລູກຄ້າ.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard label="Profile" value={`${completion}%`} />
              <MetricCard label="Payment" value="BCEL" />
              <MetricCard label="Shipping" value="Active" />
            </div>
          </div>

          <div className="border-t border-border bg-muted/40 p-6 lg:border-l lg:border-t-0">
            <p className="mb-4 text-sm font-medium">ສະຖານະລະບົບ</p>
            <div className="space-y-3">
              <StatusLine label="API Backend" value="Online" />
              <StatusLine label="Admin JWT" value="Protected" />
              <StatusLine label="Database" value="Connected" />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.section
          {...cardMotion}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <SectionHeader
            icon={Store}
            title="ຂໍ້ມູນຮ້ານ"
            description="ຂໍ້ມູນຫຼັກສຳລັບໃຫ້ລູກຄ້າຕິດຕໍ່ ແລະຈື່ຈຳ brand"
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                  className="min-h-24 resize-none"
                />
              </Field>
            </div>
          </div>
        </motion.section>

        <motion.section
          {...cardMotion}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <SectionHeader
            icon={CreditCard}
            title="ການຊຳລະເງິນ"
            description="ຂໍ້ມູນບັນຊີທີ່ຈະໃຊ້ໃນ checkout ແລະ order confirmation"
          />

          <div className="mt-6 space-y-4">
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
            <Field label="ເລກບັນຊີ" icon={ReceiptText}>
              <Input
                value={settings.accountNumber}
                onChange={(e) => updateSetting("accountNumber", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">Preview ໃບບິນ</p>
            <div className="mt-3 space-y-2 text-sm">
              <PreviewLine label="ຮ້ານ" value={settings.shopName} />
              <PreviewLine label="ຊຳລະຜ່ານ" value={settings.bankName} />
              <PreviewLine label="ບັນຊີ" value={settings.accountName} />
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.section
          {...cardMotion}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 xl:col-span-2"
        >
          <SectionHeader
            icon={Truck}
            title="ການຈັດສົ່ງ"
            description="ກຳນົດຄ່າສົ່ງ ແລະຍອດຂັ້ນຕ່ຳສຳລັບສົ່ງຟຣີ"
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoPill title="ວິທີຈັດສົ່ງ" value="Delivery / Pickup" />
            <InfoPill title="ເວລາຈັດສົ່ງ" value="1-3 ມື້" />
            <InfoPill title="ພື້ນທີ່" value="ທົ່ວປະເທດ" />
          </div>
        </motion.section>

        <motion.section
          {...cardMotion}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <SectionHeader
            icon={ShieldCheck}
            title="ຄວາມປອດໄພ"
            description="ຄວບຄຸມການເຂົ້າໃຊ້ແອັດມິນ"
          />

          <div className="mt-6 space-y-4">
            <ToggleLine
              icon={KeyRound}
              title="Two-factor login"
              description="ເພີ່ມລະຫັດ OTP ຕອນ login"
              checked={settings.twoFactor}
              onCheckedChange={(value) => updateSetting("twoFactor", value)}
            />
            <ToggleLine
              icon={Lock}
              title="Staff approval"
              description="ຕ້ອງໃຫ້ owner ອະນຸມັດ staff ໃໝ່"
              checked={settings.staffApproval}
              onCheckedChange={(value) => updateSetting("staffApproval", value)}
            />
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          {...cardMotion}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <SectionHeader
            icon={Bell}
            title="ການແຈ້ງເຕືອນ"
            description="ເລືອກສິ່ງທີ່ admin ຄວນຮູ້ທັນທີ"
          />

          <div className="mt-6 space-y-4">
            {notificationItems.map((item) => (
              <ToggleLine
                key={item.key}
                icon={item.icon}
                title={item.title}
                description={item.description}
                checked={Boolean(settings[item.key as keyof typeof settings])}
                onCheckedChange={(value) =>
                  updateSetting(item.key as keyof typeof settings, value)
                }
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          {...cardMotion}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <SectionHeader
            icon={Sparkles}
            title="ທາງລັດຈັດການ"
            description="ໄປຫາໜ້າສຳຄັນໃນ admin ໄດ້ໄວ"
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <link.icon className="h-5 w-5" />
                </div>
                <p className="font-medium">{link.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Store;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-secondary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
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
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        {value}
      </span>
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value || "—"}</span>
    </div>
  );
}

function InfoPill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function ToggleLine({
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
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      <Separator className="my-3" />
      <p className="text-xs text-muted-foreground">
        {checked ? "ເປີດໃຊ້ງານຢູ່" : "ປິດໃຊ້ງານຢູ່"}
      </p>
    </div>
  );
}
