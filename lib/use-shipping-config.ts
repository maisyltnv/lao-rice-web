"use client";

import { useEffect, useState } from "react";
import { apiGetShippingConfig, isApiConfigured } from "@/lib/api";

const DEFAULT_SHIPPING_FEE_LAK = 30_000;
const DEFAULT_FREE_SHIPPING_MIN_LAK = 500_000;

export function useShippingConfig() {
  const [shippingFeeLak, setShippingFeeLak] = useState(DEFAULT_SHIPPING_FEE_LAK);
  const [freeShippingMinLak, setFreeShippingMinLak] = useState(
    DEFAULT_FREE_SHIPPING_MIN_LAK
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void apiGetShippingConfig()
      .then((config) => {
        if (cancelled) return;
        setShippingFeeLak(config.shipping_fee_lak);
        setFreeShippingMinLak(config.free_shipping_min_subtotal_lak);
      })
      .catch(() => {
        /* keep defaults */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { shippingFeeLak, freeShippingMinLak, loading };
}
