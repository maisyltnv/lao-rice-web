"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Truck,
  CreditCard,
  CheckCircle,
  MapPin,
  User,
  Phone,
  QrCode,
  Banknote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { formatLAK } from "@/lib/format";
import {
  apiCreateOrder,
  apiCreateOrderMultipart,
  apiGetShippingConfig,
  apiGetShippingQuote,
  isApiConfigured,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getCustomerPhone } from "@/lib/customer-account";
import {
  getCustomerProfileFromUser,
  profileToUpdateBody,
} from "@/lib/customer-profile";
import {
  PaymentReceiptUpload,
  type PaymentReceiptFile,
} from "@/components/checkout/payment-receipt-upload";
import type { ApiShippingQuote } from "@/lib/api-types";
import { ProductImage } from "@/components/products/product-image";
import {
  DeliveryLocationPicker,
  isInsideVientiane,
} from "@/components/checkout/delivery-location-picker";

const steps = [
  { id: 1, nameLao: "ທີ່ຢູ່ຈັດສົ່ງ", icon: Truck },
  { id: 2, nameLao: "ການຊຳລະເງິນ", icon: CreditCard },
  { id: 3, nameLao: "ຢືນຢັນຄຳສັ່ງ", icon: CheckCircle },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, addOrder } = useStore();
  const { token, isReady, user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"bcel" | "cod">("bcel");
  const [bcelQrEnabled, setBcelQrEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceiptFile | null>(
    null
  );

  const clearPaymentReceipt = useCallback(() => {
    setPaymentReceipt((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (paymentReceipt?.previewUrl) URL.revokeObjectURL(paymentReceipt.previewUrl);
    };
  }, [paymentReceipt?.previewUrl]);
  const [freeShippingMin, setFreeShippingMin] = useState(500_000);
  const [defaultShippingFee, setDefaultShippingFee] = useState(30_000);
  const [shippingQuote, setShippingQuote] = useState<ApiShippingQuote | null>(
    null
  );
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent("/checkout")}`);
    }
  }, [isReady, token, router]);

  useEffect(() => {
    if (!user) return;
    const profile = getCustomerProfileFromUser(user);
    const phone =
      profile?.shippingPhone || getCustomerPhone(user) || "";
    setShippingInfo((s) => ({
      name: s.name || profile?.recipientName || "",
      phone: s.phone || phone,
      address: s.address || profile?.addressDetail || "",
    }));
    if (
      deliveryLat == null &&
      profile &&
      profile.deliveryLatitude !== 0 &&
      profile.deliveryLongitude !== 0
    ) {
      setDeliveryLat(profile.deliveryLatitude);
      setDeliveryLng(profile.deliveryLongitude);
    }
  }, [user, deliveryLat]);

  useEffect(() => {
    if (!isApiConfigured() || cart.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const config = await apiGetShippingConfig();
        if (cancelled) return;
        setFreeShippingMin(config.free_shipping_min_subtotal_lak);
        setDefaultShippingFee(config.shipping_fee_lak);
        const bcel = config.bcel_qr_enabled ?? true;
        const cod = config.cod_enabled ?? true;
        setBcelQrEnabled(bcel);
        setCodEnabled(cod);
        setPaymentMethod((current) => {
          if (current === "bcel" && bcel) return "bcel";
          if (current === "cod" && cod) return "cod";
          if (bcel) return "bcel";
          if (cod) return "cod";
          return current;
        });
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cart.length]);

  useEffect(() => {
    if (!isApiConfigured() || cartTotal <= 0) {
      setShippingQuote(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    (async () => {
      try {
        const quote = await apiGetShippingQuote(
          Math.round(cartTotal),
          deliveryLat != null && deliveryLng != null
            ? { latitude: deliveryLat, longitude: deliveryLng }
            : undefined
        );
        if (!cancelled) setShippingQuote(quote);
      } catch {
        if (!cancelled) setShippingQuote(null);
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartTotal, deliveryLat, deliveryLng]);

  const shippingFee = useMemo(() => {
    if (shippingQuote) return shippingQuote.shipping_fee_lak;
    return cartTotal >= freeShippingMin ? 0 : defaultShippingFee;
  }, [shippingQuote, cartTotal, freeShippingMin, defaultShippingFee]);

  const totalAmount = useMemo(() => {
    if (shippingQuote) return shippingQuote.total_amount_lak;
    return cartTotal + shippingFee;
  }, [shippingQuote, cartTotal, shippingFee]);

  const amountUntilFree = useMemo(() => {
    if (shippingQuote?.amount_until_free_shipping_lak != null) {
      return shippingQuote.amount_until_free_shipping_lak;
    }
    return Math.max(0, freeShippingMin - cartTotal);
  }, [shippingQuote, freeShippingMin, cartTotal]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryLat == null || deliveryLng == null || !isInsideVientiane(deliveryLat, deliveryLng)) {
      setOrderError("ກະລຸນາເລືອກຈຸດສົ່ງພາຍໃນນະຄອນຫຼວງວຽງຈັນ");
      return;
    }
    setOrderError(null);
    setCurrentStep(2);
  };

  const handlePaymentSubmit = () => {
    if (paymentMethod === "bcel" && !paymentReceipt) {
      setOrderError(
        "ກະລຸນາອັບໂຫຼດຫຼັກຖານການຊຳລະເງິນ (screenshot BCEL) ກ່ອນດຳເນີນການຕໍ່"
      );
      return;
    }
    setOrderError(null);
    setCurrentStep(3);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setOrderError(null);

    const orderItems = cart
      .map((item) => ({
        product_id: parseInt(item.product.id, 10),
        quantity: item.quantity,
      }))
      .filter((i) => !Number.isNaN(i.product_id) && i.quantity > 0);

    if (isApiConfigured() && orderItems.length === 0) {
      setOrderError(
        "ສິນຄ້າໃນກະຕ່າບໍ່ຖືກຕ້ອງ — ກະລຸນາເລືອກສິນຄ້າຈາກໜ້າຮ້ານ (ຕ້ອງມີ product_id ຈາກ API)"
      );
      setIsSubmitting(false);
      return;
    }

    if (paymentMethod === "bcel" && !paymentReceipt) {
      setOrderError(
        "ກະລຸນາອັບໂຫຼດຫຼັກຖານການຊຳລະເງິນ (screenshot BCEL)"
      );
      setIsSubmitting(false);
      return;
    }

    let orderNumber: string | undefined;
    let paymentReceiptUrl: string | null = null;

    if (isApiConfigured()) {
      try {
        const shipping = {
          recipient_name: shippingInfo.name.trim(),
          phone: shippingInfo.phone.trim(),
          province: "ນະຄອນຫຼວງວຽງຈັນ",
          address_detail: shippingInfo.address.trim(),
          latitude: deliveryLat!,
          longitude: deliveryLng!,
        };
        const payment_method = paymentMethod === "bcel" ? "bcel_qr" : "cod";

        const created =
          paymentMethod === "bcel" && paymentReceipt
            ? await apiCreateOrderMultipart({
                items: orderItems,
                shipping,
                payment_method,
                payment_receipt: paymentReceipt.file,
              })
            : await apiCreateOrder({
                items: orderItems,
                shipping,
                payment_method,
              });

        paymentReceiptUrl =
          typeof created.payment_receipt_url === "string" &&
          created.payment_receipt_url.trim()
            ? created.payment_receipt_url.trim()
            : null;

        orderNumber =
          created.order_number?.trim() ||
          (created.id != null ? `ORD-${String(created.id).padStart(8, "0")}` : undefined);

        try {
          await refreshUser();
        } catch {
          /* API also saves profile on place order */
        }
      } catch (err) {
        let detail = "ກວດວ່າ API ຮັນຢູ່ ແລະ restart ດ້ວຍ code ລ່າສຸດ (docker compose up -d --build)";
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const apiErr =
            typeof err.response?.data === "object" &&
            err.response?.data !== null &&
            "error" in err.response.data
              ? String((err.response.data as { error: string }).error)
              : err.message;
          if (status === 401) {
            detail =
              "API ເກົ່າຍັງຕ້ອງ login — restart backend: docker compose up -d --build";
          } else if (apiErr) {
            detail = apiErr;
          }
        }
        setOrderError(`ບັນທຶກຄຳສັ່ງຜ່ານ API ບໍ່ສຳເລັດ — ${detail}`);
        setIsSubmitting(false);
        return;
      }
    }

    addOrder({
      items: cart,
      customerInfo: shippingInfo,
      paymentMethod: paymentMethod === "bcel" ? "bcel_qr" : "cod",
      status: "pending",
      totalLAK: totalAmount,
      ...(paymentReceiptUrl ? { paymentReceiptUrl } : {}),
      ...(orderNumber ? { id: orderNumber } : {}),
    });

    clearCart();
    router.push("/orders");
    setIsSubmitting(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">ກະຕ່າຂອງທ່ານຫວ່າງເປົ່າ</p>
          <Button onClick={() => router.push("/products")}>
            ເລີ່ມຊື້ເຄື່ອງ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Steps */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= step.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">
                    {step.nameLao}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-5 w-5 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">ທີ່ຢູ່ຈັດສົ່ງ</h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <User className="h-4 w-4" />
                        ຊື່ຜູ້ຮັບ
                      </label>
                      <Input
                        required
                        value={shippingInfo.name}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, name: e.target.value })
                        }
                        placeholder="ປ້ອນຊື່ຂອງທ່ານ"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Phone className="h-4 w-4" />
                        ເບີໂທລະສັບ
                      </label>
                      <Input
                        required
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, phone: e.target.value })
                        }
                        placeholder="020 XXXX XXXX"
                      />
                    </div>

                    <DeliveryLocationPicker
                      latitude={deliveryLat}
                      longitude={deliveryLng}
                      onChange={(lat, lng) => {
                        setDeliveryLat(lat);
                        setDeliveryLng(lng);
                      }}
                    />

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <MapPin className="h-4 w-4" />
                        ຈຸດສັງເກດ / ທີ່ຢູ່ລະອຽດ
                      </label>
                      <textarea
                        required
                        value={shippingInfo.address}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, address: e.target.value })
                        }
                        placeholder="ບ້ານ, ຮ່ອມ, ຊັ້ນ, ສີສັງເກດໃກ້ໆ"
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background min-h-[100px]"
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      ດຳເນີນການຕໍ່
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">ເລືອກວິທີຊຳລະເງິນ</h2>
                  <div className="space-y-3">
                    {!bcelQrEnabled && !codEnabled && (
                      <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        ຮ້ານປິດການຊຳລະຊົ່ວຄາວ — ກະລຸນາຕິດຕໍ່ຮ້ານ
                      </p>
                    )}

                    <div className="space-y-3">
                      {bcelQrEnabled && (
                        <div
                          className={`rounded-xl border-2 transition-colors overflow-hidden ${
                            paymentMethod === "bcel"
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("bcel")}
                            className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
                          >
                            <div className="w-11 h-11 shrink-0 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                              <QrCode className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">BCEL One QR</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                ສະແກນ QR Code ຈ່າຍຜ່ານ BCEL One
                              </p>
                            </div>
                            {paymentMethod === "bcel" && (
                              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                            )}
                          </button>

                          {paymentMethod === "bcel" && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-t border-primary/15 bg-background/60 px-4 pb-4 pt-3"
                            >
                              <div className="rounded-xl bg-muted/50 p-4 text-center space-y-3">
                                <p className="text-sm text-muted-foreground">
                                  ສະແກນ QR Code ເພື່ອຊຳລະເງິນ
                                </p>
                                <div className="mx-auto max-w-48 overflow-hidden rounded-lg border border-border bg-background p-2 shadow-sm">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src="/images/payment/bcel_lapnet_qr.png"
                                    alt="BCEL One LAPNet QR"
                                    className="w-full object-contain"
                                  />
                                </div>
                                <p className="text-xl font-bold text-primary">
                                  {formatLAK(totalAmount)}
                                </p>
                              </div>

                              <Separator className="my-4" />

                              <PaymentReceiptUpload
                                value={paymentReceipt}
                                onChange={setPaymentReceipt}
                                disabled={isSubmitting}
                                compact
                              />
                            </motion.div>
                          )}
                        </div>
                      )}

                      {codEnabled && (
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentMethod("cod");
                            clearPaymentReceipt();
                            setOrderError(null);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center gap-3 text-left ${
                            paymentMethod === "cod"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30 hover:bg-muted/20"
                          }`}
                        >
                          <div className="w-11 h-11 shrink-0 bg-secondary rounded-lg flex items-center justify-center">
                            <Banknote className="h-5 w-5 text-secondary-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">ເກັບເງິນປາຍທາງ (COD)</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              ຈ່າຍເງິນເມື່ອໄດ້ຮັບສິນຄ້າ
                            </p>
                          </div>
                          {paymentMethod === "cod" && (
                            <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                      >
                        ກັບຄືນ
                      </Button>
                      <Button
                        onClick={handlePaymentSubmit}
                        className="flex-1"
                        size="lg"
                      >
                        ດຳເນີນການຕໍ່
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">ຢືນຢັນຄຳສັ່ງຊື້</h2>

                  {orderError && (
                    <p className="text-sm text-destructive mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
                      {orderError}
                    </p>
                  )}

                  {/* Shipping Info Summary */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">ທີ່ຢູ່ຈັດສົ່ງ</h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-sm text-primary"
                      >
                        ແກ້ໄຂ
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shippingInfo.name} | {shippingInfo.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shippingInfo.address}
                    </p>
                    {deliveryLat != null && deliveryLng != null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ພິກັດ: {deliveryLat.toFixed(5)}, {deliveryLng.toFixed(5)} (ນະຄອນຫຼວງວຽງຈັນ)
                      </p>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">ວິທີຊຳລະເງິນ</h3>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-sm text-primary"
                      >
                        ແກ້ໄຂ
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {paymentMethod === "bcel"
                        ? "BCEL One QR Code"
                        : "ເກັບເງິນປາຍທາງ (COD)"}
                    </p>
                    {paymentMethod === "bcel" && paymentReceipt && (
                      <div className="relative mt-3 aspect-[4/3] w-full max-w-36 overflow-hidden rounded-lg bg-muted/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={paymentReceipt.previewUrl}
                          alt="ຫຼັກຖານການຊຳລະ"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-4">ສິນຄ້າທີ່ສັ່ງ</h3>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                        >
                          <ProductImage
                            src={item.product.images[0]}
                            alt={item.product.nameLao}
                            productName={item.product.nameLao}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.product.nameLao}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              x{item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            {formatLAK(item.product.priceLAK * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      ກັບຄືນ
                    </Button>
                    <Button
                      onClick={handleConfirmOrder}
                      className="flex-1 bg-primary"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "ກຳລັງດຳເນີນການ..." : "ຢືນຢັນຄຳສັ່ງຊື້"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">ສະຫຼຸບຄຳສັ່ງຊື້</h3>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="relative">
                      <ProductImage
                        src={item.product.images[0]}
                        alt={item.product.nameLao}
                        productName={item.product.nameLao}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.product.nameLao}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatLAK(item.product.priceLAK * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ລວມສິນຄ້າ</span>
                  <span>{formatLAK(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ຄ່າຈັດສົ່ງ</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-primary">ຟຣີ</span>
                    ) : (
                      formatLAK(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>ລວມທັງໝົດ</span>
                  <span className="text-primary">{formatLAK(totalAmount)}</span>
                </div>
              </div>

              {amountUntilFree > 0 && !shippingQuote?.free_shipping_applied && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  {quoteLoading
                    ? "ກຳລັງຄິດຄ່າສົ່ງ..."
                    : `ຊື້ເພີ່ມອີກ ${formatLAK(amountUntilFree)} ເພື່ອຮັບການຈັດສົ່ງຟຣີ`}
                </p>
              )}
              {shippingQuote?.free_shipping_applied && (
                <p className="text-xs text-primary mt-4 text-center font-medium">
                  ຮັບການຈັດສົ່ງຟຣີແລ້ວ
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
