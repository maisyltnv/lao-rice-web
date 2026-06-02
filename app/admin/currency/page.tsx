"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, RefreshCw, Save, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatLAK } from "@/lib/format";
import {
  apiGetExchangeRate,
  apiUpdateExchangeRate,
  isApiConfigured,
} from "@/lib/api";
import type { ApiExchangeRateExample } from "@/lib/api-types";

function formatUpdatedAt(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("lo-LA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function CurrencyManagerPage() {
  const { exchangeRate, setExchangeRate, products, refreshProducts } =
    useStore();
  const { adminToken } = useAuth();

  const [newRate, setNewRate] = useState(exchangeRate.toString());
  const [examples, setExamples] = useState<ApiExchangeRateExample[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const [lastProductsUpdated, setLastProductsUpdated] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRate = useCallback(async () => {
    if (!isApiConfigured()) {
      setNewRate(exchangeRate.toString());
      setProductsCount(products.length);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetExchangeRate();
      setNewRate(String(data.rate_lak_per_cny));
      setExchangeRate(data.rate_lak_per_cny);
      setProductsCount(data.products_count ?? products.length);
      setUpdatedAt(data.updated_at);
      if (data.examples?.length) {
        setExamples(data.examples);
      } else {
        const rate = data.rate_lak_per_cny;
        setExamples([
          { cny: 10, lak: Math.round(10 * rate) },
          { cny: 50, lak: Math.round(50 * rate) },
          { cny: 100, lak: Math.round(100 * rate) },
          { cny: 500, lak: Math.round(500 * rate) },
        ]);
      }
    } catch {
      setError("ໂຫຼດອັດຕາແລກປ່ຽນຈາກ API ບໍ່ສຳເລັດ");
      setNewRate(exchangeRate.toString());
      setProductsCount(products.length);
    } finally {
      setLoading(false);
    }
  }, [products.length, setExchangeRate]);

  useEffect(() => {
    void loadRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  useEffect(() => {
    setNewRate(exchangeRate.toString());
  }, [exchangeRate]);

  const previewPrices =
    examples.length > 0
      ? examples
      : [10, 50, 100, 500].map((cny) => ({
          cny,
          lak: Math.round(cny * (parseFloat(newRate) || 0)),
        }));

  const handleSave = async () => {
    setError(null);
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      setError("ອັດຕາແລກປ່ຽນຕ້ອງເປັນຕົວເລກທີ່ມີຄ່າຫຼາຍກວ່າ 0");
      return;
    }

    if (!isApiConfigured()) {
      setExchangeRate(rate);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      return;
    }

    if (!adminToken) {
      setError("ຕ້ອງເຂົ້າລະບົບແອັດມິນ — ໄປ /admin/login");
      return;
    }

    setSaving(true);
    try {
      const result = await apiUpdateExchangeRate({ rate_lak_per_cny: rate });
      setExchangeRate(result.rate_lak_per_cny);
      setNewRate(String(result.rate_lak_per_cny));
      setLastProductsUpdated(result.products_updated);
      setUpdatedAt(result.updated_at);
      setProductsCount(result.products_updated);
      await refreshProducts();
      await loadRate();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      setError(
        "ບັນທຶກອັດຕາແລກປ່ຽນບໍ່ສຳເລັດ — ກວດ JWT ແອັດມິນ ແລະ backend"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div>
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ຈັດການອັດຕາແລກປ່ຽນ
          </h1>
          <p className="text-muted-foreground">
            ປັບອັດຕາແລກປ່ຽນຕົ້ນທຶນ → ລາຄາຂາຍ (LAK) — ລະບົບຈະຄິດລາຄາສິນຄ້າທັງໝົດໃໝ່
          </p>
          {updatedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              ອັບເດດຫຼ້າສຸດ: {formatUpdatedAt(updatedAt)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadRate()}
          disabled={loading || saving}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          ໂຫຼດໃໝ່
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <motion.div className="mb-6 flex items-center gap-3" initial={false}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">ອັດຕາແລກປ່ຽນປະຈຸບັນ</h2>
              <p className="text-sm text-muted-foreground">
                1 ຫຍວນ (¥) = ? ກີບ (₭)
              </p>
            </div>
          </motion.div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              ອັດຕາແລກປ່ຽນ (₭ ຕໍ່ 1 ¥)
            </label>
            <motion.div className="flex items-center gap-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₭
                </span>
                <Input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="pl-8 text-lg"
                  placeholder="3500"
                  disabled={loading || saving}
                />
              </div>
              <Button
                onClick={() => void handleSave()}
                disabled={loading || saving}
                className={isSaved ? "bg-green-600 hover:bg-green-600" : ""}
              >
                {isSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    ບັນທຶກແລ້ວ
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {lastProductsUpdated != null && (
            <p className="mb-4 text-sm text-green-700 dark:text-green-400">
              ອັບເດດລາຄາສິນຄ້າ {lastProductsUpdated} ລາຍການໃນ backend ແລ້ວ
            </p>
          )}

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="mb-2 text-sm text-muted-foreground">
              ຕົວຢ່າງການແລກປ່ຽນ:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {previewPrices.map((price) => (
                <div
                  key={price.cny}
                  className="flex items-center justify-between rounded-md bg-background p-2"
                >
                  <span className="text-sm">{price.cny} ¥</span>
                  <span className="text-sm font-medium text-primary">
                    = {formatLAK(price.lak)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <motion.div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </motion.div>
              <h3 className="font-semibold">ຜົນກະທົບ</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              ເມື່ອກົດບັນທຶກ, ສົ່ງ PUT /exchange-rate — backend ຄິດໄລ່{" "}
              <code className="text-xs">final_price_lak</code> ຂອງສິນຄ້າທຸກລາຍການໃໝ່:
            </p>
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-mono">
                ລາຄາຂາຍ (₭) = ລາຄາຊື້ຕົ້ນທຶນ (¥) × ອັດຕາແລກປ່ຽນ × (1 + ກຳໄລ%)
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <motion.div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </motion.div>
              <h3 className="font-semibold">ສິນຄ້າທີ່ຈະອັບເດດ</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-primary">
                  {productsCount || products.length}
                </p>
                <p className="text-sm text-muted-foreground">ສິນຄ້າທັງໝົດ</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-secondary">
                  {formatLAK(parseFloat(newRate) || exchangeRate)}
                </p>
                <p className="text-sm text-muted-foreground">ອັດຕາປະຈຸບັນ</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
