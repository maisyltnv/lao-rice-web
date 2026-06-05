"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatLAK } from "@/lib/format";

const stats = [
  {
    name: "ລາຍຮັບມື້ນີ້",
    value: "2.450.000 ₭",
    change: "+12.5%",
    isPositive: true,
    icon: DollarSign,
  },
  {
    name: "ຄຳສັ່ງຊື້ໃໝ່",
    value: "24",
    change: "+8.2%",
    isPositive: true,
    icon: ShoppingCart,
  },
  {
    name: "ສິນຄ້າທັງໝົດ",
    value: "156",
    change: "+3",
    isPositive: true,
    icon: Package,
  },
  {
    name: "ລູກຄ້າໃໝ່",
    value: "18",
    change: "-2.1%",
    isPositive: false,
    icon: Users,
  },
];

export default function AdminDashboardPage() {
  const { orders, products } = useStore();

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalLAK, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">ແດັສບອດ</h1>
        <p className="text-muted-foreground">ພາບລວມຂອງຮ້ານຄ້າ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.isPositive ? "text-green-600" : "text-red-500"
                }`}
              >
                {stat.isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Orders Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">ຄຳສັ່ງຊື້ລໍຖ້າ</h3>
              <p className="text-sm text-muted-foreground">ຕ້ອງດຳເນີນການ</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600">{pendingOrders}</p>
          <a
            href="/admin/orders"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            ເບິ່ງຄຳສັ່ງຊື້ທັງໝົດ →
          </a>
        </motion.div>

        {/* Low Stock Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold">ສິນຄ້າໃກ້ໝົດ</h3>
              <p className="text-sm text-muted-foreground">ນ້ອຍກວ່າ 10 ຖົງ</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{lowStockProducts}</p>
          <a
            href="/admin/products"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            ເບິ່ງສິນຄ້າທັງໝົດ →
          </a>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold">ຄຳສັ່ງຊື້ລ່າສຸດ</h3>
        </div>
        {orders.length > 0 ? (
          <div className="divide-y divide-border">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerInfo.name} | {order.customerInfo.province}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">
                    {formatLAK(order.totalLAK)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "pending"
                        ? "bg-orange-100 text-orange-600"
                        : order.status === "processing"
                        ? "bg-blue-100 text-blue-600"
                        : order.status === "shipped"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {order.status === "pending"
                      ? "ລໍຖ້າ"
                      : order.status === "processing"
                      ? "ກຳລັງດຳເນີນ"
                      : order.status === "shipped"
                      ? "ສົ່ງແລ້ວ"
                      : "ສຳເລັດ"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            ຍັງບໍ່ມີຄຳສັ່ງຊື້
          </div>
        )}
      </motion.div>
    </div>
  );
}
