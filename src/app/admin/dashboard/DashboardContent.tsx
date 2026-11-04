'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice, formatDateShort } from '@/lib/utils';
import { Order, Product } from '@prisma/client';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

function StatCard({ title, value, change, icon, color, href }: StatCardProps) {
  return (
    <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="font-serif text-3xl font-medium">{value}</p>
            {change && <p className="text-sm text-green-600 mt-1">{change}</p>}
          </div>
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', color)}>
            {icon}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface DashboardContentProps {
  stats: {
    totalSales: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    recentOrders: (Order & { items: any[] })[];
    bestSellingProducts: {
      product: {
        name: string;
        slug: string;
        images: {
          id: string;
          createdAt: Date;
          isMain: boolean;
          productId: string;
          url: string;
          alt: string | null;
          sortOrder: number;
        }[];
      };
      totalSold: number;
    }[];
  };
}

export function DashboardContent({ stats }: DashboardContentProps) {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-medium">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your store performance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="btn btn-primary">Add Product</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          href="/admin/orders"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          href="/admin/orders"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          href="/admin/products"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts}
          href="/admin/inventory"
          change={stats.lowStockProducts > 0 ? '⚠ Needs attention' : 'All stocked'}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockProducts}
          href="/admin/inventory"
          change={stats.outOfStockProducts > 0 ? '⚠ Needs restock' : 'Fully stocked'}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          title="Paid Orders"
          value={stats.totalSales}
          href="/admin/orders"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>}
          color="bg-indigo-100 text-indigo-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-gray-600 hover:text-black">View all →</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No orders yet</div>
            ) : (
              stats.recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.firstName} {order.lastName} • {formatDateShort(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(Number(order.total))}</p>
                    <span className={cn('badge text-xs', 
                      order.paymentStatus === 'SUCCEEDED' ? 'bg-green-100 text-green-700' :
                      order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium">Best Selling Products</h2>
            <Link href="/admin/products" className="text-sm font-medium text-gray-600 hover:text-black">View all →</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.bestSellingProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No sales data yet</div>
            ) : (
              stats.bestSellingProducts.filter((item) => item.product).map((item, index) => (
                <div key={item.product!.slug} className="p-4 flex items-center gap-4">
                  <span className="w-8 text-center text-sm font-medium text-gray-500">{index + 1}</span>
                  <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                    <img src={item.product!.images[0]?.url || ''} alt={item.product!.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product!.name}</p>
                    <p className="text-sm text-gray-500">{item.totalSold} sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}