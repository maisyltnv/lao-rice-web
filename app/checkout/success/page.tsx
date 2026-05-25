"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber =
    searchParams.get("order")?.trim() ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("checkoutOrderNumber")
      : null) ||
    "—";

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#064E3B", "#F59E0B", "#10B981"],
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-12 w-12 text-primary" />
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          ສັ່ງຊື້ສຳເລັດ!
        </h1>
        <p className="text-muted-foreground mb-6">
          ຂອບໃຈທີ່ຊື້ສິນຄ້າກັບພວກເຮົາ
        </p>

        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">ເລກທີ່ຄຳສັ່ງຊື້</p>
          <p className="text-xl font-bold text-primary">{orderNumber}</p>
        </div>

        <motion.div className="bg-card border border-border rounded-xl p-6 mb-6 text-left">
          <h3 className="font-semibold mb-4">ຂັ້ນຕອນຕໍ່ໄປ</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>1. ພວກເຮົາຈະຕິດຕໍ່ຫາທ່ານພາຍໃນ 24 ຊົ່ວໂມງ</p>
            <p>2. ກະກຽມ ແລະ ຈັດສົ່ງສິນຄ້າພາຍໃນ 3–5 ວັນ</p>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
          <Phone className="h-4 w-4" />
          <span className="text-sm">ມີຄຳຖາມ? ໂທຫາ 020 5555 1234</span>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push("/products")} className="w-full">
            ສືບຕໍ່ຊື້ເຄື່ອງ
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
          >
            ກັບຄືນໜ້າຫຼັກ
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <motion.div className="min-h-screen flex items-center justify-center">
          ກຳລັງໂຫຼດ...
        </motion.div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
