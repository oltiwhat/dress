'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { formatPrice, cn, getSafeImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  if (!isOpen && items.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.aside
            className="drawer fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="font-serif text-2xl font-medium">Shopping Cart</h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300 mb-4">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <h3 className="font-serif text-xl text-gray-500 mb-2">Your cart is empty</h3>
                  <p className="text-gray-400 mb-6">Add some dresses to get started</p>
                  <Link href="/shop" className="btn btn-primary" onClick={closeCart}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.variantId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4"
                    >
                      <Link href={`/product/${item.product.slug}`} className="relative w-20 h-28 flex-shrink-0 overflow-hidden">
                        <Image
                          src={getSafeImageUrl(item.product.images[0]?.url)}
                          alt={item.product.images[0]?.alt || item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product.slug}`} className="block">
                          <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{item.variant.size}</span>
                          <span>•</span>
                          <span className="capitalize">{item.variant.color}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14" />
                              </svg>
                            </button>
                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(
                                item.product.salePrice
                                  ? Number(item.product.salePrice) * item.quantity
                                  : Number(item.product.basePrice) * item.quantity
                              )}
                            </p>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    Free shipping on orders over $200
                  </p>
                )}
                <div className="divider" />
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="btn btn-primary btn-full"
                  onClick={closeCart}
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/cart"
                  className="btn btn-outline btn-full"
                  onClick={closeCart}
                >
                  View Cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}