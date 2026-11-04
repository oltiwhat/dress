'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  images: { url: string; alt: string | null }[];
}

export interface CartVariant {
  id: string;
  productId?: string;
  size: string;
  color: string;
  stock: number;
}

export interface CartLineItem {
  productId: string;
  variantId: string;
  quantity: number;
  product: CartProduct;
  variant: CartVariant;
}

interface CartContextType {
  items: CartLineItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: CartProduct, variant: CartVariant, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cart');
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  const addItem = async (product: CartProduct, variant: CartVariant, quantity: number) => {
    const currentQuantity = items.find((item) => item.variantId === variant.id)?.quantity ?? 0;
    if (currentQuantity + quantity > variant.stock) {
      throw new Error('Not enough stock available');
    }

    setIsLoading(true);
    try {
      setItems((currentItems) => {
        const existing = currentItems.find((item) => item.variantId === variant.id);
        if (existing) {
          return currentItems.map((item) => item.variantId === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item);
        }
        return [...currentItems, {
          productId: product.id,
          variantId: variant.id,
          quantity,
          product: {
            ...product,
            basePrice: Number(product.basePrice),
            salePrice: product.salePrice === null ? null : Number(product.salePrice),
          },
          variant,
        }];
      });
      openCart();
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (variantId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(variantId);
      return;
    }
    setItems((currentItems) => currentItems.map((item) => item.variantId === variantId
      ? { ...item, quantity: Math.min(quantity, item.variant.stock) }
      : item));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.salePrice
      ? Number(item.product.salePrice)
      : Number(item.product.basePrice);
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}