import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductClient } from './ProductClient';

export const metadata: Metadata = {
  title: 'Product',
  description: 'View product details',
};

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true }, orderBy: [{ size: 'asc' }, { color: 'asc' }] },
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    include: {
      images: { where: { isMain: true }, take: 1 },
      variants: { where: { isActive: true }, select: { size: true, color: true, stock: true } },
    },
    take: 4,
  });

  return (
    <ProductClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}