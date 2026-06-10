"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Truck, Shield, Headphones, CreditCard } from "lucide-react";
import { formatLAK } from "@/lib/format";
import { useShippingConfig } from "@/lib/use-shipping-config";

export function FeaturesSection() {
  const { freeShippingMinLak } = useShippingConfig();

  const features = useMemo(
    () => [
      {
        icon: Truck,
        titleLao: "ສົ່ງເຖິງບ້ານໃນວຽງຈັນ",
        descriptionLao: `ເລືອກຈຸດສົ່ງດ້ວຍແຜນທີ່ · ຟຣີເມື່ອຍອດເກີນ ${formatLAK(freeShippingMinLak)}`,
      },
      {
        icon: Shield,
        titleLao: "ເຂົ້າຄຸນນະພາບ",
        descriptionLao: "ເຂົ້ານາປີ · ນາແຊງ · ຈ້າວມະລິ ແລະ ອື່ນໆ",
      },
      {
        icon: Headphones,
        titleLao: "ບໍລິການລູກຄ້າ 24/7",
        descriptionLao: "ຕິດຕໍ່ພວກເຮົາໄດ້ຕະຫຼອດເວລາ",
      },
      {
        icon: CreditCard,
        titleLao: "ຊຳລະປອດໄພ",
        descriptionLao: "ຮອງຮັບ BCEL One ແລະ ເກັບເງິນປາຍທາງ",
      },
    ],
    [freeShippingMinLak]
  );

  return (
    <section className="py-12 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {feature.titleLao}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.descriptionLao}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
