import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/AdminSidebar';
import { DashboardContent } from './DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: 'noindex, nofollow',
};

export default async function DashboardPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/admin');
  }

  const [
    totalSales,
    totalOrders,
    totalRevenue,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
    bestSellingProducts,
  ] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: 'SUCCEEDED' } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { paymentStatus: 'SUCCEEDED' },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({ where: { stock: { gt: 0, lte: 5 }, isActive: true } }),
    prisma.productVariant.count({ where: { stock: { lte: 0 }, isActive: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true, variant: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { paymentStatus: 'SUCCEEDED' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  const bestSellers = (
    await Promise.all(
      bestSellingProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, slug: true, images: { where: { isMain: true }, take: 1 } },
        });

        if (!product) {
          return null;
        }

        return {
          product: {
            ...product,
            images: product.images.map((image) => ({ ...image })),
          },
          totalSold: item._sum.quantity || 0,
        };
      })
    )
  ).filter((item): item is {
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
  } => item !== null);

  const stats = {
    totalSales,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
    bestSellingProducts: bestSellers,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="min-h-screen pt-28 lg:ml-64 lg:pt-0">
        <DashboardContent stats={stats} />
      </main>
    </div>
  );
}