import { redirect, notFound } from 'next/navigation';
import { AdminPageFrame } from '@/components/AdminPageFrame';
import { AdminSectionClient } from './AdminSectionClient';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const sections = ['products', 'orders', 'inventory', 'customers', 'settings'] as const;
type Section = typeof sections[number];

export default async function AdminSectionPage({ params }: { params: { section: string } }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  if (!sections.includes(params.section as Section)) notFound();
  const section = params.section as Section;

  try {
    const records = await getSectionRecords(section);
    const categories = section === 'products' || section === 'settings'
      ? await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: 'asc' } })
      : [];

    return (
      <AdminPageFrame>
        <AdminSectionClient section={section} records={records} categories={categories} />
      </AdminPageFrame>
    );
  } catch (error) {
    console.error(`Admin ${section} page query failed:`, error);
    return (
      <AdminPageFrame>
        <AdminSectionClient section={section} records={[]} categories={[]} loadError="Database unavailable. Start PostgreSQL and reload this page." />
      </AdminPageFrame>
    );
  }
}

async function getSectionRecords(section: Section): Promise<any[]> {
  switch (section) {
    case 'products': {
      const products = await prisma.product.findMany({
        include: { category: { select: { name: true } }, variants: { select: { stock: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return products.map((product) => ({
        ...product,
        basePrice: Number(product.basePrice),
        salePrice: product.salePrice === null ? null : Number(product.salePrice),
        stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
        categoryName: product.category.name,
      }));
    }
    case 'orders': {
      const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return orders.map((order) => ({ ...order, total: Number(order.total) }));
    }
    case 'inventory':
      return prisma.productVariant.findMany({
        include: { product: { select: { name: true } } },
        orderBy: [{ stock: 'asc' }, { product: { name: 'asc' } }],
        take: 200,
      });
    case 'customers': {
      const customers = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true, email: true, firstName: true, lastName: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      return customers.map((customer) => ({ ...customer, orderCount: customer._count.orders }));
    }
    case 'settings':
      return prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }
}