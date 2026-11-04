'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Category } from '@prisma/client';
import { formatPrice, cn, getStockStatus, getSafeImageUrl } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

interface ProductWithRelations extends Omit<Product, 'basePrice' | 'salePrice'> {
  basePrice: number;
  salePrice: number | null;
  category: Category;
  images: { url: string; alt: string | null; isMain: boolean }[];
  variants: { id: string; size: string; color: string; stock: number }[];
}

interface ShopClientProps {
  initialProducts: ProductWithRelations[];
  initialCategories: Category[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  currentCategory?: string;
  currentFilter?: string;
  currentSort?: string;
  searchQuery?: string;
  collectionTitle: string;
  collectionDescription: string;
  collectionBasePath: string;
}

export function ShopClient({
  initialProducts,
  initialCategories,
  totalProducts,
  currentPage,
  totalPages,
  currentCategory,
  currentFilter,
  currentSort,
  searchQuery,
  collectionTitle,
  collectionDescription,
  collectionBasePath,
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, isLoading: cartLoading } = useCart();
  const { showToast } = useToast();

  const [products, setProducts] = useState<ProductWithRelations[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const sizes = searchParams.get('sizes')?.split(',').map(v => v.trim()).filter(Boolean) ?? [];
    const colors = searchParams.get('colors')?.split(',').map(v => v.trim()).filter(Boolean) ?? [];
    const minPrice = Number(searchParams.get('minPrice') ?? 0);
    const maxPrice = Number(searchParams.get('maxPrice') ?? 1000);

    setSelectedSizes(sizes);
    setSelectedColors(colors);
    setPriceRange([
      Number.isFinite(minPrice) && minPrice >= 0 ? minPrice : 0,
      Number.isFinite(maxPrice) && maxPrice >= 0 ? maxPrice : 1000,
    ]);
    setInStockOnly(searchParams.get('inStock') === 'true');
  }, [searchParams]);

  const applyFilters = ({
    nextSizes = selectedSizes,
    nextColors = selectedColors,
    nextPriceRange = priceRange,
    nextInStock = inStockOnly,
  }: {
    nextSizes?: string[];
    nextColors?: string[];
    nextPriceRange?: [number, number];
    nextInStock?: boolean;
  } = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (nextSizes.length) params.set('sizes', nextSizes.join(','));
    else params.delete('sizes');

    if (nextColors.length) params.set('colors', nextColors.join(','));
    else params.delete('colors');

    params.set('minPrice', nextPriceRange[0].toString());
    params.set('maxPrice', nextPriceRange[1].toString());

    if (nextInStock) params.set('inStock', 'true');
    else params.delete('inStock');

    router.push(`${collectionBasePath}?${params.toString()}`);
  };

  const handleFilterChange = () => {
    applyFilters();
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    params.set('page', '1');
    router.push(`${collectionBasePath}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${collectionBasePath}?${params.toString()}`);
  };

  const handleAddToCart = async (product: ProductWithRelations, variant: ProductWithRelations['variants'][number]) => {
    try {
      await addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: Number(product.basePrice),
        salePrice: product.salePrice === null ? null : Number(product.salePrice),
        images: product.images.map(({ url, alt }) => ({ url, alt })),
      }, variant, 1);
      showToast({ type: 'success', title: 'Added to cart', message: `${product.name} has been added to your cart.` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to add to cart' });
    }
  };

  const allSizes = Array.from(new Set(products.flatMap(p => p.variants.map(v => v.size)))).sort();
  const allColors = Array.from(new Set(products.flatMap(p => p.variants.map(v => v.color)))).sort();

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#f7f3ee] border-b border-[#e9e4de]">
        <div className="container py-10">
          <div className="shop-hero">
            <div className="shop-hero-copy">
              <p className="section-eyebrow">Curated wardrobe</p>
              <h1 className="font-serif text-4xl md:text-5xl font-medium">{collectionTitle}</h1>
              <p className="mt-3 max-w-xl text-[15px] text-gray-700">
                {collectionDescription}
              </p>
            </div>

            <div className="shop-hero-stats" aria-label="Store highlights">
              <div>
                <strong>{totalProducts}</strong>
                <span>Styles</span>
              </div>
              <div>
                <strong>Free</strong>
                <span>Shipping</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>Reviews</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => router.push(category.slug === 'wedding-dress' ? '/occasion-wear' : `/shop?category=${category.slug}`)}
                className={cn(
                  'shop-chip',
                  currentCategory === category.slug && 'shop-chip-active'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-600">{totalProducts} {totalProducts === 1 ? 'dress' : 'dresses'} found</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={currentSort || 'newest'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="select w-auto min-w-[220px] border-[#d8d2ca] bg-white"
                aria-label="Sort products"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
              </select>
              <div className="flex items-center gap-2 border border-[#d8d2ca] bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-2 transition-colors', viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-500 hover:text-black')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-2 transition-colors', viewMode === 'list' ? 'bg-black text-white' : 'text-gray-500 hover:text-black')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <button
          type="button"
          className="btn btn-outline btn-sm mb-4 w-full lg:hidden"
          onClick={() => setIsFiltersOpen((open) => !open)}
          aria-expanded={isFiltersOpen}
          aria-controls="shop-filter-panel"
        >
          {isFiltersOpen ? 'Hide filters' : 'Show filters'}
        </button>
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className={`lg:col-span-1 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-5">
              <div className="filter-panel" id="shop-filter-panel">
                <div className="filter-panel-header">
                  <h3>Filters</h3>
                </div>
                <FilterSection
                  title="Categories"
                  items={categories.map(c => ({ id: c.slug, label: c.name, count: 0 }))}
                  selected={currentCategory ? [currentCategory] : []}
                  onChange={(value) => {
                    const params = new URLSearchParams(searchParams.toString());
                    const categoryValue = typeof value === 'string' ? value : value[0] ?? '';
                    params.set('page', '1');
                    if (categoryValue) params.set('category', categoryValue);
                    else params.delete('category');
                    params.delete('filter');
                    router.push(`${categoryValue === 'wedding-dress' ? '/occasion-wear' : '/shop'}?${params.toString()}`);
                  }}
                  type="radio"
                />

                <FilterSection
                  title="Sizes"
                  items={allSizes.map(s => ({ id: s, label: s, count: 0 }))}
                  selected={selectedSizes}
                  onChange={(value) => {
                    const nextValues = Array.isArray(value) ? value : [value];
                    setSelectedSizes(nextValues);
                    applyFilters({ nextSizes: nextValues, nextColors: selectedColors, nextPriceRange: priceRange, nextInStock: inStockOnly });
                  }}
                  type="checkbox"
                />

                <FilterSection
                  title="Colors"
                  items={allColors.map(c => ({ id: c, label: c, count: 0 }))}
                  selected={selectedColors}
                  onChange={(value) => {
                    const nextValues = Array.isArray(value) ? value : [value];
                    setSelectedColors(nextValues);
                    applyFilters({ nextSizes: selectedSizes, nextColors: nextValues, nextPriceRange: priceRange, nextInStock: inStockOnly });
                  }}
                  type="checkbox"
                />

                <div className="border-t border-gray-200 pt-6">
                  <label className="label">Price Range</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const nextRange: [number, number] = [parseInt(e.target.value) || 0, priceRange[1]];
                        setPriceRange(nextRange);
                        applyFilters({ nextSizes: selectedSizes, nextColors: selectedColors, nextPriceRange: nextRange, nextInStock: inStockOnly });
                      }}
                      className="input w-24"
                      placeholder="Min"
                      min="0"
                      max="1000"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const nextRange: [number, number] = [priceRange[0], parseInt(e.target.value) || 1000];
                        setPriceRange(nextRange);
                        applyFilters({ nextSizes: selectedSizes, nextColors: selectedColors, nextPriceRange: nextRange, nextInStock: inStockOnly });
                      }}
                      className="input w-24"
                      placeholder="Max"
                      min="0"
                      max="1000"
                    />
                  </div>
                </div>

                <label className="checkbox block mt-5">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setInStockOnly(checked);
                      applyFilters({ nextSizes: selectedSizes, nextColors: selectedColors, nextPriceRange: priceRange, nextInStock: checked });
                    }}
                  />
                  <span className="checkbox-mark" />
                  <span>In Stock Only</span>
                </label>

                <button
                  type="button"
                  onClick={handleFilterChange}
                  className="btn btn-primary btn-full mt-6 text-sm"
                >
                  Apply Filters
                </button>

                {(currentCategory || currentFilter || selectedSizes.length || selectedColors.length || inStockOnly || priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <button
                    type="button"
                    onClick={() => router.push(collectionBasePath)}
                    className="btn btn-outline btn-full text-sm mt-3"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {products.length === 0 ? (
                  <div className="text-center py-20">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-300 mb-4">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <h3 className="font-serif text-xl text-gray-500 mb-2">No dresses found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                    <button onClick={() => router.push(collectionBasePath)} className="btn btn-primary">
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {viewMode === 'grid' ? (
                      <div className="product-grid">
                        {products.map((product, index) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            onAddToCart={handleAddToCart}
                            isLoading={cartLoading}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {products.map((product, index) => (
                          <ProductCardList
                            key={product.id}
                            product={product}
                            index={index}
                            onAddToCart={handleAddToCart}
                            isLoading={cartLoading}
                          />
                        ))}
                      </div>
                    )}

                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  items: { id: string; label: string; count: number }[];
  selected: string[];
  onChange: (value: string | string[]) => void;
  type: 'checkbox' | 'radio';
}

function FilterSection({ title, items, selected, onChange, type }: FilterSectionProps) {
  return (
    <div className="filter-section">
      <h3 className="label mb-3">{title}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-3 cursor-pointer py-1.5">
            {type === 'checkbox' ? (
              <>
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={(e) => onChange(e.target.checked ? [...selected, item.id] : selected.filter(s => s !== item.id))}
                  className="h-4 w-4 accent-black"
                />
                <span className="text-sm">{item.label}</span>
              </>
            ) : (
              <>
                <input
                  type="radio"
                  name={title}
                  checked={selected[0] === item.id}
                  onChange={() => onChange(item.id)}
                  className="h-4 w-4 accent-black"
                />
                <span className="text-sm">{item.label}</span>
              </>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: ProductWithRelations;
  index: number;
  onAddToCart: (product: ProductWithRelations, variant: ProductWithRelations['variants'][number]) => void;
  isLoading: boolean;
}

function ProductCard({ product, index, onAddToCart, isLoading }: ProductCardProps) {
  const mainImage = product.images[0];
  const hasSale = product.salePrice !== null;
  const discount = hasSale ? Math.round(((Number(product.basePrice) - Number(product.salePrice!)) / Number(product.basePrice)) * 100) : 0;
  const defaultVariant = product.variants.find((variant) => variant.stock > 0);
  const stockStatus = defaultVariant ? getStockStatus(defaultVariant.stock) : 'out-of-stock';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="card group"
    >
      <Link href={`/product/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={getSafeImageUrl(mainImage?.url)}
            alt={mainImage?.alt || product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {(product.isNewArrival || hasSale || product.isBestSeller) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isNewArrival && <span className="badge badge-new">New</span>}
              {hasSale && <span className="badge badge-sale">-{discount}%</span>}
              {product.isBestSeller && !product.isNewArrival && !hasSale && <span className="badge badge-bestseller">Best Seller</span>}
            </div>
          )}
          {stockStatus === 'out-of-stock' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="badge badge-out-of-stock text-base px-4 py-2">Out of Stock</span>
            </div>
          )}
          <button
            className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Add to wishlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-1.5">
            {product.category.name}
          </p>
          <h3 className="font-serif text-lg font-medium mb-2 group-hover:text-gray-500 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {hasSale ? (
              <>
                <span className="font-medium">{formatPrice(Number(product.salePrice!))}</span>
                <span className="text-gray-400 line-through text-sm">{formatPrice(Number(product.basePrice))}</span>
              </>
            ) : (
              <span className="font-medium">{formatPrice(Number(product.basePrice))}</span>
            )}
          </div>
        </div>
      </Link>
      {stockStatus !== 'out-of-stock' && (
        <div className="px-5 pb-5">
          <button
            onClick={() => defaultVariant && onAddToCart(product, defaultVariant)}
            disabled={isLoading || !defaultVariant}
            className="btn btn-primary btn-full btn-sm w-full"
          >
            {isLoading ? 'Adding...' : 'Put in Bag'}
          </button>
        </div>
      )}
    </motion.article>
  );
}

interface ProductCardListProps {
  product: ProductWithRelations;
  index: number;
  onAddToCart: (product: ProductWithRelations, variant: ProductWithRelations['variants'][number]) => void;
  isLoading: boolean;
}

function ProductCardList({ product, index, onAddToCart, isLoading }: ProductCardListProps) {
  const mainImage = product.images[0];
  const hasSale = product.salePrice !== null;
  const defaultVariant = product.variants.find((variant) => variant.stock > 0);
  const stockStatus = defaultVariant ? getStockStatus(defaultVariant.stock) : 'out-of-stock';

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card flex gap-6 p-4 group"
    >
      <Link href={`/product/${product.slug}`} className="relative w-32 h-40 flex-shrink-0 overflow-hidden" aria-label={`View ${product.name}`}>
        <Image
          src={getSafeImageUrl(mainImage?.url)}
          alt={mainImage?.alt || product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="128px"
        />
        {stockStatus === 'out-of-stock' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="badge badge-out-of-stock text-sm px-3 py-1">Out of Stock</span>
          </div>
        )}
      </Link>
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-1">
            {product.category.name}
          </p>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-xl font-medium mb-1 group-hover:text-gray-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            {product.variants.slice(0, 3).map((v) => (
              <span key={`${v.size}-${v.color}`} className="px-2 py-0.5 bg-gray-100 text-xs">
                {v.size} / {v.color}
              </span>
            ))}
            {product.variants.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-xs">+{product.variants.length - 3} more</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {hasSale ? (
              <>
                <span className="font-medium text-lg">{formatPrice(Number(product.salePrice!))}</span>
                <span className="text-gray-400 line-through">{formatPrice(Number(product.basePrice))}</span>
              </>
            ) : (
              <span className="font-medium text-lg">{formatPrice(Number(product.basePrice))}</span>
            )}
          </div>
          {stockStatus !== 'out-of-stock' && (
            <button
              onClick={() => defaultVariant && onAddToCart(product, defaultVariant)}
              disabled={isLoading || !defaultVariant}
              className="btn btn-primary btn-sm"
            >
              {isLoading ? 'Adding...' : 'Put in Bag'}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(p => 
    p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)
  );

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-outline btn-sm p-2"
        aria-label="Previous page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {visiblePages.map((page, index) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn('w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors', 
            page === currentPage 
              ? 'bg-black text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          )}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-outline btn-sm p-2"
        aria-label="Next page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}