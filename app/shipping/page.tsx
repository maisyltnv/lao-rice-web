"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  Route,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BrandLogo } from "@/components/brand/brand-logo";
import { apiGetShippingConfig, isApiConfigured } from "@/lib/api";
import { formatLAK } from "@/lib/format";

const FAQ = [
  {
    q: "ຈັດສົ່ງໄປແຂວງອື່ນໄດ້ບໍ?",
    a: "ຕອນນີ້ຮັບພຽງໃນນະຄອນຫຼວງວຽງຈັນ. ຖ້າຈຸດ GPS ຢູ່ນອກເຂດ ລະບົບຈະບໍ່ໃຫ້ຢືນຢັນຄຳສັ່ງ.",
  },
  {
    q: "ປ່ຽນທີ່ຢູ່ຈັດສົ່ງໄດ້ບໍ?",
    a: "ປ້ອນໃໝ່ທຸກຄັ້ງຕອນສັ່ງຊື້. ຖ້າສັ່ງແລ້ວ ກະລຸນາຕິດຕໍ່ຮ້ານກ່ອນອອກຈາກຮ້ານ.",
  },
  {
    q: "ຄ່າສົ່ງຟຣີເມື່ອໃດ?",
    a: "ເມື່ອຍອດສິນຄ້າ (ບໍ່ລວມຄ່າສົ່ງ) ຮອດຕາມເງື່ອນໄຂທີ່ສະແດງໃນຂັ້ນຕອນຊຳລະ.",
  },
  {
    q: "ຊຳລະ COD ແລ້ວຍົກເລີກໄດ້ບໍ?",
    a: "ກະລຸນາຕິດຕໍ່ຮ້ານທັນທີ — ສະຖານະຄຳສັ່ງອັບເດດໃນໜ້າຄຳສັ່ງຊື້.",
  },
] as const;

export default function ShippingPage() {
  const [fee, setFee] = useState(30_000);
  const [freeMin, setFreeMin] = useState(500_000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const config = await apiGetShippingConfig();
        if (cancelled) return;
        setFee(config.shipping_fee_lak);
        setFreeMin(config.free_shipping_min_subtotal_lak);
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex flex-col items-center text-center mb-10">
        <BrandLogo size={56} />
        <h1 className="text-2xl font-bold mt-6">ການຈັດສົ່ງເຂົ້າຖຶງບ້ານ</h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-md">
          ພວກເຮົາຈັດສົ່ງພາຍໃນນະຄອນຫຼວງວຽງຈັນ — ເລືອກຈຸດສົ່ງດ້ວຍແຜນທີ່ GPS ຕອນຊຳລະເງິນ
        </p>
      </div>

      <div className="space-y-4">
        <Section icon={Truck} title="ຄ່າຈັດສົ່ງ">
          {loading ? (
            <p className="text-sm text-muted-foreground">ກຳລັງໂຫຼດ...</p>
          ) : (
            <>
              <FeeRow label="ຄ່າສົ່ງມາດຕະຖານ" value={formatLAK(fee)} />
              <FeeRow
                label="ສົ່ງຟຣີ"
                value={`ຍອດສິນຄ້າຕັ້ງແຕ່ ${formatLAK(freeMin)}`}
              />
              <p className="text-xs text-muted-foreground mt-2">
                ຄ່າສົ່ງຄິດໃນຂັ້ນຕອນຊຳລະ ຕາມຍອດກະຕ່າຂອງທ່ານ
              </p>
            </>
          )}
        </Section>

        <Section icon={Clock} title="ເວລາຈັດສົ່ງໂດຍປະມານ">
          <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
            <li>ຫຼັງຢືນຢັນຄຳສັ່ງ · ປົກກະຕິ 1–2 ວັນທຳການ</li>
            <li>ວັນພັກລັດຖະການ ຫຼື ສະພາບອາກາດອາດຊ້າກວ່າປົກກະຕິ</li>
            <li>ຕິດຕາມສະຖານະໃນໜ້າຄຳສັ່ງຊື້</li>
          </ul>
        </Section>

        <Section icon={Route} title="ຂັ້ນຕອນສັ່ງ ແລະ ຮັບເຄື່ອງ">
          <ol className="text-sm space-y-3">
            {[
              "ເລືອກສິນຄ້າ ແລະ ເພີ່ມໃສ່ກະຕ່າ",
              "ເຂົ້າລະບົບ OTP ແລະ ດຳເນີນຊຳລະ",
              "ປ້ອນທີ່ຢູ່ ແລະ ປັກຫມຸດ GPS ໃນນະຄອນຫຼວງວຽງຈັນ",
              "ຮ້ານຈັດສົ່ງເຂົ້າຈຸດທີ່ທ່ານເລືອກ",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section icon={MapPin} title="ເຂດບໍລິການ">
          <InfoLine title="ພື້ນທີ່" text="ນະຄອນຫຼວງວຽງຈັນ" />
          <InfoLine
            title="GPS ຕອນສັ່ງ"
            text="ໃຊ້ແຜນທີ່ໃນຂັ້ນຕອນທີ່ຢູ່ຈັດສົ່ງ — ລາກແຜນຫຼືໃຊ້ຕຳແໜ່ງປັດຈຸບັນ"
          />
          <InfoLine
            title="ນອກເຂດ"
            text="ບໍ່ຮັບສົ່ງແຂວງອື່ນ"
          />
        </Section>

        <Section icon={CreditCard} title="ການຊຳລະເງິນ">
          <InfoLine title="BCEL One QR" text="ອັບໂຫຼດສະລິບການໂອນ" />
          <InfoLine title="COD" text="ເກັບເງິນປາຍທາງເມື່ອຮັບເຄື່ອງ" />
        </Section>

        <Section icon={HelpCircle} title="ຄຳຖາມທີ່ພົບເລື້ອຍ">
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <Button className="flex-1" asChild>
          <Link href="/products">
            <Package className="h-4 w-4 mr-2" />
            ເລີ່ມເລືອກສິນຄ້າ
          </Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/orders">ຕິດຕາມຄຳສັ່ງຊື້</Link>
        </Button>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-semibold flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  );
}

function InfoLine({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{text}</p>
    </div>
  );
}
