import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { OrderConfirmedClient } from './OrderConfirmedClient';

export const metadata: Metadata = {
  title: 'Order Confirmed',
};

export const dynamic = 'force-dynamic';

interface ConfirmedPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function ConfirmedPage({ params }: ConfirmedPageProps) {
  const { orderNumber } = await params;

  if (!orderNumber) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
            },
          },
          variant: true,
        },
      },
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const normalizedOrder = {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  };

  return <OrderConfirmedClient order={normalizedOrder as typeof normalizedOrder} />;
}