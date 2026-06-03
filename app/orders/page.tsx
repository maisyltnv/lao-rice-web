"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { apiListMyOrders, isApiConfigured, ORDERS_BY_PHONE_PAGE_SIZE } from "@/lib/api";
import { getCustomerPhone } from "@/lib/customer-account";
import { formatDateLao, formatLAK } from "@/lib/format";
import { apiOrderToStoreOrder } from "@/lib/map-api-order";
import type { Order } from "@/lib/store";

const statusLabel: Record<Order["status"], string> = {
  pending: "ລໍຖ້າ",
  processing: "ກຳລັງດຳເນີນ",
  shipped: "ສົ່ງແລ້ວ",
  delivered: "ສຳເລັດ",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const phone = getCustomerPhone(user);

  const [results, setResults] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (p: number) => {
      if (!token || !isApiConfigured()) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiListMyOrders({
          page: p,
          limit: ORDERS_BY_PHONE_PAGE_SIZE,
        });
        setResults(res.items.map(apiOrderToStoreOrder));
        setPage(res.page);
        setTotal(res.total);
        setTotalPages(res.total_pages);
        setHasNext(res.has_next);
        setHasPrev(res.has_prev);
        if (res.items.length === 0 && res.total === 0) {
          setError("ຍັງບໍ່ມີຄຳສັ່ງຊື້");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "ໂຫຼດຄຳສັ່ງບໍ່ສຳເລັດ");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isReady && !token) {
      router.replace(`/login?redirect=${encodeURIComponent("/orders")}`);
      return;
    }
    if (isReady && token) void loadPage(1);
  }, [isReady, token, router, loadPage]);

  if (!isReady || !token) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        ກຳລັງໂຫຼດ...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">ຄຳສັ່ງຊື້ຂອງຂ້ອຍ</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          ເບີໂທ: <strong>{phone}</strong>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <Link href="/account" className="text-primary hover:underline">
            ບັນຊີຂອງຂ້ອຍ
          </Link>
        </p>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {error && (
            <p className="text-sm text-muted-foreground rounded-lg bg-muted px-4 py-3 mb-4">
              {error}
            </p>
          )}
          <ul className="space-y-4">
            {results.map((order) => (
              <li
                key={order.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-semibold">{order.id}</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                    {statusLabel[order.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {formatDateLao(order.createdAt)}
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatLAK(order.total)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {order.items.length} ລາຍການ · {order.customerInfo.phone}
                </p>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev || loading}
                onClick={() => void loadPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                ກ່ອນໜ້າ
              </Button>
              <span className="text-sm text-muted-foreground">
                ໜ້າ {page}/{totalPages} ({total} ຄຳສັ່ງ)
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext || loading}
                onClick={() => void loadPage(page + 1)}
              >
                ຕໍ່ໄປ
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
