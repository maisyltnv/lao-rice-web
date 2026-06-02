"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  ExternalLink,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore, Order } from "@/lib/store";
import { formatLAK, formatDateLao } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import {
  apiAdminListOrders,
  apiGetOrder,
  apiUpdateOrderStatus,
  isApiConfigured,
} from "@/lib/api";
import { apiOrderToStoreOrder } from "@/lib/map-api-order";
import { PaymentReceiptPreview } from "@/components/orders/payment-receipt-preview";

const statusOptions = [
  { id: "all", label: "ທັງໝົດ" },
  { id: "pending", label: "ລໍຖ້າ" },
  { id: "processing", label: "ກຳລັງດຳເນີນ" },
  { id: "shipped", label: "ສົ່ງແລ້ວ" },
  { id: "delivered", label: "ສຳເລັດ" },
];

const statusConfig: Record<
  Order["status"],
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: { label: "ລໍຖ້າ", color: "orange", icon: Clock },
  processing: { label: "ກຳລັງດຳເນີນ", color: "blue", icon: Package },
  shipped: { label: "ສົ່ງແລ້ວ", color: "purple", icon: Truck },
  delivered: { label: "ສຳເລັດ", color: "green", icon: CheckCircle },
};

function orderItemCount(order: Order): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0);
}

function resolveOrderApiId(order: Order): number | null {
  if (order.apiId != null) {
    const id = Number(order.apiId);
    if (!Number.isNaN(id) && id > 0) return id;
  }
  const ordMatch = order.id.match(/^ORD-0*(\d+)$/i);
  if (ordMatch) return parseInt(ordMatch[1], 10);
  if (/^\d+$/.test(order.id)) return parseInt(order.id, 10);
  return null;
}

function formatOrdersApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const body = err.response?.data;
    const apiMsg =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : typeof body === "string"
          ? body
          : err.message;
    return [status, apiMsg].filter(Boolean).join(" — ");
  }
  if (err instanceof Error) return err.message;
  return "ບໍ່ຮູ້ສາເຫດ";
}

export default function AdminOrdersPage() {
  const { updateOrderStatus, setOrders } = useStore();
  const { isReady, adminToken } = useAuth();
  const [orders, setLocalOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersLoadError, setOrdersLoadError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  // Supplier links were for dropship; not used for rice shop.

  const loadOrders = useCallback(async () => {
    if (!isApiConfigured()) {
      setOrdersLoadError("ຕັ້ງ NEXT_PUBLIC_API_URL ໃນ .env");
      return;
    }
    if (!adminToken) {
      setOrdersLoadError(
        "ບໍ່ມີ admin token — ເຂົ້າ /admin/login (POST /auth/admin/login) ແລ້ວໃຊ້ token ດຽວກັນກັບ Postman"
      );
      return;
    }

    setLoading(true);
    setOrdersLoadError(null);
    try {
      const list = await apiAdminListOrders({ limit: 50, offset: 0 });
      const mapped = list.map(apiOrderToStoreOrder);
      setLocalOrders(mapped);
      setOrders(mapped);
    } catch (err) {
      setOrdersLoadError(
        `ໂຫຼດ GET /orders ບໍ່ສຳເລັດ: ${formatOrdersApiError(err)}`
      );
    } finally {
      setLoading(false);
    }
  }, [setOrders, adminToken]);

  useEffect(() => {
    if (!isReady || !adminToken) return;
    void loadOrders();
  }, [isReady, adminToken, loadOrders]);

  useEffect(() => {
    if (!selectedOrder || !adminToken || !isApiConfigured()) return;
    const apiId = resolveOrderApiId(selectedOrder);
    if (!apiId) return;

    let cancelled = false;
    setDetailLoading(true);
    (async () => {
      try {
        const full = await apiGetOrder(apiId);
        if (cancelled) return;
        const mapped = apiOrderToStoreOrder(full);
        setSelectedOrder((prev) =>
          prev?.id === selectedOrder.id
            ? { ...prev, ...mapped, id: prev.id }
            : prev
        );
        setLocalOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id ? { ...o, ...mapped, id: o.id } : o
          )
        );
      } catch {
        /* keep list row data */
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedOrder?.id, adminToken]);

  // Removed supplier link actions (not dropship).

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(q) ||
      order.customerInfo.name.toLowerCase().includes(q) ||
      order.customerInfo.phone.includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const applyStatusLocally = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus);
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setSelectedOrder((prev) =>
      prev?.id === orderId ? { ...prev, status: newStatus } : prev
    );
  };

  const handleStatusChange = async (
    order: Order,
    newStatus: Order["status"]
  ) => {
    if (order.status === newStatus) return;

    const apiId = resolveOrderApiId(order);
    if (!apiId) {
      setStatusError("ບໍ່ພົບ order id ສຳລັບ API (ຕ້ອງມີ apiId ຫຼື ORD-00000001)");
      return;
    }

    if (!adminToken) {
      setStatusError("ຕ້ອງເຂົ້າ /admin/login ເພື່ອອັບເດດສະຖານະ (PUT /orders/:id/status)");
      return;
    }

    setStatusUpdatingId(order.id);
    setStatusError(null);

    try {
      if (isApiConfigured()) {
        const updated = await apiUpdateOrderStatus(apiId, newStatus);
        const mapped = apiOrderToStoreOrder(updated);
        setLocalOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, ...mapped, id: order.id } : o))
        );
        setSelectedOrder((prev) =>
          prev?.id === order.id
            ? { ...prev, ...mapped, id: order.id, status: newStatus }
            : prev
        );
        updateOrderStatus(order.id, newStatus);
      } else {
        applyStatusLocally(order.id, newStatus);
      }
    } catch (err) {
      setStatusError(
        `ອັບເດດສະຖານະບໍ່ສຳເລັດ: ${formatOrdersApiError(err)}`
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <motion.div>
      {ordersLoadError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {ordersLoadError}
        </div>
      )}

      <motion.div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div>
          <h1 className="text-2xl font-bold text-foreground">ຈັດການຄຳສັ່ງຊື້</h1>
          <p className="text-muted-foreground">
            GET /orders (admin JWT) · ລູກຄ້າຄົ້ນຫາດ້ວຍ GET /ordersbyphone
          </p>
        </motion.div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadOrders()}
          disabled={loading || !adminToken}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          ໂຫຼດໃໝ່
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ຄົ້ນຫາຕາມເລກທີ່, ຊື່, ຫຼື ເບີໂທ..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {statusOptions.map((status) => (
            <button
              key={status.id}
              type="button"
              onClick={() => setStatusFilter(status.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">ກຳລັງໂຫຼດຄຳສັ່ງຊື້...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const itemCount = orderItemCount(order);
              return (
                <motion.div
                  key={`${order.apiId ?? order.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <motion.div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          status.color === "orange"
                            ? "bg-orange-100"
                            : status.color === "blue"
                              ? "bg-blue-100"
                              : status.color === "purple"
                                ? "bg-purple-100"
                                : "bg-green-100"
                        }`}
                      >
                        <StatusIcon
                          className={`h-5 w-5 ${
                            status.color === "orange"
                              ? "text-orange-600"
                              : status.color === "blue"
                                ? "text-blue-600"
                                : status.color === "purple"
                                  ? "text-purple-600"
                                  : "text-green-600"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{order.id}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              status.color === "orange"
                                ? "bg-orange-100 text-orange-600"
                                : status.color === "blue"
                                  ? "bg-blue-100 text-blue-600"
                                  : status.color === "purple"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-green-100 text-green-600"
                            }`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.customerInfo.name} | {order.customerInfo.phone}{" "}
                          | {order.customerInfo.province}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block shrink-0">
                      <p className="font-medium text-primary">
                        {formatLAK(order.totalLAK)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {itemCount} ລາຍການ | {formatDateLao(order.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {orders.length === 0 && !loading
                ? "ຍັງບໍ່ມີຄຳສັ່ງຊື້ — ລອງກົດ «ໂຫຼດໃໝ່» ຫຼັງມີຄຳສັ່ງໃນ API"
                : "ບໍ່ພົບຄຳສັ່ງຊື້ທີ່ຄົ້ນຫາ"}
            </p>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => setSelectedOrder(null)}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 overflow-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
              <h2 className="text-lg font-bold">ລາຍລະອຽດຄຳສັ່ງຊື້</h2>
              <button type="button" onClick={() => setSelectedOrder(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ເລກທີ່ຄຳສັ່ງ</p>
                <p className="text-xl font-bold">{selectedOrder.id}</p>
                {selectedOrder.apiId != null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {selectedOrder.apiId}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">ສະຖານະ</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["pending", "processing", "shipped", "delivered"] as const
                  ).map((status) => {
                    const config = statusConfig[status];
                    return (
                      <button
                        key={status}
                        type="button"
                        disabled={
                          statusUpdatingId === selectedOrder.id ||
                          selectedOrder.status === status
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleStatusChange(selectedOrder, status);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-60 ${
                          selectedOrder.status === status
                            ? config.color === "orange"
                              ? "bg-orange-500 text-white"
                              : config.color === "blue"
                                ? "bg-blue-500 text-white"
                                : config.color === "purple"
                                  ? "bg-purple-500 text-white"
                                  : "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <config.icon className="h-3.5 w-3.5" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
                {statusUpdatingId === selectedOrder.id && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    ກຳລັງອັບເດດສະຖານະ...
                  </p>
                )}
                {statusError && (
                  <p className="text-xs text-destructive mt-2 rounded-lg bg-destructive/10 px-2 py-1.5">
                    {statusError}
                  </p>
                )}
                {!statusError && statusUpdatingId !== selectedOrder.id && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ອັບເດດຜ່ານ PUT /orders/:id/status
                  </p>
                )}
              </div>

              <motion.div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm font-medium mb-3">ຂໍ້ມູນລູກຄ້າ</p>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">ຊື່:</span>{" "}
                    {selectedOrder.customerInfo.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">ເບີໂທ:</span>{" "}
                    {selectedOrder.customerInfo.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">ທີ່ຢູ່:</span>{" "}
                    {selectedOrder.customerInfo.address}
                  </p>
                  {selectedOrder.customerInfo.latitude != null &&
                    selectedOrder.customerInfo.longitude != null && (
                      <a
                        href={`https://www.google.com/maps?q=${selectedOrder.customerInfo.latitude},${selectedOrder.customerInfo.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline mt-2"
                      >
                        <MapPin className="h-4 w-4" />
                        ເປີດແຜນທີ່ຈຸດສົ່ງ (ພະນັກງານຈັດສົ່ງ)
                      </a>
                    )}
                </div>
              </motion.div>

              <div>
                <p className="text-sm font-medium mb-3">ສິນຄ້າທີ່ສັ່ງ</p>
                {selectedOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => {
                      return (
                        <div
                          key={`${item.product.id}-${idx}`}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.product.nameLao}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID {item.product.id} · x{item.quantity} ·{" "}
                              {formatLAK(item.product.priceLAK * item.quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">ບໍ່ມີລາຍການສິນຄ້າ</p>
                )}
              </div>

              <div className="relative">
                {detailLoading && (
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    ກຳລັງໂຫຼດຫຼັກຖານການຊຳລະ...
                  </p>
                )}
                <PaymentReceiptPreview
                  receiptUrl={selectedOrder.paymentReceiptUrl}
                  paymentMethod={selectedOrder.paymentMethod}
                />
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-sm font-medium mb-2">ສະຫຼຸບຍອດເງິນ</p>
                {selectedOrder.subtotalLAK != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ລາຄາສິນຄ້າ</span>
                    <span>{formatLAK(selectedOrder.subtotalLAK)}</span>
                  </div>
                )}
                {selectedOrder.shippingFeeLAK != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ຄ່າຈັດສົ່ງ</span>
                    <span>{formatLAK(selectedOrder.shippingFeeLAK)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                  <span>ລວມທັງໝົດ</span>
                  <span className="text-primary">
                    {formatLAK(selectedOrder.totalLAK)}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">ວິທີຊຳລະ</span>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedOrder(null)}
                >
                  ປິດ
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
