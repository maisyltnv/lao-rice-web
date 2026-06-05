"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import type { ApiCategory } from "@/lib/api-types";
import {
  apiListCategories,
  apiListProducts,
  getApiBaseUrl,
  isApiConfigured,
} from "@/lib/api";
import { apiProductToStoreProduct } from "@/lib/map-api-product";
import { riceImageForProduct } from "@/lib/rice-images";

export interface Product {
  id: string;
  name: string;
  nameLao: string;
  description: string;
  descriptionLao: string;
  howToUse: string;
  howToUseLao: string;
  priceCNY: number;
  priceLAK: number;
  marginPercent: number;
  images: string[];
  category: string;
  categoryLao: string;
  stock: number;
  sourceUrl: string;
  trustBadges: string[];
  isNew: boolean;
  isBestSeller: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  /** Numeric id from API (for detail / status updates later) */
  apiId?: number;
  items: CartItem[];
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    province: string;
    latitude?: number;
    longitude?: number;
  };
  paymentMethod: string;
  /** URL ຮູບຫຼັກຖານການຊຳລະ (ຈາກ API payment_receipt_url) */
  paymentReceiptUrl?: string | null;
  status: "pending" | "processing" | "shipped" | "delivered";
  subtotalLAK?: number;
  shippingFeeLAK?: number;
  totalLAK: number;
  createdAt: Date;
}

interface StoreContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Products
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  setProducts: (products: Product[]) => void;
  refreshProducts: () => Promise<void>;

  // Categories (public API)
  categories: ApiCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  refreshCategories: () => Promise<void>;
  
  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Omit<Order, "id" | "createdAt"> & { id?: string }) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

/** ຂໍ້ມູນຕົວຢ່າງເມື່ອ API ບໍ່ເຊື່ອມ — ສອດຄ່ອງຮ້ານເຂົ້າສານ */
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Jasmine Rice 25kg",
    nameLao: "ເຂົ້າຈ້າວມະລິ",
    description: "Long-grain jasmine rice, 25 kg bag. Fragrant and suitable for daily meals.",
    descriptionLao:
      "ເຂົ້າຈ້າວມະລິຄຸນນະພາບດີ ຖົງ 25 ກິໂລ. ຫອມ ນຸ່ມ ເໝາະກັບຄົວປຸງປິງປະຈຳວັນ.",
    howToUse: "Store in a cool, dry place. Seal the bag after opening.",
    howToUseLao: "ເກັບໃນບ່ອນແຫ້ງ ປ້ອງກັນແມງໄມ້. ປິດຖົງໃຫ້ສົນຫຼັງເປີດແລ້ວ.",
    priceCNY: 95,
    priceLAK: 332_500,
    marginPercent: 40,
    images: [riceImageForProduct("ເຂົ້າຈ້າວມະລິ")],
    category: "khao-jao",
    categoryLao: "ເຂົ້າຈ້າວ",
    stock: 40,
    sourceUrl: "",
    trustBadges: ["ຄຸນນະພາບດີ", "ສົ່ງໃນວຽງຈັນ"],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "2",
    name: "Sticky Rice 25kg",
    nameLao: "ເຂົ້ານາແຊງ",
    description: "Glutinous sticky rice for traditional Lao meals and ceremonies.",
    descriptionLao: "ເຂົ້າໜຽວນາແຊງ ຖົງ 25 ກິໂລ. ເໝາະກັບຕົ້ມເຂົ້າໜຽວ ແລະ ພິທີ.",
    howToUse: "Soak before steaming. Keep sealed when stored.",
    howToUseLao: "ແຊ່ນ້ຳກ່ອນຫຸງ. ເກັບຖົງໃຫ້ສົນໃນບ່ອນແຫ້ງ.",
    priceCNY: 72,
    priceLAK: 252_000,
    marginPercent: 45,
    images: [riceImageForProduct("ເຂົ້ານາແຊງ")],
    category: "khao-niew",
    categoryLao: "ເຂົ້າໜຽວ",
    stock: 35,
    sourceUrl: "",
    trustBadges: ["ເຂົ້າໜຽວແທ້", "ສົ່ງໃນວຽງຈັນ"],
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "3",
    name: "Kai Noi Rice 25kg",
    nameLao: "ເຂົ້າໄກ່ນ້ອຍ",
    description: "Short-grain Kai Noi rice with a soft texture and natural aroma.",
    descriptionLao: "ເຂົ້າໄກ່ນ້ອຍ ຖົງ 25 ກິໂລ. ເມັດສັ້ນ ນຸ່ມ ຫອມທຳມະຊາດ.",
    howToUse: "Rinse lightly before cooking. Store dry and away from pests.",
    howToUseLao: "ລ້າງເບົາໆກ່ອນຫຸງ. ເກັບໃບ່ອນແຫ້ງ ຫ່າງແມງໄມ້.",
    priceCNY: 88,
    priceLAK: 308_000,
    marginPercent: 42,
    images: [riceImageForProduct("ເຂົ້າໄກ່ນ້ອຍ")],
    category: "khao-jao",
    categoryLao: "ເຂົ້າຈ້າວ",
    stock: 28,
    sourceUrl: "",
    trustBadges: ["ຄຸນນະພາບດີ", "ຂາຍດີ"],
    isNew: true,
    isBestSeller: false,
  },
  {
    id: "4",
    name: "Harvest Season Rice 25kg",
    nameLao: "ເຂົ້ານາປີ",
    description: "Fresh harvest-season rice, ideal for families and small shops.",
    descriptionLao: "ເຂົ້ານາປີສົດໃໝ່ ຖົງ 25 ກິໂລ. ເໝາະກັບຄອບຄົວ ແລະ ຮ້ານຂາຍຍ່ອຍ.",
    howToUse: "Use within 6 months of purchase for best quality.",
    howToUseLao: "ໃຊ້ພາຍໃນ 6 ເດືອນຫຼັງຊື້ ເພື່ອຄຸນນະພາບດີທີ່ສຸດ.",
    priceCNY: 78,
    priceLAK: 273_000,
    marginPercent: 38,
    images: [riceImageForProduct("ເຂົ້ານາປີ")],
    category: "khao-jao",
    categoryLao: "ເຂົ້າຈ້າວ",
    stock: 50,
    sourceUrl: "",
    trustBadges: ["ນາປີ", "ສົ່ງໃນວຽງຈັນ"],
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "5",
    name: "Premium White Rice 25kg",
    nameLao: "ເຂົ້າເຈົ້າໄຮ່",
    description: "Polished white rice with consistent grain size.",
    descriptionLao: "ເຂົ້າເຈົ້າໄຮ່ຂາວສະອາດ ຖົງ 25 ກິໂລ. ເມັດສະໝໍ່າສະເໝີ.",
    howToUse: "Keep bag closed. Avoid humid storage areas.",
    howToUseLao: "ປິດຖົງໃຫ້ສົນ. ຫຼີກລ່ຽງບ່ອນຊຸ່ນແຊ່.",
    priceCNY: 82,
    priceLAK: 287_000,
    marginPercent: 40,
    images: [riceImageForProduct("ເຂົ້າເຈົ້າໄຮ່")],
    category: "khao-jao",
    categoryLao: "ເຂົ້າຈ້າວ",
    stock: 22,
    sourceUrl: "",
    trustBadges: ["ຄຸນນະພາບດີ"],
    isNew: false,
    isBestSeller: false,
  },
];

function apiConnectionErrorMessage(): string {
  const base = getApiBaseUrl();
  if (!base) {
    return "ບໍ່ພົບ NEXT_PUBLIC_API_URL — ຕັ້ງໃນ .env.production ແລ້ວ build/deploy ໃໝ່";
  }
  if (/localhost|127\.0\.0\.1/i.test(base)) {
    return `API ຊີ້ ${base} — browser ບໍ່ເຂົ້າເຖິງ VPS. ຕັ້ງ NEXT_PUBLIC_API_URL=http://IP_VPS:8081 ແລ້ວ bash deploy/deploy.sh`;
  }
  return `ເຊື່ອມ API ບໍ່ໄດ້ (${base}) — ກວດ lao-rice-api ແລະ ufw allow 8081`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshCategories = useCallback(async () => {
    if (!isApiConfigured()) {
      setCategories([]);
      setCategoriesError(null);
      setCategoriesLoading(false);
      return;
    }

    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      let list = await apiListCategories({ roots_only: true });
      if (list.length === 0) {
        list = await apiListCategories();
      }
      setCategories(list.filter((c) => c.is_active !== false));
    } catch {
      setCategories([]);
      setCategoriesError("ໂຫຼດໝວດໝູ່ບໍ່ສຳເລັດ");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    if (!isApiConfigured()) {
      setProducts(mockProducts);
      setProductsError(apiConnectionErrorMessage());
      setProductsLoading(false);
      return;
    }

    setProductsLoading(true);
    setProductsError(null);
    try {
      const { items } = await apiListProducts({ limit: 200, offset: 0 });
      if (items.length === 0) {
        setProducts([]);
      } else {
        setProducts(items.map(apiProductToStoreProduct));
      }
    } catch {
      setProducts(mockProducts);
      setProductsError(
        `${apiConnectionErrorMessage()} — ສະແດງຂໍ້ມູນຕົວຢ່າງ`
      );
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCategories();
    void refreshProducts();
  }, [refreshCategories, refreshProducts]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.priceLAK * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addOrder = useCallback((order: Omit<Order, "id" | "createdAt"> & { id?: string }) => {
    const { id: clientId, ...rest } = order;
    const newOrder: Order = {
      ...rest,
      id: clientId ?? `ORD-${Date.now()}`,
      createdAt: new Date(),
    };
    setOrders((prev) => [newOrder, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        products,
        productsLoading,
        productsError,
        setProducts,
        refreshProducts,
        categories,
        categoriesLoading,
        categoriesError,
        refreshCategories,
        orders,
        setOrders,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
