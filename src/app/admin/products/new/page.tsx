import { redirect } from 'next/navigation';
import { AdminPageFrame } from '@/components/AdminPageFrame';
import { AdminProductForm } from './AdminProductForm';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function NewAdminProductPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  try {
    const categories = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: 'asc' } });
    return <AdminPageFrame><AdminProductForm categories={categories} /></AdminPageFrame>;
  } catch (error) {
    console.error('Admin product categories query failed:', error);
    return <AdminPageFrame><AdminProductForm categories={[]} loadError="Database unavailable. Start PostgreSQL and reload this page." /></AdminPageFrame>;
  }
}