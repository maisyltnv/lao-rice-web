"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { useAuth } from "@/lib/auth";
import {
  apiListCustomerOrders,
  isApiConfigured,
  ORDERS_BY_PHONE_PAGE_SIZE,
} from "@/lib/api";
import { getCustomerPhone } from "@/lib/customer-account";
import { apiOrderToStoreOrder } from "@/lib/map-api-order";
import type { Order } from "@/lib/store";
import { CustomerOrderCard } from "@/components/orders/customer-order-card";

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
        const res = await apiListCustomerOrders({
          phone: phone ?? "",
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
    [token, phone]
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
      <>
        <AppTopBar title="ຄຳສັ່ງຊື້" />
        <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
          ກຳລັງໂຫຼດ...
        </div>
      </>
    );
  }

  const isEmpty =
    !loading && results.length === 0 && total === 0;

  return (
    <>
      <AppTopBar title="ຄຳສັ່ງຊື້" />
      <div className="px-4 pt-4 pb-8">
        {loading && results.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
              <Package className="h-9 w-9 text-primary" />
            </div>
            <p className="mb-6 text-base font-semibold text-foreground">
              ຍັງບໍ່ມີຄຳສັ່ງຊື້
            </p>
            <Button
              asChild
              className="rounded-[24px] px-6"
            >
              <Link href="/">ເລີ່ມຊື້ເຄື່ອງ</Link>
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-3 rounded-[14px] bg-muted px-4 py-3 text-sm text-muted-foreground">
                {error}
              </p>
            )}
            <ul>
              {results.map((order) => (
                <li key={order.id}>
                  <CustomerOrderCard order={order} />
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-[24px]"
                  disabled={!hasPrev || loading}
                  onClick={() => void loadPage(page - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  ກ່ອນໜ້າ
                </Button>
                <span className="text-sm text-muted-foreground">
                  ໜ້າ {page}/{totalPages} ({total} ຄຳສັ່ງ)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-[24px]"
                  disabled={!hasNext || loading}
                  onClick={() => void loadPage(page + 1)}
                >
                  ຕໍ່ໄປ
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
