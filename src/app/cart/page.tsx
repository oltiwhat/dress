'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatPrice, getSafeImageUrl } from '@/lib/utils';

export default function CartPage() {
  const { items, subtotal, itemCount, removeItem, updateQuantity } = useCart();
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <main id="main-content" className="container min-h-[60vh] py-10">
      <h1 className="font-serif text-3xl font-medium">Your Bag</h1>
      {items.length === 0 ? (
        <section className="py-16 text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link href="/shop" className="btn btn-primary mt-6 inline-block">Continue Shopping</Link>
        </section>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-label="Cart items" className="divide-y divide-gray-200">
            {items.map((item) => {
              const unitPrice = item.product.salePrice ?? item.product.basePrice;
              return (
                <article key={item.variantId} className="flex gap-4 py-5 first:pt-0">
                  <Link href={`/product/${item.product.slug}`} className="relative h-32 w-24 shrink-0 overflow-hidden bg-gray-100">
                    <Image
                      src={getSafeImageUrl(item.product.images[0]?.url)}
                      alt={item.product.images[0]?.alt || item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${item.product.slug}`} className="font-medium hover:underline">
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-600">{item.variant.size} / {item.variant.color}</p>
                    <p className="mt-2 text-sm">{formatPrice(unitPrice)}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <label className="text-sm" htmlFor={`quantity-${item.variantId}`}>Quantity</label>
                      <input
                        id={`quantity-${item.variantId}`}
                        type="number"
                        min="1"
                        max={item.variant.stock}
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.variantId, Number(event.target.value))}
                        className="input w-20"
                      />
                      <button type="button" onClick={() => removeItem(item.variantId)} className="text-sm text-gray-500 underline hover:text-black">
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-medium">{formatPrice(unitPrice * item.quantity)}</p>
                </article>
              );
            })}
          </section>

          <aside className="h-fit border border-gray-200 p-6">
            <h2 className="font-serif text-xl font-medium">Order Summary</h2>
            <div className="mt-6 space-y-3 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between"><span>Subtotal ({itemCount} items)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-medium"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-full mt-6">Proceed to Checkout</Link>
            <Link href="/shop" className="btn btn-outline btn-full mt-3">Continue Shopping</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
