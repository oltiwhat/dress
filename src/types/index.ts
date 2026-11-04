import { Product, ProductVariant, Category, Order, OrderItem, Cart, CartItem, User, Address, Payment } from '@prisma/client';

export type ProductWithRelations = Product & {
  category: Category;
  variants: ProductVariant[];
  images: { id: string; url: string; alt: string | null; sortOrder: number; isMain: boolean }[];
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: { url: string; alt: string | null }[];
  category: { name: string; slug: string };
  variants: { size: string; color: string; stock: number }[];
};

export type CartItemWithDetails = CartItem & {
  product: Product & {
    images: { url: string; alt: string | null }[];
  };
  variant: ProductVariant;
};

export type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: Product & {
      images: { url: string; alt: string | null }[];
    };
    variant: ProductVariant;
  })[];
  payment: Payment | null;
  user: User | null;
};

export type CheckoutData = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  saveInfo?: boolean;
};

export type StripePaymentIntentData = {
  amount: number;
  currency: string;
  metadata: {
    orderId: string;
    userId?: string;
  };
};

export type AdminStats = {
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentOrders: Order[];
  bestSellingProducts: { product: Product; totalSold: number }[];
};

export type InventoryItem = {
  id: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  productId: string;
  variantId: string;
};

export type FilterOptions = {
  category?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popularity';
  page?: number;
  limit?: number;
  search?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type ToastMessage = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
};