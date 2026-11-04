'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@prisma/client';
import { formatPrice, formatDate, getSafeImageUrl } from '@/lib/utils';

interface OrderWithRelations extends Order {
  items: (OrderItem & {
    product: Product & {
      images: { url: string; alt: string | null }[];
    };
    variant: { size: string; color: string };
  })[];
  payment: { providerPaymentId: string | null } | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string; alt: string | null }[];
  };
  variant: {
    size: string;
    color: string;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: { url: string; alt: string | null }[];
}

interface OrderConfirmedClientProps {
  order: OrderWithRelations;
}

export function OrderConfirmedClient({ order }: OrderConfirmedClientProps) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paymentSucceeded = order.paymentStatus === 'SUCCEEDED';
  const paymentProcessing = order.paymentStatus === 'PENDING';

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="font-serif text-4xl font-medium mb-4">
            {paymentSucceeded ? 'Order Confirmed!' : 'Order Received'}
          </h1>
          <p className="text-gray-600 text-lg">
            {paymentProcessing
              ? `Your payment is processing. We’ll update you at ${order.email} when it clears.`
              : `Thank you for your order. We'll send a confirmation email to ${order.email}`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-serif text-xl font-medium">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Payment</p>
              <span className={cn('badge', order.paymentStatus === 'SUCCEEDED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                {order.paymentStatus === 'SUCCEEDED' ? 'Paid' : order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <Link href={`/product/${item.product.slug}`} className="relative w-16 h-20 flex-shrink-0 overflow-hidden">
                  <Image
                    src={getSafeImageUrl(item.product.images[0]?.url)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </Link>
                <div className="flex-1">
                  <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-gray-500 transition-colors">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500">{item.variant.size} / {item.variant.color}</p>
                  <p className="text-sm font-medium">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <div className="card p-6">
            <h3 className="font-serif text-lg font-medium mb-4">Shipping Address</h3>
            <address className="text-gray-600 not-italic space-y-1">
              <p>{order.firstName} {order.lastName}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.postalCode}</p>
              <p>{order.country}</p>
              {order.phone && <p>Phone: {order.phone}</p>}
            </address>
          </div>

          <div className="card p-6">
            <h3 className="font-serif text-lg font-medium mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{formatPrice(Number(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between text-lg font-medium border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <Link href="/shop" className="btn btn-primary btn-lg inline-block">
            Continue Shopping
          </Link>
          <p className="text-sm text-gray-500">
            Questions? <a href="/contact" className="underline hover:text-black">Contact us</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}