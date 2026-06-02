"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  Wheat,
  Package,
} from "lucide-react";

/** ຊ່ວຍເວລາ — ສະແດງເມນູ «ລູກຄ້າ» / ເຂົ້າລະບົບ */
const SHOW_CUSTOMER_LOGIN = false;
import { BrandLogo } from "@/components/brand/brand-logo";
import { OrderLookupDrawer } from "@/components/orders/order-lookup-drawer";
import { ProductImage } from "@/components/products/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { formatLAK } from "@/lib/format";

export function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity, categories } =
    useStore();

  const submitSearch = (query: string) => {
    const q = query.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/products");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(searchQuery);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
        <p>ຈັດສົ່ງເຂົ້າຖຶງບ້ານ · ພາຍໃນນະຄອນຫຼວງວຽງຈັນ · ຟຣີເມື່ອຍອດເກີນ 500.000 ₭</p>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo size={40} priority />
              <span className="text-xl font-bold text-primary hidden sm:block">
                ຮ້ານເຂົ້າສານ
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {categories.map((category) => {
                const slug =
                  category.slug?.trim() || `category-${category.id}`;
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(slug)}`}
                    className="flex items-center gap-1 px-4 py-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Wheat className="h-4 w-4 shrink-0 opacity-70" />
                    {category.name}
                  </Link>
                );
              })}
              <Link
                href="/products"
                className="px-4 py-2 text-foreground hover:text-primary transition-colors"
              >
                ສິນຄ້າທັງໝົດ
              </Link>
            </nav>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-md mx-6"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="ຄົ້ນຫາສິນຄ້າ..."
                  className="pl-10 bg-muted border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {SHOW_CUSTOMER_LOGIN && (
                <Link
                  href="/login"
                  className="p-2 hover:text-primary transition-colors hidden sm:flex sm:items-center sm:gap-1.5 rounded-md"
                  title="ເຂົ້າລະບົບລູກຄ້າ"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium max-w-[7rem] truncate hidden lg:inline">
                    ລູກຄ້າ
                  </span>
                </Link>
              )}
              <button
                type="button"
                className="p-2 hover:text-primary transition-colors hidden sm:flex sm:items-center sm:gap-1 rounded-md"
                onClick={() => setIsOrdersOpen(true)}
                title="ຄົ້ນຫາຄຳສັ່ງຊື້"
              >
                <Package className="h-5 w-5" />
                <span className="text-sm font-medium hidden lg:inline">
                  ຄຳສັ່ງ
                </span>
              </button>
              {/* <Link href="/wishlist" className="p-2 hover:text-primary transition-colors hidden sm:block">
                <Heart className="h-5 w-5" />
              </Link> */}
              <button
                type="button"
                className="relative p-2 hover:text-primary transition-colors"
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-background z-50 shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-lg font-bold text-primary">ເມນູ</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4">
                <form onSubmit={handleSearchSubmit} className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="ຄົ້ນຫາສິນຄ້າ..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                <nav className="space-y-2">
                  {categories.map((category) => {
                    const slug =
                      category.slug?.trim() || `category-${category.id}`;
                    return (
                      <Link
                        key={category.id}
                        href={`/products?category=${encodeURIComponent(slug)}`}
                        className="flex items-center gap-2 py-2 font-medium border-b border-border"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Wheat className="h-4 w-4 text-primary" />
                        {category.name}
                      </Link>
                    );
                  })}
                  <Link
                    href="/products"
                    className="block py-2 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ສິນຄ້າທັງໝົດ
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-2 py-2 font-medium w-full text-left"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsOrdersOpen(true);
                    }}
                  >
                    <Package className="h-4 w-4 text-primary" />
                    ຄົ້ນຫາຄຳສັ່ງຊື້
                  </button>
                  {SHOW_CUSTOMER_LOGIN && (
                    <Link
                      href="/login"
                      className="block py-2 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ເຂົ້າລະບົບລູກຄ້າ
                    </Link>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-lg font-bold">ກະຕ່າສິນຄ້າ ({cartCount})</span>
                <button onClick={() => setIsCartOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">ກະຕ່າຂອງທ່ານຫວ່າງເປົ່າ</p>
                    <Button
                      className="mt-4"
                      onClick={() => setIsCartOpen(false)}
                    >
                      ເລີ່ມຊື້ເຄື່ອງ
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li
                        key={item.product.id}
                        className="flex gap-4 p-3 bg-muted rounded-lg"
                      >
                        <ProductImage
                          src={item.product.images[0]}
                          alt={item.product.nameLao}
                          productName={item.product.nameLao}
                          className="w-20 h-20 object-cover rounded-md shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {item.product.nameLao}
                          </h4>
                          <p className="text-primary font-bold text-sm mt-1">
                            {formatLAK(item.product.priceLAK)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                            >
                              -
                            </button>
                            <span className="text-sm w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                            <button
                              className="ml-auto text-destructive text-sm"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              ລົບ
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">ລວມທັງໝົດ:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatLAK(cartTotal)}
                    </span>
                  </div>
                  <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      ດຳເນີນການຊຳລະເງິນ
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <OrderLookupDrawer
        open={isOrdersOpen}
        onOpenChange={setIsOrdersOpen}
      />
    </>
  );
}
