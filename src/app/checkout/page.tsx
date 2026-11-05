'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { formatPrice, getSafeImageUrl } from '@/lib/utils';
import { CheckoutForm } from './CheckoutForm';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <StripeCheckout />
    </div>
  );
}

function StripeCheckout() {
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-300 mb-4">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h2 className="font-serif text-2xl mb-2">Your cart is empty</h2>
          <a href="/shop" className="btn btn-primary mt-4 inline-block">Continue Shopping</a>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <main className="container flex min-h-[60vh] items-center justify-center py-16">
        <section className="max-w-lg text-center" role="alert">
          <p className="section-eyebrow">Payments unavailable</p>
          <h1 className="font-serif text-3xl font-medium">Checkout is temporarily unavailable.</h1>
          <p className="mt-3 text-gray-600">Online payments are not configured right now. Please try again later.</p>
          <a href="/shop" className="btn btn-primary mt-6">Return to Shop</a>
        </section>
      </main>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ mode: 'payment', amount: Math.round(total * 100), currency: 'usd' }}
      key={Math.round(total * 100)}
    >
      <CheckoutInner
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        itemCount={itemCount}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        showToast={showToast}
        router={router}
        clearCart={clearCart}
      />
    </Elements>
  );
}

function CheckoutInner({
  items,
  subtotal,
  shipping,
  total,
  itemCount,
  isProcessing,
  setIsProcessing,
  showToast,
  router,
  clearCart,
}: {
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  showToast: (toast: any) => void;
  router: any;
  clearCart: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (data: any) => {
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        shipping: data,
      };

      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.push('/account/signin?returnTo=%2Fcheckout');
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Checkout failed');
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: result.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/confirmed/${result.orderNumber}`,
          payment_method_data: {
            billing_details: {
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              phone: data.phone,
              address: {
                line1: data.address,
                city: data.city,
                postal_code: data.postalCode,
                country: data.country,
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        showToast({ type: 'error', title: 'Payment failed', message: error.message });
        setIsProcessing(false);
        return;
      }

      if (!paymentIntent || !['succeeded', 'processing'].includes(paymentIntent.status)) {
        throw new Error('Payment could not be confirmed. Please try another payment method.');
      }

      await clearCart();
      router.push(`/order/confirmed/${result.orderNumber}`);
    } catch (error: any) {
      showToast({ type: 'error', title: 'Checkout failed', message: error.message });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="font-serif text-3xl font-medium mb-8">Checkout</h1>
          
          <CheckoutForm
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            total={total}
          />
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-24 bg-gray-50 p-6"
          >
            <h2 className="font-serif text-xl font-medium mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.variant.id} className="flex gap-3">
                  <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden">
                    <img
                      src={getSafeImageUrl(item.product.images[0]?.url)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.variant.size} / {item.variant.color}
                    </p>
                    <p className="text-sm font-medium">
                      {formatPrice(
                        item.product.salePrice
                          ? Number(item.product.salePrice)
                          : Number(item.product.basePrice)
                      )} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Free shipping on orders over $200
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <path d="M1 12h22M9 4v16M15 4v16" />
                </svg>
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-.87-6.8-2.4l-6.8 1.02a.5.5 0 0 1-.48-.64l1.06-6.77A9 9 0 0 1 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
                </svg>
                <span>30-day easy returns</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span>Free shipping over $200</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}