import { notFound, redirect } from 'next/navigation';
import { AdminPageFrame } from '@/components/AdminPageFrame';
import { AdminSectionClient } from '../AdminSectionClient';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminRecordPage({ params }: { params: { section: string; recordId: string } }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin');
  if (params.section !== 'orders') notFound();

  let order;
  try {
    order = await prisma.order.findUnique({
      where: { id: params.recordId },
      include: { items: { include: { product: { select: { name: true } } } } },
    });
  } catch (error) {
    console.error('Admin order detail query failed:', error);
    return <AdminPageFrame><AdminSectionClient section="order" records={[]} categories={[]} loadError="Database unavailable. Start PostgreSQL and reload this page." /></AdminPageFrame>;
  }

  if (!order) notFound();
  const record = { ...order, total: Number(order.total), items: order.items.map((item) => ({ ...item, price: Number(item.price) })) };
  return <AdminPageFrame><AdminSectionClient section="order" records={[record]} categories={[]} /></AdminPageFrame>;
}