"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  X,
  Upload,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore, Product } from "@/lib/store";
import { formatLAK, calculateSellingPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import {
  apiCreateProduct,
  apiDeleteProduct,
  apiGetProduct,
  apiListCategories,
  apiListProducts,
  apiUpdateProduct,
  apiUploadProductImage,
  isApiConfigured,
} from "@/lib/api";
import {
  ProductImageField,
  type ProductImageUploadValue,
} from "@/components/admin/product-image-field";
import {
  imageSourceModeForUrl,
  type ProductImageSourceMode,
} from "@/lib/product-upload-image";
import { apiProductToStoreProduct } from "@/lib/map-api-product";
import type { ApiCategory } from "@/lib/api-types";
import {
  marginPercentToRatio,
  profitMarginToPercent,
} from "@/lib/map-api-product";
import {
  IMAGE_VIEWER_PAGE_WARNING,
  PRODUCT_PLACEHOLDER_IMAGE,
  isImageViewerPageUrl,
} from "@/lib/product-image";
import { ProductImage } from "@/components/products/product-image";

export default function AdminProductsPage() {
  const { products, setProducts, exchangeRate, refreshProducts } = useStore();
  const { adminToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loadingEditProduct, setLoadingEditProduct] = useState(false);
  const [saveMessage, setSaveMessage] = useState("ເພີ່ມສິນຄ້າສຳເລັດ!");

  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    nameLao: "",
    description: "",
    descriptionLao: "",
    howToUse: "",
    howToUseLao: "",
    costLAK: "",
    marginPercent: "50",
    /** ຄ່າເລືອກ = ApiCategory.id (string) */
    category: "",
    stock: "50",
    imageUrl: "",
  });
  const [imageSourceMode, setImageSourceMode] =
    useState<ProductImageSourceMode>("link");
  const [imageUpload, setImageUpload] = useState<ProductImageUploadValue | null>(
    null
  );

  const clearImageUpload = () => {
    if (imageUpload?.previewUrl) URL.revokeObjectURL(imageUpload.previewUrl);
    setImageUpload(null);
  };

  const resetImageFields = (url = "") => {
    clearImageUpload();
    setImageSourceMode(imageSourceModeForUrl(url));
  };

  const rate = typeof exchangeRate === "number" && exchangeRate > 0 ? exchangeRate : 3500;

  const parseLak = (value: string): number => {
    const raw = value.replace(/[,\s₭]/g, "").trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  };

  const costLakToCny = (costLak: number): number => {
    if (!Number.isFinite(costLak) || costLak <= 0) return NaN;
    return costLak / rate;
  };

  const sellingLakFromCostLak = (costLak: number, marginPercent: number): number => {
    if (!Number.isFinite(costLak) || !Number.isFinite(marginPercent)) return 0;
    return Math.round(costLak * (1 + marginPercent / 100));
  };

  const loadCategories = useCallback(async () => {
    if (!isApiConfigured()) {
      setApiCategories([]);
      setCategoriesError("ບໍ່ມີ NEXT_PUBLIC_API_URL");
      return;
    }
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      let list = await apiListCategories({ roots_only: true });
      if (list.length === 0) {
        list = await apiListCategories();
      }
      const active = list.filter((c) => c.is_active !== false);
      setApiCategories(active);
      setNewProduct((prev) => {
        if (active.some((c) => String(c.id) === prev.category)) return prev;
        return {
          ...prev,
          category: active[0] ? String(active[0].id) : "",
        };
      });
    } catch {
      setCategoriesError("ໂຫຼດໝວດໝູ່ບໍ່ສຳເລັດ");
      setApiCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const getDefaultCategory = () =>
    apiCategories[0] ? String(apiCategories[0].id) : "";

  const closeModal = () => {
    clearImageUpload();
    setIsModalOpen(false);
    setEditingProductId(null);
    setLoadingEditProduct(false);
  };

  const openCreateModal = () => {
    setApiError(null);
    setEditingProductId(null);
    setSaveMessage("ເພີ່ມສິນຄ້າສຳເລັດ!");
    setNewProduct({
      name: "",
      nameLao: "",
      description: "",
      descriptionLao: "",
      howToUse: "",
      howToUseLao: "",
      costLAK: "",
      marginPercent: "50",
      category: getDefaultCategory(),
      stock: "50",
      imageUrl: "",
    });
    resetImageFields();
    setIsModalOpen(true);
  };

  const openEditModal = async (product: Product) => {
    setApiError(null);
    setEditingProductId(product.id);
    setSaveMessage("ອັບເດດສິນຄ້າສຳເລັດ!");
    setIsModalOpen(true);

    const fillFromStore = () => {
      const cat = apiCategories.find(
        (c) => c.slug === product.category || c.name === product.categoryLao
      );
      setNewProduct({
        name: product.name,
        nameLao: product.nameLao,
        description: product.description,
        descriptionLao: product.descriptionLao,
        howToUse: product.howToUse,
        howToUseLao: product.howToUseLao,
        costLAK: String(Math.round((product.priceCNY || 0) * rate)),
        marginPercent: String(product.marginPercent),
        category: cat
          ? String(cat.id)
          : apiCategories[0]
            ? String(apiCategories[0].id)
            : "",
        stock: String(product.stock),
        imageUrl: product.images[0] ?? "",
      });
      resetImageFields(product.images[0] ?? "");
    };

    if (isApiConfigured() && adminToken && /^\d+$/.test(product.id)) {
      setLoadingEditProduct(true);
      try {
        const api = await apiGetProduct(product.id);
        const cid = api.category_id ?? api.category?.id;
        const marginPct = profitMarginToPercent(api.profit_margin);
        const costLak = Math.round((api.original_price_cny || 0) * rate);
        setNewProduct({
          name: product.name,
          nameLao: api.name,
          description: product.description,
          descriptionLao: api.description ?? "",
          howToUse: product.howToUse,
          howToUseLao: product.howToUseLao,
          costLAK: String(costLak),
          marginPercent: String(marginPct),
          category: cid != null ? String(cid) : "",
          stock: String(typeof api.stock === "number" ? api.stock : product.stock),
          imageUrl:
            api.image_url?.trim() || product.images[0] || "",
        });
        resetImageFields(api.image_url?.trim() || product.images[0] || "");
      } catch {
        fillFromStore();
        setApiError(
          "ໂຫຼດສິນຄ້າຈາກ API ບໍ່ສຳເລັດ — ສະແດງຂໍ້ມູນຈາກລາຍການ"
        );
      } finally {
        setLoadingEditProduct(false);
      }
      return;
    }

    fillFromStore();
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      setSearchTotal(0);
      setSearchLoading(false);
      return;
    }
    if (!isApiConfigured()) return;

    setSearchLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const { items, total } = await apiListProducts({ q, limit: 100, offset: 0 });
        setSearchResults(items.map(apiProductToStoreProduct));
        setSearchTotal(total);
      } catch {
        setSearchResults([]);
        setSearchTotal(0);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const displayProducts = searchResults ?? products;
  const resultCount = searchResults != null ? searchTotal : products.length;

  const resolveImageUrlForSave = async (): Promise<string | null> => {
    if (imageSourceMode === "link") {
      const trimmed = newProduct.imageUrl.trim();
      if (trimmed && isImageViewerPageUrl(trimmed)) {
        setApiError(IMAGE_VIEWER_PAGE_WARNING);
        return null;
      }
      return trimmed || PRODUCT_PLACEHOLDER_IMAGE;
    }

    if (imageUpload) {
      if (!isApiConfigured() || !adminToken) {
        setApiError(
          "ອັບໂຫຼດຮູບຕ້ອງເຊື່ອມ API ແລະ ເຂົ້າສູ່ລະບົບແອັດມິນ — ໄປ /admin/login"
        );
        return null;
      }
      try {
        return await apiUploadProductImage(imageUpload.file);
      } catch (err) {
        setApiError(
          err instanceof Error
            ? err.message
            : "ອັບໂຫຼດຮູບບໍ່ສຳເລັດ"
        );
        return null;
      }
    }

    const existing = newProduct.imageUrl.trim();
    if (existing) return existing;
    return PRODUCT_PLACEHOLDER_IMAGE;
  };

  const handleSaveProduct = async () => {
    setApiError(null);
    const costLAK = parseLak(newProduct.costLAK);
    const marginPercent = parseFloat(newProduct.marginPercent);
    const stock = parseInt(newProduct.stock, 10);

    if (isNaN(costLAK) || isNaN(marginPercent) || isNaN(stock)) return;
    if (costLAK <= 0) return;
    if (!Number.isFinite(rate) || rate <= 0) return;

    const priceCNY = costLakToCny(costLAK);
    if (isNaN(priceCNY) || priceCNY <= 0) return;

    const selectedCat = apiCategories.find(
      (c) => String(c.id) === newProduct.category
    );
    const storeSlug = selectedCat?.slug ?? "uncategorized";
    const storeNameLao = selectedCat?.name ?? "ສິນຄ້າ";

    const resetForm = () => {
      setNewProduct({
        name: "",
        nameLao: "",
        description: "",
        descriptionLao: "",
        howToUse: "",
        howToUseLao: "",
        costLAK: "",
        marginPercent: "50",
        category: getDefaultCategory(),
        stock: "50",
        imageUrl: "",
      });
      resetImageFields();
    };

    const afterApiSave = () => {
      resetForm();
      closeModal();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };

    const imageUrlForApi = await resolveImageUrlForSave();
    if (imageUrlForApi === null) return;

    if (editingProductId) {
      const finishLocalEdit = () => {
        setProducts(
          products.map((p) =>
            p.id === editingProductId
              ? {
                  ...p,
                  name: newProduct.name,
                  nameLao: newProduct.nameLao,
                  description: newProduct.description,
                  descriptionLao: newProduct.descriptionLao,
                  howToUse: newProduct.howToUse,
                  howToUseLao: newProduct.howToUseLao,
                  priceCNY,
                  marginPercent,
                  priceLAK: sellingLakFromCostLak(costLAK, marginPercent),
                  category: storeSlug,
                  categoryLao: storeNameLao,
                  stock,
                  images: [imageUrlForApi],
                }
              : p
          )
        );
        afterApiSave();
      };

      if (!isApiConfigured() || !adminToken) {
        finishLocalEdit();
        if (isApiConfigured() && !adminToken) {
          setApiError(
            "ບໍ່ມີ JWT — ບັນທຶກແບບທ້ອງຖິ່ນເທົ່ານັ້ນ. ໄປ /admin/login ເພື່ອ sync ກັບ API"
          );
        }
        return;
      }

      if (!/^\d+$/.test(editingProductId)) {
        finishLocalEdit();
        return;
      }

      if (categoriesLoading) {
        setApiError("ກຳລັງໂຫຼດໝວດໝູ່ — ລໍຖ້າຊົ່ວຄາວ");
        return;
      }

      if (apiCategories.length === 0) {
        setApiError(
          "ບໍ່ມີໝວດໝູ່ຈາກ API — ສ້າງໝວດໝູ່ທີ່ /admin/categories ກ່ອນ"
        );
        return;
      }

      if (!selectedCat) {
        setApiError("ເລືອກໝວດໝູ່");
        return;
      }

      setPendingAction(true);
      try {
        await apiUpdateProduct(editingProductId, {
          name: newProduct.nameLao || newProduct.name || "ສິນຄ້າ",
          description:
            newProduct.descriptionLao || newProduct.description || "",
          image_url: imageUrlForApi,
          category_id: selectedCat.id,
          original_price_cny: priceCNY,
          exchange_rate: rate,
          profit_margin: marginPercentToRatio(marginPercent),
          stock,
        });
        await refreshProducts();
        afterApiSave();
      } catch {
        setApiError(
          "ອັບເດດສິນຄ້າຜ່ານ API ບໍ່ສຳເລັດ — ກວດຂໍ້ມູນ ແລະ backend"
        );
      } finally {
        setPendingAction(false);
      }
      return;
    }

    const finishLocal = () => {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        nameLao: newProduct.nameLao,
        description: newProduct.description,
        descriptionLao: newProduct.descriptionLao,
        howToUse: newProduct.howToUse,
        howToUseLao: newProduct.howToUseLao,
        priceCNY,
        priceLAK: sellingLakFromCostLak(costLAK, marginPercent),
        marginPercent,
        images: [imageUrlForApi],
        category: storeSlug,
        categoryLao: storeNameLao,
        stock,
        sourceUrl: "",
        trustBadges: ["ຄຸນນະພາບດີ", "ສົ່ງໃນວຽງຈັນ"],
        isNew: true,
        isBestSeller: false,
      };
      setProducts([product, ...products]);
      resetForm();
      closeModal();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };

    if (!isApiConfigured() || !adminToken) {
      finishLocal();
      if (isApiConfigured() && !adminToken) {
        setApiError(
          "ບໍ່ມີ JWT — ບັນທຶກແບບທ້ອງຖິ່ນເທົ່ານັ້ນ. ໄປ /admin/login ເພື່ອ sync ກັບ API"
        );
      }
      return;
    }

    if (categoriesLoading) {
      setApiError("ກຳລັງໂຫຼດໝວດໝູ່ — ລໍຖ້າຊົ່ວຄາວ");
      return;
    }

    if (apiCategories.length === 0) {
      setApiError(
        "ບໍ່ມີໝວດໝູ່ຈາກ API — ສ້າງໝວດໝູ່ທີ່ /admin/categories ກ່ອນເພີ່ມສິນຄ້າ"
      );
      return;
    }

    if (!selectedCat) {
      setApiError("ເລືອກໝວດໝູ່");
      return;
    }

    setPendingAction(true);
    try {
      await apiCreateProduct({
        name: newProduct.nameLao || newProduct.name || "ສິນຄ້າ",
        category_id: selectedCat.id,
        original_price_cny: priceCNY,
        exchange_rate: rate,
        profit_margin: marginPercentToRatio(marginPercent),
        stock,
        description: newProduct.descriptionLao || newProduct.description || "",
        image_url: imageUrlForApi,
      });
      await refreshProducts();
      afterApiSave();
    } catch {
      setApiError("ເພີ່ມສິນຄ້າຜ່ານ API ບໍ່ສຳເລັດ — ກວດຂໍ້ມູນ ແລະ backend");
    } finally {
      setPendingAction(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("ລຶບສິນຄ້ານີ້ບໍ?")) return;
    setApiError(null);
    if (adminToken && isApiConfigured()) {
      setPendingAction(true);
      try {
        await apiDeleteProduct(id);
        await refreshProducts();
      } catch {
        setApiError("ລຶບຜ່ານ API ບໍ່ສຳເລັດ");
      } finally {
        setPendingAction(false);
      }
      return;
    }
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      {apiError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {apiError}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ຈັດການສິນຄ້າ</h1>
          <p className="text-muted-foreground">
            ເພີ່ມ ແລະ ຈັດການສິນຄ້າເຂົ້າສານ
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          ເພີ່ມສິນຄ້າໃໝ່
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ຄົ້ນຫາສິນຄ້າ (ຊື່, ລາຍລະອຽດ)..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {searchLoading
            ? "ກຳລັງຄົ້ນຫາ..."
            : searchQuery.trim()
              ? `ພົບ ${resultCount} ສິນຄ້າ`
              : `${resultCount} ສິນຄ້າທັງໝົດ`}
        </p>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">ສິນຄ້າ</th>
                <th className="text-left p-4 font-medium text-sm">ໝວດໝູ່</th>
                <th className="text-left p-4 font-medium text-sm">ລາຄາຊື້ຕົ້ນທຶນ</th>
                <th className="text-left p-4 font-medium text-sm">ລາຄາຂາຍ (LAK)</th>
                <th className="text-left p-4 font-medium text-sm">ກຳໄລ %</th>
                <th className="text-left p-4 font-medium text-sm">ສະຕ໋ອກ</th>
                <th className="text-right p-4 font-medium text-sm">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/30"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.images[0]}
                        alt={product.nameLao}
                        productName={product.nameLao}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.nameLao}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.categoryLao}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{product.categoryLao}</td>
                  <td className="p-4 text-sm">
                    {formatLAK(Math.round((product.priceCNY || 0) * rate))}
                  </td>
                  <td className="p-4 text-sm font-medium text-primary">
                    {formatLAK(product.priceLAK)}
                  </td>
                  <td className="p-4 text-sm">{product.marginPercent}%</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.stock < 10
                          ? "bg-red-100 text-red-600"
                          : product.stock < 20
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {product.stock} ຖົງ
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void openEditModal(product)}
                        className="p-2 hover:bg-muted rounded-lg"
                        disabled={pendingAction}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ບໍ່ພົບສິນຄ້າ</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => !pendingAction && closeModal()}
          />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-auto bg-background border border-border rounded-xl z-50 p-6"
                onClick={(e) => e.stopPropagation()}
              >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingProductId ? "ແກ້ໄຂສິນຄ້າ" : "ເພີ່ມສິນຄ້າໃໝ່"}
              </h2>
              <button type="button" onClick={() => !pendingAction && closeModal()}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {loadingEditProduct && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70">
                  <p className="text-sm text-muted-foreground">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">
                  ຊື່ສິນຄ້າ (ລາວ)
                </label>
                <Input
                  value={newProduct.nameLao}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, nameLao: e.target.value })
                  }
                  placeholder="ເຊັ່ນ: ເຂົ້າຈ້າວມະລິ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ຊື່ສິນຄ້າ (ອັງກິດ)
                </label>
                <Input
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="e.g., Jasmine Rice 25kg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  ລາຍລະອຽດ (ລາວ)
                </label>
                <textarea
                  value={newProduct.descriptionLao}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, descriptionLao: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background min-h-[80px]"
                  placeholder="ລາຍລະອຽດສິນຄ້າ..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  ວິທີເກັບຮັກສາ (ລາວ)
                </label>
                <textarea
                  value={newProduct.howToUseLao}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, howToUseLao: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background min-h-[60px]"
                  placeholder="ເຊັ່ນ: ເກັບໃນບ່ອນແຫ້ງ ປິດຖົງໃຫ້ສົນ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ລາຄາຊື້ຕົ້ນທຶນ (₭)
                </label>
                <Input
                  type="number"
                  value={newProduct.costLAK}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, costLAK: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ເປີເຊັນກຳໄລ (%)
                </label>
                <Input
                  type="number"
                  value={newProduct.marginPercent}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, marginPercent: e.target.value })
                  }
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ໝວດໝູ່</label>
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  disabled={categoriesLoading || apiCategories.length === 0}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background disabled:opacity-60"
                >
                  {apiCategories.length === 0 ? (
                    <option value="">
                      {categoriesLoading
                        ? "ກຳລັງໂຫຼດໝວດໝູ່..."
                        : "ບໍ່ມີໝວດໝູ່ (ສ້າງທີ່ /admin/categories)"}
                    </option>
                  ) : (
                    apiCategories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                        {cat.slug ? ` — ${cat.slug}` : ""}
                      </option>
                    ))
                  )}
                </select>
                {categoriesError && (
                  <p className="mt-1 text-xs text-destructive">{categoriesError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ຈຳນວນສະຕ໋ອກ</label>
                <Input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  placeholder="50"
                />
              </div>
              <div className="md:col-span-2">
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  ໝາຍເຫດ: ໜ້ານີ້ບໍ່ໃຊ້ “ລິ້ງຜູ້ສະໜອງ” ແລ້ວ (ບໍ່ແມ່ນ dropship)
                </div>
              </div>
              <div className="md:col-span-2">
                <ProductImageField
                  mode={imageSourceMode}
                  onModeChange={setImageSourceMode}
                  imageUrl={newProduct.imageUrl}
                  onImageUrlChange={(url) =>
                    setNewProduct({ ...newProduct, imageUrl: url })
                  }
                  uploadValue={imageUpload}
                  onUploadValueChange={setImageUpload}
                  productName={newProduct.nameLao || newProduct.name}
                  disabled={pendingAction || loadingEditProduct}
                />
              </div>

              {/* Preview */}
              {newProduct.costLAK && (
                <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">ຄາດຄະເນລາຄາຂາຍ:</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatLAK(
                      sellingLakFromCostLak(
                        parseLak(newProduct.costLAK) || 0,
                        parseFloat(newProduct.marginPercent) || 50
                      )
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (ຕົ້ນທຶນ {formatLAK(parseLak(newProduct.costLAK) || 0)} + ກຳໄລ{" "}
                    {newProduct.marginPercent}%)
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => !pendingAction && closeModal()}
                type="button"
              >
                ຍົກເລີກ
              </Button>
              <Button
                onClick={() => void handleSaveProduct()}
                className="flex-1"
                disabled={pendingAction || loadingEditProduct}
              >
                <Upload className="h-4 w-4 mr-2" />
                {pendingAction
                  ? "ກຳລັງບັນທຶກ..."
                  : editingProductId
                    ? "ບັນທຶກການແກ້ໄຂ"
                    : "ເພີ່ມສິນຄ້າ"}
              </Button>
            </div>
          </motion.div>
        </>
      )}

      {/* Success Toast */}
      {isSaved && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Check className="h-5 w-5" />
          {saveMessage}
        </motion.div>
      )}
    </div>
  );
}
