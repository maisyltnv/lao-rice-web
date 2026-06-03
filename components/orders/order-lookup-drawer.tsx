"use client";

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Search,
  Loader2,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore, type Order } from "@/lib/store";
import {
  apiLookupOrdersByPhone,
  isApiConfigured,
  ORDERS_BY_PHONE_PAGE_SIZE,
} from "@/lib/api";
import { apiOrderToStoreOrder } from "@/lib/map-api-order";
import { phonesMatch } from "@/lib/order-phone";
import { CustomerOrderCard } from "@/components/orders/customer-order-card";
import { useAuth } from "@/lib/auth";
import {
  getCustomerPhone,
  getStoredCustomerPhone,
} from "@/lib/customer-account";

interface PaginationState {
  page: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const emptyPagination: PaginationState = {
  page: 1,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

interface OrderLookupDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function paginateLocalOrders(orders: Order[], page: number): {
  items: Order[];
  pagination: PaginationState;
} {
  const total = orders.length;
  const totalPages = total > 0 ? Math.ceil(total / ORDERS_BY_PHONE_PAGE_SIZE) : 0;
  const start = (page - 1) * ORDERS_BY_PHONE_PAGE_SIZE;
  return {
    items: orders.slice(start, start + ORDERS_BY_PHONE_PAGE_SIZE),
    pagination: {
      page,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function OrderLookupDrawer({
  open,
  onOpenChange,
}: OrderLookupDrawerProps) {
  const { orders: localOrders } = useStore();
  const { user, token } = useAuth();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open) return;
    const fromAccount = getCustomerPhone(user) || getStoredCustomerPhone() || "";
    if (fromAccount) setPhone(fromAccount);
  }, [open, user]);
  const [searchedPhone, setSearchedPhone] = useState("");
  const [results, setResults] = useState<Order[]>([]);
  const [pagination, setPagination] =
    useState<PaginationState>(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(false);

  const fetchPage = useCallback(
    async (trimmed: string, page: number) => {
      setLoading(true);
      setError(null);

      const fromLocal = localOrders.filter((o) =>
        phonesMatch(o.customerInfo.phone, trimmed)
      );

      if (!isApiConfigured()) {
        const { items, pagination: p } = paginateLocalOrders(fromLocal, page);
        setResults(items);
        setPagination(p);
        setUseLocalOnly(true);
        if (items.length === 0) {
          setError("ບໍ່ພົບຄຳສັ່ງ — ກວດເບີໂທອີກຄັ້ງ");
        }
        setLoading(false);
        return;
      }

      try {
        const res = await apiLookupOrdersByPhone(trimmed, {
          page,
          limit: ORDERS_BY_PHONE_PAGE_SIZE,
        });
        let mapped = res.items.map(apiOrderToStoreOrder);

        if (page === 1 && fromLocal.length > 0) {
          const apiIds = new Set(mapped.map((o) => o.id));
          const extra = fromLocal.filter((o) => !apiIds.has(o.id));
          if (extra.length > 0 && mapped.length < ORDERS_BY_PHONE_PAGE_SIZE) {
            mapped = [
              ...mapped,
              ...extra.slice(0, ORDERS_BY_PHONE_PAGE_SIZE - mapped.length),
            ];
          }
        }

        setResults(mapped);
        setPagination({
          page: res.page,
          total: res.total,
          totalPages: res.total_pages,
          hasNext: res.has_next,
          hasPrev: res.has_prev,
        });
        setUseLocalOnly(false);

        if (mapped.length === 0 && res.total === 0) {
          setError("ບໍ່ພົບຄຳສັ່ງສຳລັບເບີໂທນີ້");
        }
      } catch (err) {
        if (fromLocal.length > 0) {
          const { items, pagination: p } = paginateLocalOrders(fromLocal, page);
          setResults(items);
          setPagination(p);
          setUseLocalOnly(true);
          setError(
            "ໂຫຼດຈາກ API ບໍ່ໄດ້ — ສະແດງຄຳສັ່ງທີ່ບັນທຶກໃນເຄື່ອງນີ້ເທົ່ານັ້ນ"
          );
        } else {
          const msg = axios.isAxiosError(err)
            ? (() => {
                const body = err.response?.data;
                if (body && typeof body === "object" && "error" in body) {
                  return String((body as { error: unknown }).error);
                }
                return err.message;
              })()
            : err instanceof Error
              ? err.message
              : "ບໍ່ຮູ້ສາເຫດ";
          setError(`ຄົ້ນຫາບໍ່ສຳເລັດ: ${msg}`);
          setResults([]);
          setPagination(emptyPagination);
        }
      } finally {
        setLoading(false);
      }
    },
    [localOrders]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (trimmed.length < 6) {
      setError("ກະລຸນາໃສ່ເບີໂທຢ່າງໜ້ອຍ 6 ຕົວເລກ");
      return;
    }
    setSearched(true);
    setSearchedPhone(trimmed);
    await fetchPage(trimmed, 1);
  };

  const goToPage = async (nextPage: number) => {
    if (!searchedPhone || loading) return;
    if (useLocalOnly) {
      const fromLocal = localOrders.filter((o) =>
        phonesMatch(o.customerInfo.phone, searchedPhone)
      );
      const { items, pagination: p } = paginateLocalOrders(fromLocal, nextPage);
      setResults(items);
      setPagination(p);
      return;
    }
    await fetchPage(searchedPhone, nextPage);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const showPagination =
    searched &&
    pagination.totalPages > 1 &&
    (pagination.hasNext || pagination.hasPrev);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 shadow-xl flex flex-col"
          >
            <motion.div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">ຄຳສັ່ງຊື້ຂອງຂ້ອຍ</span>
              </div>
              <button type="button" onClick={handleClose} aria-label="ປິດ">
                <X className="h-6 w-6" />
              </button>
            </motion.div>

            <div className="p-4 border-b border-border shrink-0">
              <p className="text-sm text-muted-foreground mb-3">
                {token
                  ? "ຄົ້ນຫາຄຳສັ່ງດ້ວຍເບີໂທທີ່ຜູກກັບບັນຊີ (ຫຼືເບີທີ່ໃຊ້ຕອນສັ່ງຊື້)"
                  : "ໃສ່ເບີໂທທີ່ໃຊ້ຕອນສັ່ງຊື້ ເພື່ອເບິ່ງສະຖານະຄຳສັ່ງ"}
              </p>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="020 xxxx xxxx"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>
              {error && (
                <p className="mt-3 text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
                  {error}
                </p>
              )}
              {searched && pagination.total > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  ພົບ {pagination.total} ຄຳສັ່ງ
                  {pagination.totalPages > 1 &&
                    ` · ໜ້າ ${pagination.page}/${pagination.totalPages}`}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 min-h-0">
              {loading && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">ກຳລັງໂຫຼດ...</p>
                </div>
              ) : !searched ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Package className="h-14 w-14 mb-3 opacity-40" />
                  <p className="text-sm">ພິມເບີໂທ ແລ້ວກົດຄົ້ນຫາ</p>
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  ບໍ່ມີລາຍການ
                </div>
              ) : (
                <ul className="space-y-3">
                  {results.map((order) => (
                    <li key={`${order.id}-${order.createdAt.getTime()}`}>
                      <CustomerOrderCard order={order} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {showPagination && (
              <div className="shrink-0 border-t border-border p-4 flex items-center justify-between gap-3 bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev || loading}
                  onClick={() => void goToPage(pagination.page - 1)}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  ກ່ອນໜ້າ
                </Button>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext || loading}
                  onClick={() => void goToPage(pagination.page + 1)}
                  className="flex-1"
                >
                  ຖັດໄປ
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
