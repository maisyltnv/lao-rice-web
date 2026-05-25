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
  apiGetExchangeRate,
  apiListCategories,
  apiListProducts,
  isApiConfigured,
} from "@/lib/api";
import { apiProductToStoreProduct } from "@/lib/map-api-product";

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
  
  // Exchange Rate
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  refreshExchangeRate: () => Promise<void>;
  
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

// Mock products data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Collagen Peptide Powder",
    nameLao: "ຜົງຄໍລາເຈນເປັບໄທດ໌",
    description: "Premium marine collagen peptide powder for skin, hair, and nail health. Imported directly from Japan.",
    descriptionLao: "ຜົງຄໍລາເຈນເປັບໄທດ໌ຈາກທະເລຄຸນນະພາບສູງ ສຳລັບສຸຂະພາບຜິວໜັງ, ຜົມ ແລະ ເລັບ. ນຳເຂົ້າໂດຍກົງຈາກຍີ່ປຸ່ນ.",
    howToUse: "Mix 1-2 scoops with water or beverage. Take daily.",
    howToUseLao: "ປະສົມ 1-2 ບ່ວງກັບນ້ຳ ຫຼື ເຄື່ອງດື່ມ. ດື່ມທຸກມື້.",
    priceCNY: 128,
    priceLAK: 450000,
    marginPercent: 50,
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
    ],
    category: "Supplements",
    categoryLao: "ອາຫານເສີມ",
    stock: 25,
    sourceUrl: "https://1688.com/product/123",
    trustBadges: ["ຂອງແທ້ 100%", "ນຳເຂົ້າໂດຍກົງ"],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "2",
    name: "Vitamin C Serum",
    nameLao: "ເຊລັ່ມວິຕາມິນ C",
    description: "High-potency 20% Vitamin C serum with hyaluronic acid for brighter, more youthful skin.",
    descriptionLao: "ເຊລັ່ມວິຕາມິນ C 20% ເຂັ້ມຂຸ້ນສູງ ຜະສົມກັບກົດໄຮຍາລູໂຣນິກ ເພື່ອຜິວໜັງທີ່ສົດໃສ ແລະ ອ່ອນກວ່າໄວ.",
    howToUse: "Apply 3-4 drops to clean face morning and night.",
    howToUseLao: "ທາ 3-4 ຢອດໃສ່ໜ້າສະອາດ ເຊົ້າ ແລະ ແລງ.",
    priceCNY: 68,
    priceLAK: 280000,
    marginPercent: 60,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=600&fit=crop",
    ],
    category: "Skincare",
    categoryLao: "ດູແລຜິວໜັງ",
    stock: 42,
    sourceUrl: "https://taobao.com/item/456",
    trustBadges: ["ຂອງແທ້ 100%", "ຄຸນນະພາບສູງ"],
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "3",
    name: "Glutathione Whitening Pills",
    nameLao: "ຢາກູຕາໄທໂອນຂາວໃສ",
    description: "Premium glutathione supplement for skin whitening and antioxidant protection.",
    descriptionLao: "ອາຫານເສີມກູຕາໄທໂອນຄຸນນະພາບສູງ ສຳລັບຜິວຂາວ ແລະ ປ້ອງກັນສານຕ້ານອະນຸມູນອິດສະຫຼະ.",
    howToUse: "Take 2 capsules daily with meals.",
    howToUseLao: "ກິນ 2 ເມັດຕໍ່ມື້ພ້ອມອາຫານ.",
    priceCNY: 158,
    priceLAK: 550000,
    marginPercent: 55,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop",
    ],
    category: "Supplements",
    categoryLao: "ອາຫານເສີມ",
    stock: 18,
    sourceUrl: "https://1688.com/product/789",
    trustBadges: ["ຂອງແທ້ 100%", "ນຳເຂົ້າໂດຍກົງ", "ຢາຍອດນິຍົມ"],
    isNew: true,
    isBestSeller: false,
  },
  {
    id: "4",
    name: "Retinol Anti-Aging Cream",
    nameLao: "ຄຣີມເຣຕິນອລຕ້ານຄວາມແກ່",
    description: "Advanced retinol formula to reduce wrinkles and fine lines. Suitable for all skin types.",
    descriptionLao: "ສູດເຣຕິນອລຂັ້ນສູງ ເພື່ອຫຼຸດຜ່ອນຮີ້ວຫຽນ. ເໝາະສຳລັບທຸກປະເພດຜິວໜັງ.",
    howToUse: "Apply at night to clean, dry skin. Use sunscreen during the day.",
    howToUseLao: "ທາຕອນກາງຄືນໃສ່ຜິວສະອາດ ແລະ ແຫ້ງ. ໃຊ້ຄຣີມກັນແດດໃນຕອນກາງເວັນ.",
    priceCNY: 88,
    priceLAK: 350000,
    marginPercent: 50,
    images: [
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=600&h=600&fit=crop",
    ],
    category: "Skincare",
    categoryLao: "ດູແລຜິວໜັງ",
    stock: 30,
    sourceUrl: "https://taobao.com/item/101",
    trustBadges: ["ຂອງແທ້ 100%", "ຄຸນນະພາບສູງ"],
    isNew: false,
    isBestSeller: false,
  },
  {
    id: "5",
    name: "Multivitamin Complex",
    nameLao: "ວິຕາມິນລວມ",
    description: "Complete daily multivitamin with essential vitamins and minerals for overall health.",
    descriptionLao: "ວິຕາມິນປະຈຳວັນທີ່ສົມບູນ ມີວິຕາມິນ ແລະ ແຮ່ທາດທີ່ຈຳເປັນສຳລັບສຸຂະພາບໂດຍລວມ.",
    howToUse: "Take 1 tablet daily with breakfast.",
    howToUseLao: "ກິນ 1 ເມັດຕໍ່ມື້ພ້ອມອາຫານເຊົ້າ.",
    priceCNY: 45,
    priceLAK: 180000,
    marginPercent: 60,
    images: [
      "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&h=600&fit=crop",
    ],
    category: "Vitamins",
    categoryLao: "ວິຕາມິນ",
    stock: 60,
    sourceUrl: "https://1688.com/product/202",
    trustBadges: ["ຂອງແທ້ 100%"],
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "6",
    name: "Hyaluronic Acid Face Mask",
    nameLao: "ແຜ່ນມາສໄຮຍາລູໂຣນິກ",
    description: "Intensive hydrating face mask with triple hyaluronic acid complex.",
    descriptionLao: "ແຜ່ນມາສໜ້າໃຫ້ຄວາມຊຸ່ມຊື່ນເຂັ້ມຂຸ້ນ ປະກອບດ້ວຍກົດໄຮຍາລູໂຣນິກສາມຊະນິດ.",
    howToUse: "Apply to clean face for 15-20 minutes. Use 2-3 times per week.",
    howToUseLao: "ທາໃສ່ໜ້າສະອາດ 15-20 ນາທີ. ໃຊ້ 2-3 ເທື່ອຕໍ່ອາທິດ.",
    priceCNY: 35,
    priceLAK: 140000,
    marginPercent: 65,
    images: [
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=600&fit=crop",
    ],
    category: "Skincare",
    categoryLao: "ດູແລຜິວໜັງ",
    stock: 80,
    sourceUrl: "https://taobao.com/item/303",
    trustBadges: ["ຂອງແທ້ 100%", "ນຳເຂົ້າໂດຍກົງ"],
    isNew: true,
    isBestSeller: false,
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [exchangeRate, setExchangeRate] = useState(3500); // CNY to LAK
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshExchangeRate = useCallback(async () => {
    if (!isApiConfigured()) return;
    try {
      const data = await apiGetExchangeRate();
      if (
        typeof data.rate_lak_per_cny === "number" &&
        data.rate_lak_per_cny > 0
      ) {
        setExchangeRate(data.rate_lak_per_cny);
      }
    } catch {
      /* keep current rate */
    }
  }, []);

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
      setProductsError(
        "ບໍ່ພົບ NEXT_PUBLIC_API_URL — ສະແດງຂໍ້ມູນຕົວຢ່າງ. ໃສ່ URL API ໃນໄຟລ໌ .env"
      );
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
        const rate = items[0]?.exchange_rate;
        if (typeof rate === "number" && rate > 0) {
          setExchangeRate(rate);
        }
      }
    } catch {
      setProducts(mockProducts);
      setProductsError(
        "ເຊື່ອມ API ບໍ່ສຳເລັດ — ສະແດງຂໍ້ມູນຕົວຢ່າງ. ກວດ Docker ແລະ URL ວ່າເປີດ http://localhost:8080 ຫຼືບໍ່"
      );
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshExchangeRate();
    void refreshCategories();
    void refreshProducts();
  }, [refreshExchangeRate, refreshCategories, refreshProducts]);

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
        exchangeRate,
        setExchangeRate,
        refreshExchangeRate,
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
