import axios, { type AxiosInstance } from "axios";
import type {
  ApiAdminLoginResponse,
  ApiBanner,
  ApiBannerListResponse,
  ApiCreateBannerBody,
  ApiUpdateBannerBody,
  ApiCategory,
  ApiCategoryListResponse,
  ApiCreateCategoryBody,
  ApiCreateOrderBody,
  ApiCreateProductBody,
  ApiExchangeRate,
  ApiLoginResponse,
  ApiOtpSendResponse,
  ApiUpdateExchangeRateBody,
  ApiUpdateExchangeRateResponse,
  ApiOrder,
  ApiOrderListResponse,
  ApiOrderSourceLinksResponse,
  ApiOrdersByPhoneResponse,
  ApiOrderStatus,
  ApiUpdateOrderStatusBody,
  ApiShippingConfig,
  ApiShippingQuote,
  ApiProduct,
  ApiProductListParams,
  ApiProductListResponse,
  ApiUpdateCategoryBody,
  ApiUpdateProductBody,
  ApiUser,
} from "@/lib/api-types";
import type { UpdateCustomerProfileBody } from "@/lib/customer-profile";

const USER_TOKEN_KEY = "hb_access_token";
const ADMIN_TOKEN_KEY = "hb_admin_access_token";

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return base;
}

/** Customer / client JWT */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(USER_TOKEN_KEY, token);
  else localStorage.removeItem(USER_TOKEN_KEY);
}

/** Admin JWT (from POST /auth/admin/login) */
export function getStoredAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredAdminAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function createPublicClient(): AxiosInstance {
  return axios.create({
    baseURL: getApiBaseUrl(),
    headers: { "Content-Type": "application/json" },
    timeout: 30_000,
  });
}

function createUserClient(): AxiosInstance {
  const instance = createPublicClient();
  instance.interceptors.request.use((config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
}

function createAdminClient(): AxiosInstance {
  const instance = createPublicClient();
  instance.interceptors.request.use((config) => {
    const token = getStoredAdminAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
}

/** Admin JWT first, then customer JWT (GET /orders may accept either) */
function createOrdersClient(): AxiosInstance {
  const instance = createPublicClient();
  instance.interceptors.request.use((config) => {
    const token = getStoredAdminAccessToken() ?? getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
}

function unwrapOrderList(payload: unknown): ApiOrder[] {
  if (Array.isArray(payload)) return payload as ApiOrder[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items as ApiOrder[];
  if (Array.isArray(record.orders)) return record.orders as ApiOrder[];
  if (record.data != null) return unwrapOrderList(record.data);
  return [];
}

function parseOrdersByPhoneResponse(
  data: unknown,
  page: number,
  limit: number
): ApiOrdersByPhoneResponse {
  const items = unwrapOrderList(data);
  if (!data || typeof data !== "object") {
    return {
      items: [],
      page,
      limit,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    };
  }
  const record = data as Record<string, unknown>;
  const total =
    typeof record.total === "number" ? record.total : items.length;
  const total_pages =
    typeof record.total_pages === "number"
      ? record.total_pages
      : total > 0
        ? Math.ceil(total / limit)
        : 0;
  return {
    items,
    page: typeof record.page === "number" ? record.page : page,
    limit: typeof record.limit === "number" ? record.limit : limit,
    total,
    total_pages,
    has_next: Boolean(record.has_next),
    has_prev: Boolean(record.has_prev),
  };
}

export const ORDERS_BY_PHONE_PAGE_SIZE = 5;

async function fetchOrdersWithToken(
  token: string,
  params: { limit: number; offset: number; phone?: string }
): Promise<ApiOrder[]> {
  const { data } = await publicClient.get<unknown>("/orders", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return unwrapOrderList(data);
}

const publicClient = createPublicClient();
const userClient = createUserClient();
const adminClient = createAdminClient();
const ordersClient = createOrdersClient();

export async function apiHealth(): Promise<{ status?: string }> {
  const { data } = await publicClient.get<{ status?: string }>("/health");
  return data;
}

export async function apiRegister(body: {
  username: string;
  password: string;
  role?: string;
}): Promise<unknown> {
  const { data } = await publicClient.post("/auth/register", body);
  return data;
}

function readAccessToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const token = record.access_token ?? record.token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === "object" && "error" in data) {
      const msg = (data as { error?: unknown }).error;
      if (typeof msg === "string" && msg.length > 0) return msg;
    }
    if (err.response?.status === 404) {
      return "API ຍັງເປັນເວີຊັນເກົ່າ (ບໍ່ມີອັບໂຫຼດຮູບ) — ກະລຸນາ rebuild lao-rice-api: docker compose up -d --build";
    }
    if (err.response?.status === 401) {
      return "JWT ໝົດອາຍຸ ຫຼື ບໍ່ຖືກຕ້ອງ — ເຂົ້າສູ່ລະບົບແອັດມິນໃໝ່ທີ່ /admin/login";
    }
    if (!err.response) {
      const base = getApiBaseUrl();
      if (!base) {
        return "ບໍ່ພົບ NEXT_PUBLIC_API_URL — ກວດ .env.local";
      }
      return `ເຊື່ອມ API ບໍ່ໄດ້ (${base}) — ກວດວ່າ lao-rice-api ເປີດຢູ່`;
    }
  }
  return fallback;
}

/** Customer login — POST /auth/login */
export async function apiLogin(body: {
  username: string;
  password: string;
}): Promise<ApiLoginResponse> {
  const { data } = await publicClient.post<ApiLoginResponse>(
    "/auth/login",
    body
  );
  const access_token = readAccessToken(data);
  if (!access_token) {
    throw new Error("API ບໍ່ສົ່ງ access_token");
  }
  return { ...(data as ApiLoginResponse), access_token };
}

/** POST /auth/otp/send — request OTP for phone login */
export async function apiSendOtp(phone: string): Promise<ApiOtpSendResponse> {
  try {
    const { data } = await publicClient.post<ApiOtpSendResponse>(
      "/auth/otp/send",
      { phone }
    );
    return data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "ສົ່ງ OTP ບໍ່ສຳເລັດ"));
  }
}

/** POST /auth/otp/verify — verify OTP and receive JWT */
export async function apiVerifyOtp(body: {
  phone: string;
  code: string;
}): Promise<ApiLoginResponse> {
  try {
    const { data } = await publicClient.post<ApiLoginResponse>(
      "/auth/otp/verify",
      body
    );
    const access_token = readAccessToken(data);
    if (!access_token) {
      throw new Error("API ບໍ່ສົ່ງ access_token");
    }
    return { ...(data as ApiLoginResponse), access_token };
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "ລະຫັດ OTP ບໍ່ຖືກຕ້ອງ"));
  }
}

/** Admin login — POST /auth/admin/login */
export async function apiAdminLogin(body: {
  username: string;
  password: string;
}): Promise<ApiAdminLoginResponse> {
  const { data } = await publicClient.post<ApiAdminLoginResponse>(
    "/auth/admin/login",
    body
  );
  const access_token = readAccessToken(data);
  if (!access_token) {
    throw new Error("API ບໍ່ສົ່ງ access_token");
  }
  return { ...(data as ApiAdminLoginResponse), access_token };
}

/** Current user (client JWT) */
export async function apiMe(): Promise<ApiUser> {
  const { data } = await userClient.get<ApiUser>("/auth/me");
  return data;
}

/** PUT /auth/me/profile — save default shipping for checkout prefill */
export async function apiUpdateCustomerProfile(
  body: UpdateCustomerProfileBody
): Promise<ApiUser> {
  try {
    const { data } = await userClient.put<ApiUser>("/auth/me/profile", body);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      try {
        const { data } = await userClient.post<ApiUser>(
          "/auth/me/profile",
          body
        );
        return data;
      } catch (postErr) {
        throw profileEndpointError(postErr);
      }
    }
    throw profileEndpointError(err);
  }
}

function profileEndpointError(err: unknown): Error {
  if (axios.isAxiosError(err) && err.response?.status === 404) {
    return new Error(
      "API ຍັງບໍ່ມີຟັງຊັນບັນທຶກທີ່ຢູ່ (404) — ກະລຸນາ restart backend ດ້ວຍ code ລ່າສຸດ: docker compose up -d --build"
    );
  }
  if (axios.isAxiosError(err)) {
    const msg =
      typeof err.response?.data === "object" &&
      err.response.data !== null &&
      "error" in err.response.data
        ? String((err.response.data as { error: string }).error)
        : err.message;
    return new Error(msg || "ບັນທຶກບໍ່ສຳເລັດ");
  }
  return err instanceof Error ? err : new Error("ບັນທຶກບໍ່ສຳເລັດ");
}

/** Current admin (admin JWT) — GET /auth/admin/me */
export async function apiMeAdmin(): Promise<ApiUser> {
  const { data } = await adminClient.get<ApiUser>("/auth/admin/me");
  return data;
}

export interface ApiProductListResult {
  items: ApiProduct[];
  total: number;
}

/** GET /products — supports q, search, category_id, limit, offset */
export async function apiListProducts(
  params?: ApiProductListParams
): Promise<ApiProductListResult> {
  const query: Record<string, string | number> = {};
  if (params?.limit != null) query.limit = params.limit;
  if (params?.offset != null) query.offset = params.offset;
  if (params?.category_id != null) query.category_id = params.category_id;

  const searchText = (params?.q ?? params?.search ?? "").trim();
  if (searchText) query.q = searchText;

  const { data } = await publicClient.get<
    ApiProductListResponse | ApiProduct[]
  >("/products", { params: query });

  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  const items = data.items ?? [];
  const total =
    typeof data.total === "number" ? data.total : items.length;
  return { items, total };
}

export async function apiGetProduct(id: number | string): Promise<ApiProduct> {
  const { data } = await publicClient.get<ApiProduct>(`/products/${id}`);
  return data;
}

export async function apiCreateProduct(
  body: ApiCreateProductBody
): Promise<ApiProduct> {
  const { data } = await adminClient.post<ApiProduct>("/products", body);
  return data;
}

export async function apiUpdateProduct(
  id: number | string,
  body: ApiUpdateProductBody
): Promise<ApiProduct> {
  const { data } = await adminClient.put<ApiProduct>(`/products/${id}`, body);
  return data;
}

export async function apiDeleteProduct(id: number | string): Promise<void> {
  await adminClient.delete(`/products/${id}`);
}

export type ApiUploadProductImageResponse = {
  image_url: string;
};

/** Admin JWT — POST /products/upload-image (multipart field: image) */
export async function apiUploadProductImage(file: File): Promise<string> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("ບໍ່ພົບ NEXT_PUBLIC_API_URL — ກວດ .env.local");
  }
  if (!getStoredAdminAccessToken()) {
    throw new Error("ບໍ່ມີ JWT ແອັດມິນ — ໄປ /admin/login");
  }

  const form = new FormData();
  form.append("image", file, file.name);

  try {
    const token = getStoredAdminAccessToken();
    const { data } = await axios.post<ApiUploadProductImageResponse>(
      `${base}/products/upload-image`,
      form,
      {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: 60_000,
      }
    );
    const url = data.image_url?.trim();
    if (!url) {
      throw new Error("API ບໍ່ສົ່ງ image_url");
    }
    return url;
  } catch (err) {
    throw new Error(
      getApiErrorMessage(err, "ອັບໂຫຼດຮູບບໍ່ສຳເລັດ")
    );
  }
}

/** Public — GET /categories */
export async function apiListCategories(params?: {
  roots_only?: boolean;
  parent_id?: number;
}): Promise<ApiCategory[]> {
  const { data } = await publicClient.get<
    ApiCategoryListResponse | ApiCategory[]
  >("/categories", { params });
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

/** Public — GET /categories/:id */
export async function apiGetCategory(id: number): Promise<ApiCategory> {
  const { data } = await publicClient.get<ApiCategory>(`/categories/${id}`);
  return data;
}

/** Admin JWT — POST /categories */
export async function apiCreateCategory(
  body: ApiCreateCategoryBody
): Promise<ApiCategory> {
  const { data } = await adminClient.post<ApiCategory>("/categories", body);
  return data;
}

/** Admin JWT — PUT /categories/:id */
export async function apiUpdateCategory(
  id: number,
  body: ApiUpdateCategoryBody
): Promise<ApiCategory> {
  const { data } = await adminClient.put<ApiCategory>(
    `/categories/${id}`,
    body
  );
  return data;
}

/** Admin JWT — DELETE /categories/:id */
export async function apiDeleteCategory(id: number): Promise<void> {
  await adminClient.delete(`/categories/${id}`);
}

/** Public — GET /orders/shipping-config */
export async function apiGetShippingConfig(): Promise<ApiShippingConfig> {
  const { data } = await publicClient.get<ApiShippingConfig>(
    "/orders/shipping-config"
  );
  return data;
}

/** Public — GET /orders/shipping-quote?subtotal_lak= */
export async function apiGetShippingQuote(
  subtotalLak: number,
  coords?: { latitude: number; longitude: number }
): Promise<ApiShippingQuote> {
  const params: Record<string, string | number> = {
    subtotal_lak: Math.round(subtotalLak),
  };
  if (coords) {
    params.latitude = coords.latitude;
    params.longitude = coords.longitude;
  }
  const { data } = await publicClient.get<ApiShippingQuote>(
    "/orders/shipping-quote",
    { params }
  );
  return data;
}

/**
 * Admin panel — GET /orders with admin JWT (Bearer).
 * Backend returns all orders when JWT role is admin.
 */
export async function apiAdminListOrders(params?: {
  limit?: number;
  offset?: number;
}): Promise<ApiOrder[]> {
  if (!getStoredAdminAccessToken()) {
    throw new Error("missing admin bearer token");
  }
  const { data } = await adminClient.get<unknown>("/orders", {
    params: {
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    },
  });
  return unwrapOrderList(data);
}

/** Customer account — GET /orders/mine (JWT, own orders by user_id). */
export async function apiListMyOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiOrdersByPhoneResponse> {
  if (!getStoredAccessToken()) {
    throw new Error("missing bearer token");
  }
  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.min(
    Math.max(1, params?.limit ?? ORDERS_BY_PHONE_PAGE_SIZE),
    50
  );
  const { data } = await userClient.get<unknown>("/orders/mine", {
    params: { page, limit },
  });
  return parseOrdersByPhoneResponse(data, page, limit);
}

/**
 * Customer orders for web account — matches mobile app (GET /ordersbyphone by phone).
 * Falls back to GET /orders/mine when phone is unavailable.
 */
export async function apiListCustomerOrders(params: {
  phone: string;
  page?: number;
  limit?: number;
}): Promise<ApiOrdersByPhoneResponse> {
  const phone = params.phone.trim();
  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.min(
    Math.max(1, params?.limit ?? ORDERS_BY_PHONE_PAGE_SIZE),
    50
  );

  if (phone) {
    return apiLookupOrdersByPhone(phone, { page, limit });
  }

  return apiListMyOrders({ page, limit });
}

/** @deprecated Use [apiListMyOrders] — kept for callers expecting a flat list. */
export async function apiListOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiOrder[]> {
  const res = await apiListMyOrders(params);
  return res.items;
}

/** Public — GET /ordersbyphone?phone=&page=&limit= (ບໍ່ຕ້ອງ Bearer token) */
export async function apiLookupOrdersByPhone(
  phone: string,
  params?: { page?: number; limit?: number }
): Promise<ApiOrdersByPhoneResponse> {
  const trimmed = phone.trim();
  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.min(
    Math.max(1, params?.limit ?? ORDERS_BY_PHONE_PAGE_SIZE),
    50
  );

  if (!trimmed) {
    return {
      items: [],
      page,
      limit,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    };
  }

  const { data } = await publicClient.get<unknown>("/ordersbyphone", {
    params: { phone: trimmed, page, limit },
  });
  return parseOrdersByPhoneResponse(data, page, limit);
}

/** Bearer JWT (admin or customer) — GET /orders/:id */
export async function apiGetOrder(id: number | string): Promise<ApiOrder> {
  const { data } = await ordersClient.get<ApiOrder>(`/orders/${id}`);
  return data;
}

/** Admin JWT — GET /orders/:id/source-links (supplier URLs per line) */
export async function apiGetOrderSourceLinks(
  id: number | string
): Promise<ApiOrderSourceLinksResponse> {
  const { data } = await adminClient.get<ApiOrderSourceLinksResponse>(
    `/orders/${id}/source-links`
  );
  return data;
}

/** Admin JWT — PUT /orders/:id/status */
export async function apiUpdateOrderStatus(
  id: number | string,
  status: ApiOrderStatus
): Promise<ApiOrder> {
  const body: ApiUpdateOrderStatusBody = { status };
  const { data } = await adminClient.put<ApiOrder>(
    `/orders/${id}/status`,
    body
  );
  return data;
}

/** Authenticated — POST /orders (requires phone OTP login) */
export async function apiCreateOrder(
  body: ApiCreateOrderBody
): Promise<ApiOrder> {
  const { data } = await userClient.post<ApiOrder>("/orders", body);
  return data;
}

export type ApiCreateOrderMultipartInput = {
  items: ApiCreateOrderBody["items"];
  shipping: ApiCreateOrderBody["shipping"];
  payment_method: ApiCreateOrderBody["payment_method"];
  payment_receipt: File;
};

/** Authenticated — POST /orders as multipart (BCEL QR + payment_receipt file). */
export async function apiCreateOrderMultipart(
  input: ApiCreateOrderMultipartInput
): Promise<ApiOrder> {
  const form = new FormData();
  form.append("payment_method", input.payment_method);
  form.append("items", JSON.stringify(input.items));
  form.append("shipping", JSON.stringify(input.shipping));
  form.append("payment_receipt", input.payment_receipt, input.payment_receipt.name);

  const token = getStoredAccessToken();
  const { data } = await axios.post<ApiOrder>(
    `${getApiBaseUrl()}/orders`,
    form,
    {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 60_000,
    }
  );
  return data;
}

/** Public — GET /exchange-rate */
export async function apiGetExchangeRate(): Promise<ApiExchangeRate> {
  const { data } = await publicClient.get<ApiExchangeRate>("/exchange-rate");
  return data;
}

/** Admin JWT — PUT /exchange-rate (recalculates all product prices on backend) */
export async function apiUpdateExchangeRate(
  body: ApiUpdateExchangeRateBody
): Promise<ApiUpdateExchangeRateResponse> {
  const { data } = await adminClient.put<ApiUpdateExchangeRateResponse>(
    "/exchange-rate",
    body
  );
  return data;
}

function unwrapBannerList(payload: unknown): ApiBanner[] {
  if (Array.isArray(payload)) return payload as ApiBanner[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as ApiBannerListResponse;
  return record.items ?? [];
}

/** Public — GET /banners (is_active=true only) */
export async function apiListPublicBanners(): Promise<ApiBanner[]> {
  const { data } = await publicClient.get<unknown>("/banners");
  return unwrapBannerList(data);
}

/** Public — GET /banners/:id (active only) */
export async function apiGetPublicBanner(
  id: number | string
): Promise<ApiBanner> {
  const { data } = await publicClient.get<ApiBanner>(`/banners/${id}`);
  return data;
}

/** Admin — GET /banners?include_inactive=true */
export async function apiAdminListBanners(): Promise<ApiBanner[]> {
  const { data } = await adminClient.get<unknown>("/banners", {
    params: { include_inactive: true },
  });
  return unwrapBannerList(data);
}

/** Admin — GET /banners/:id */
export async function apiAdminGetBanner(
  id: number | string
): Promise<ApiBanner> {
  const { data } = await adminClient.get<ApiBanner>(`/banners/${id}`);
  return data;
}

/** Admin — POST /banners */
export async function apiCreateBanner(
  body: ApiCreateBannerBody
): Promise<ApiBanner> {
  const { data } = await adminClient.post<ApiBanner>("/banners", body);
  return data;
}

/** Admin — PUT /banners/:id */
export async function apiUpdateBanner(
  id: number | string,
  body: ApiUpdateBannerBody
): Promise<ApiBanner> {
  const { data } = await adminClient.put<ApiBanner>(`/banners/${id}`, body);
  return data;
}

/** Admin — DELETE /banners/:id */
export async function apiDeleteBanner(id: number | string): Promise<void> {
  await adminClient.delete(`/banners/${id}`);
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}
