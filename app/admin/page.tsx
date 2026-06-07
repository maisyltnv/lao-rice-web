"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Loader2,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, type Order } from "@/lib/store";
import { formatLAK, formatDateLao } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import {
  apiAdminListOrders,
  apiListProducts,
  isApiConfigured,
} from "@/lib/api";
import { apiOrderToStoreOrder } from "@/lib/map-api-order";
import { apiProductToStoreProduct } from "@/lib/map-api-product";
import { normalizePhone } from "@/lib/order-phone";

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map((n) => Number.parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isTodayDate(date: Date): boolean {
  return isSameCalendarDay(date, new Date());
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isWithinDateRange(orderDate: Date, start: Date, end: Date): boolean {
  const t = startOfDay(orderDate).getTime();
  const from = startOfDay(start).getTime();
  const to = startOfDay(end).getTime();
  return t >= from && t <= to;
}

function formatRangeLabel(start: Date, end: Date): string {
  if (isSameCalendarDay(start, end)) {
    return isTodayDate(start) ? "ມື້ນີ້" : formatDateLao(start);
  }
  return `${formatDateLao(start)} – ${formatDateLao(end)}`;
}

function normalizeDateRange(startStr: string, endStr: string): {
  start: string;
  end: string;
} {
  const start = parseDateInput(startStr);
  const end = parseDateInput(endStr);
  if (start.getTime() <= end.getTime()) {
    return { start: startStr, end: endStr };
  }
  return { start: endStr, end: startStr };
}

function uniqueCustomerPhones(orders: Order[]): number {
  const phones = new Set<string>();
  for (const o of orders) {
    const p = normalizePhone(o.customerInfo.phone);
    if (p.length >= 8) phones.add(p);
  }
  return phones.size;
}

function formatLoadError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data;
    const apiMsg =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : err.message;
    return apiMsg;
  }
  if (err instanceof Error) return err.message;
  return "ບໍ່ຮູ້ສາເຫດ";
}

export default function AdminDashboardPage() {
  const { setOrders } = useStore();
  const { isReady, adminToken } = useAuth();

  const [orders, setLocalOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const todayValue = toDateInputValue(new Date());
  const [startDate, setStartDate] = useState(todayValue);
  const [endDate, setEndDate] = useState(todayValue);

  const applyDateRange = useCallback((start: string, end: string) => {
    const normalized = normalizeDateRange(start, end);
    setStartDate(normalized.start);
    setEndDate(normalized.end);
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!isApiConfigured()) {
      setLoadError("ຕັ້ງ NEXT_PUBLIC_API_URL ໃນ .env");
      return;
    }
    if (!adminToken) {
      setLoadError("ຕ້ອງເຂົ້າ /admin/login ກ່ອນ");
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const [orderList, productResult] = await Promise.all([
        apiAdminListOrders({ limit: 500, offset: 0 }),
        apiListProducts({ limit: 500, offset: 0 }),
      ]);

      const mappedOrders = orderList.map(apiOrderToStoreOrder);
      setLocalOrders(mappedOrders);
      setOrders(mappedOrders);

      const mappedProducts = productResult.items.map(apiProductToStoreProduct);
      setProductCount(
        typeof productResult.total === "number"
          ? productResult.total
          : mappedProducts.length
      );
      setLowStockProducts(
        mappedProducts.filter((p) => p.stock > 0 && p.stock < 10).length
      );
    } catch (err) {
      setLoadError(`ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: ${formatLoadError(err)}`);
    } finally {
      setLoading(false);
    }
  }, [adminToken, setOrders]);

  useEffect(() => {
    if (!isReady || !adminToken) return;
    void loadDashboard();
  }, [isReady, adminToken, loadDashboard]);

  const rangeStart = useMemo(() => parseDateInput(startDate), [startDate]);
  const rangeEnd = useMemo(() => parseDateInput(endDate), [endDate]);

  const ordersInRange = useMemo(
    () =>
      orders.filter((o) => isWithinDateRange(o.createdAt, rangeStart, rangeEnd)),
    [orders, rangeStart, rangeEnd]
  );

  const revenueInRange = useMemo(
    () => ordersInRange.reduce((sum, o) => sum + o.totalLAK, 0),
    [ordersInRange]
  );

  const pendingInRange = useMemo(
    () => ordersInRange.filter((o) => o.status === "pending").length,
    [ordersInRange]
  );

  const customersInRange = useMemo(
    () => uniqueCustomerPhones(ordersInRange),
    [ordersInRange]
  );

  const rangeLabel = formatRangeLabel(rangeStart, rangeEnd);

  const stats = [
    {
      name: `ລາຍຮັບ (${rangeLabel})`,
      value: formatLAK(revenueInRange),
      icon: DollarSign,
    },
    {
      name: `ຄຳສັ່ງ (${rangeLabel})`,
      value: String(ordersInRange.length),
      icon: ShoppingCart,
    },
    {
      name: "ສິນຄ້າທັງໝົດ",
      value: String(productCount),
      icon: Package,
      note: "ທັງຮ້ານ",
    },
    {
      name: `ລູກຄ້າ (${rangeLabel})`,
      value: String(customersInRange),
      icon: Users,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ແດັສບອດ</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || !adminToken}
          onClick={() => void loadDashboard()}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          ໂຫຼດໃໝ່
        </Button>
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground w-full sm:w-auto">
            <CalendarDays className="h-4 w-4 text-primary" />
            ຊ່ວງວັນທີ່
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dashboard-start" className="text-xs text-muted-foreground">
              ວັນເລີ່ມ
            </Label>
            <Input
              id="dashboard-start"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => applyDateRange(e.target.value, endDate)}
              className="w-[11.5rem]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dashboard-end" className="text-xs text-muted-foreground">
              ວັນສິ້ນສຸດ
            </Label>
            <Input
              id="dashboard-end"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => applyDateRange(startDate, e.target.value)}
              className="w-[11.5rem]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const t = toDateInputValue(new Date());
                applyDateRange(t, t);
              }}
            >
              ມື້ນີ້
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 6);
                applyDateRange(
                  toDateInputValue(start),
                  toDateInputValue(end)
                );
              }}
            >
              7 ວັນຜ່ານມາ
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date(end.getFullYear(), end.getMonth(), 1);
                applyDateRange(
                  toDateInputValue(start),
                  toDateInputValue(end)
                );
              }}
            >
              ເດືອນນີ້
            </Button>
          </div>
          <p className="text-sm text-muted-foreground w-full lg:ml-auto lg:w-auto lg:text-right">
            ສະແດງ: <strong>{rangeLabel}</strong> · {ordersInRange.length} ຄຳສັ່ງ
          </p>
        </div>
      </div>

      {loadError && (
        <p className="mb-6 text-sm text-destructive rounded-lg bg-destructive/10 px-4 py-3">
          {loadError}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {loading && orders.length === 0 && !stat.name.includes("ສິນຄ້າທັງໝົດ")
                ? "—"
                : stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.name}</p>
            {"note" in stat && stat.note ? (
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                {stat.note}
              </p>
            ) : null}
          </motion.div>
        ))}
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">ຄຳສັ່ງລໍຖ້າ</h3>
              <p className="text-sm text-muted-foreground">{rangeLabel}</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600">{pendingInRange}</p>
          <Link
            href="/admin/orders"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            ເບິ່ງຄຳສັ່ງຊື້ທັງໝົດ →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold">ສິນຄ້າໃກ້ໝົດ</h3>
              <p className="text-sm text-muted-foreground">ນ້ອຍກວ່າ 10 ຖົງ</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{lowStockProducts}</p>
          <Link
            href="/admin/products"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            ເບິ່ງສິນຄ້າທັງໝົດ →
          </Link>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">ຄຳສັ່ງໃນຊ່ວງວັນທີ່</h3>
          <span className="text-xs text-muted-foreground">
            {rangeLabel} · {ordersInRange.length} ຄຳສັ່ງ
          </span>
        </div>
        {loading && orders.length === 0 ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ordersInRange.length > 0 ? (
          <div className="divide-y divide-border">
            {ordersInRange.map((order) => (
              <div
                key={order.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerInfo.name} | {order.customerInfo.province}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDateLao(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">
                    {formatLAK(order.totalLAK)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "pending"
                        ? "bg-orange-100 text-orange-600"
                        : order.status === "processing"
                          ? "bg-blue-100 text-blue-600"
                          : order.status === "shipped"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-green-100 text-green-600"
                    }`}
                  >
                    {order.status === "pending"
                      ? "ລໍຖ້າ"
                      : order.status === "processing"
                        ? "ກຳລັງດຳເນີນ"
                        : order.status === "shipped"
                          ? "ສົ່ງແລ້ວ"
                          : "ສຳເລັດ"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            ບໍ່ມີຄຳສັ່ງໃນຊ່ວງ {rangeLabel}
          </div>
        )}
      </motion.div>
    </div>
  );
}
