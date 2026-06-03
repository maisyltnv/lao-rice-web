import type { ApiOrder, ApiOrderItem } from "@/lib/api-types";
import type { CartItem, Order, Product } from "@/lib/store";

function mapApiStatus(s?: string): Order["status"] {
  const v = (s ?? "").toLowerCase();
  if (v === "processing" || v === "confirmed") return "processing";
  if (v === "shipped" || v === "shipping") return "shipped";
  if (v === "delivered" || v === "completed" || v === "done")
    return "delivered";
  return "pending";
}

function paymentLabel(method?: string): string {
  if (method === "bcel_qr") return "BCEL One QR";
  if (method === "cod") return "ເກັບເງິນປາຍທາງ (COD)";
  return method ?? "—";
}

function readPaymentReceiptUrl(o: ApiOrder): string | null {
  const direct = o.payment_receipt_url;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const alt = (o as Record<string, unknown>).payment_receipt;
  if (typeof alt === "string" && alt.trim()) return alt.trim();
  return null;
}

function readItemImageUrl(item: ApiOrderItem): string {
  const nested = item.product?.image_url;
  if (typeof nested === "string" && nested.trim()) return nested.trim();
  const flat = (item as Record<string, unknown>).image_url;
  if (typeof flat === "string" && flat.trim()) return flat.trim();
  return "";
}

function readItemSourceUrl(item: ApiOrderItem): string {
  const nested = item.product?.source_url;
  if (typeof nested === "string" && nested.trim()) return nested.trim();
  const flat = (item as Record<string, unknown>).source_url;
  if (typeof flat === "string" && flat.trim()) return flat.trim();
  return "";
}

function stubProduct(item: ApiOrderItem, productId: string): Product {
  const unitPrice = Number(item.unit_price_lak ?? 0);
  const qty = Number(item.quantity ?? 1);
  const lineTotal = Number(item.line_total_lak ?? unitPrice * qty);
  const priceLAK =
    unitPrice > 0 ? unitPrice : qty > 0 ? lineTotal / qty : lineTotal;
  const sourceUrl = readItemSourceUrl(item);
  const imageUrl = readItemImageUrl(item);
  const nameLao = item.product_name ?? `ສິນຄ້າ #${productId}`;

  return {
    id: productId,
    name: item.product?.name ?? item.product_name ?? `Product ${productId}`,
    nameLao,
    description: "",
    descriptionLao: "",
    howToUse: "",
    howToUseLao: "",
    priceCNY: 0,
    priceLAK: priceLAK,
    marginPercent: 0,
    images: imageUrl ? [imageUrl] : [],
    category: "",
    categoryLao: "",
    stock: 0,
    sourceUrl,
    trustBadges: [],
    isNew: false,
    isBestSeller: false,
  };
}

function mapApiOrderItems(items?: ApiOrderItem[]): CartItem[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item) => {
    const productId = String(item.product_id ?? item.id ?? "0");
    const quantity = Math.max(1, Number(item.quantity ?? 1));
    return {
      product: stubProduct(item, productId),
      quantity,
    };
  });
}

export function apiOrderToStoreOrder(o: ApiOrder): Order {
  const displayId = o.order_number?.trim() || String(o.id);
  const items = mapApiOrderItems(o.items);
  const subtotal = Number(o.subtotal_lak ?? 0);
  const shipping = Number(o.shipping_fee_lak ?? 0);
  const total = Number(o.total_amount_lak ?? subtotal + shipping);

  const apiId =
    typeof o.id === "number" ? o.id : Number.parseInt(String(o.id ?? ""), 10);

  return {
    id: displayId,
    apiId: Number.isFinite(apiId) && apiId > 0 ? apiId : undefined,
    items,
    customerInfo: {
      name:
        o.recipient_name ??
        (typeof o.customer_name === "string" ? o.customer_name : "ຄຳສັ່ງຈາກ API"),
      phone:
        o.phone ??
        (typeof o.customer_phone === "string" ? o.customer_phone : "—"),
      address:
        o.address_detail ??
        (typeof o.shipping_address === "string" ? o.shipping_address : "—"),
      province: o.province ?? "ນະຄອນຫຼວງວຽງຈັນ",
      latitude:
        typeof o.latitude === "number"
          ? o.latitude
          : Number((o as Record<string, unknown>).latitude) || undefined,
      longitude:
        typeof o.longitude === "number"
          ? o.longitude
          : Number((o as Record<string, unknown>).longitude) || undefined,
    },
    paymentMethod: paymentLabel(
      typeof o.payment_method === "string" ? o.payment_method : undefined
    ),
    paymentReceiptUrl: readPaymentReceiptUrl(o),
    status: mapApiStatus(typeof o.status === "string" ? o.status : undefined),
    subtotalLAK: subtotal > 0 ? subtotal : undefined,
    shippingFeeLAK: shipping >= 0 ? shipping : undefined,
    totalLAK: total,
    createdAt: o.created_at ? new Date(o.created_at) : new Date(),
  };
}
