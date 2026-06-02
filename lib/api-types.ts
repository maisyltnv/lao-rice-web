/** Types aligned with the backend OpenAPI-style contract */

/** GET /banners — homepage hero slides */
export interface ApiBanner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  cta_label?: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiBannerListResponse {
  items: ApiBanner[];
}

export interface ApiCreateBannerBody {
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  cta_label?: string;
  link_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface ApiUpdateBannerBody {
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  cta_label?: string;
  link_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

/** Nested on GET/POST /products response when backend expands category */
export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  category_id: number;
  /** Populated when API embeds category on product responses */
  category?: ApiCategory;
  original_price_cny: number;
  exchange_rate: number;
  profit_margin: number;
  final_price_lak: number;
  stock: number;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

/** GET /products — paginated list with optional search */
export interface ApiProductListResponse {
  items: ApiProduct[];
  total: number;
}

export interface ApiProductListParams {
  limit?: number;
  offset?: number;
  /** Filter by category (numeric id from GET /categories) */
  category_id?: number;
  /** Search name/description (recommended) */
  q?: string;
  /** Same as q */
  search?: string;
}

export interface ApiLoginResponse {
  access_token: string;
  expires_at?: string;
  user?: ApiUser;
}

/** Response from POST /auth/admin/login */
export interface ApiAdminLoginResponse {
  access_token: string;
  expires_at?: string;
  user?: ApiUser;
}

export interface ApiUser {
  username?: string;
  role?: string;
  id?: number;
  [key: string]: unknown;
}

/** POST /products — backend ຄິດໄລ່ final_price_lak ຈາກລາຄາ × ອັດຕາ × (1 + profit_margin) */
export interface ApiCreateProductBody {
  name: string;
  category_id: number;
  original_price_cny: number;
  exchange_rate: number;
  profit_margin: number;
  stock: number;
  description?: string;
  image_url?: string;
  source_url?: string;
}

/** PUT /products/:id — partial update (ສົ່ງແຕ່ຟິວທີ່ຕ້ອງປ່ຽນ; ບໍ່ສົ່ງ clear_category ກັບ category_id ພ້ອມກັນ) */
export interface ApiUpdateProductBody {
  name?: string;
  description?: string;
  image_url?: string;
  category_id?: number;
  clear_category?: boolean;
  original_price_cny?: number;
  exchange_rate?: number;
  profit_margin?: number;
  final_price_lak?: number;
  stock?: number;
  source_url?: string;
}

/** GET /orders/shipping-config */
export interface ApiShippingConfig {
  shipping_fee_lak: number;
  free_shipping_min_subtotal_lak: number;
}

/** GET /orders/shipping-quote */
export interface ApiShippingQuote {
  subtotal_lak: number;
  shipping_fee_lak: number;
  total_amount_lak: number;
  free_shipping_min_subtotal_lak: number;
  amount_until_free_shipping_lak: number;
  free_shipping_applied: boolean;
}

export interface ApiOrderItemInput {
  product_id: number;
  quantity: number;
}

export interface ApiOrderShippingInput {
  recipient_name: string;
  phone: string;
  province?: string;
  address_detail: string;
  latitude: number;
  longitude: number;
}

/** POST /orders — public (no JWT) */
export interface ApiCreateOrderBody {
  items: ApiOrderItemInput[];
  shipping: ApiOrderShippingInput;
  payment_method: "bcel_qr" | "cod";
  payment_receipt_url?: string;
}

export interface ApiOrderItem {
  id?: number;
  product_id?: number;
  quantity?: number;
  unit_price_lak?: number;
  line_total_lak?: number;
  product_name?: string;
  product?: Pick<ApiProduct, "id" | "source_url" | "name">;
  [key: string]: unknown;
}

/** GET /orders/:id/source-links — admin procurement links */
export interface ApiOrderSourceLink {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  source_url: string;
}

export interface ApiOrderSourceLinksResponse {
  order_id: number;
  order_number: string;
  links: ApiOrderSourceLink[];
}

export interface ApiOrder {
  id: number;
  order_number?: string;
  subtotal_lak?: number;
  shipping_fee_lak?: number;
  total_amount_lak?: number;
  payment_method?: string;
  payment_receipt_url?: string | null;
  recipient_name?: string;
  phone?: string;
  province?: string;
  address_detail?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  items?: ApiOrderItem[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ApiOrderListResponse {
  items?: ApiOrder[];
}

/** GET /ordersbyphone — paginated */
/** PUT /orders/:id/status — admin JWT */
export type ApiOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered";

export interface ApiUpdateOrderStatusBody {
  status: ApiOrderStatus;
}

export interface ApiOrdersByPhoneResponse {
  items: ApiOrder[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiCategoryListResponse {
  items: ApiCategory[];
}

export interface ApiCreateCategoryBody {
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  parent_id?: number | null;
}

export type ApiUpdateCategoryBody = Partial<ApiCreateCategoryBody>;

export interface ApiExchangeRateExample {
  cny: number;
  lak: number;
}

/** GET /exchange-rate */
export interface ApiExchangeRate {
  rate_lak_per_cny: number;
  products_count?: number;
  updated_at?: string;
  examples?: ApiExchangeRateExample[];
}

/** PUT /exchange-rate */
export interface ApiUpdateExchangeRateBody {
  rate_lak_per_cny: number;
}

/** PUT /exchange-rate response */
export interface ApiUpdateExchangeRateResponse {
  rate_lak_per_cny: number;
  products_updated: number;
  updated_at: string;
}
