'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant, Category } from '@prisma/client';
import { formatPrice, cn, getStockStatus, calculateDiscount, getSafeImageUrl } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

interface ProductWithRelations extends Product {
  category: Category;
  images: { id: string; url: string; alt: string | null; sortOrder: number; isMain: boolean }[];
  variants: ProductVariant[];
}

interface RelatedProduct extends Product {
  category?: { name: string; slug: string } | null;
  images: { url: string; alt: string | null }[];
  variants: { size: string; color: string; stock: number }[];
}

interface ProductClientProps {
  product: ProductWithRelations;
  relatedProducts: RelatedProduct[];
}

export function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const { addItem, isLoading: cartLoading } = useCart();
  const { showToast } = useToast();

  const availableSizes = Array.from(new Set(product.variants.map(v => v.size))).sort();
  const availableColors = Array.from(new Set(product.variants.map(v => v.color))).sort();
  
  const filteredVariants = product.variants.filter(v => {
    const sizeMatch = !selectedSize || v.size === selectedSize;
    const colorMatch = !selectedColor || v.color === selectedColor;
    return sizeMatch && colorMatch;
  });

  const selectedVariant = filteredVariants.find(v => 
    v.size === selectedSize && v.color === selectedColor
  ) || filteredVariants[0];

  const stockStatus = selectedVariant ? getStockStatus(selectedVariant.stock) : 'out-of-stock';
  const hasSale = product.salePrice !== null;
  const discount = hasSale ? calculateDiscount(Number(product.basePrice), Number(product.salePrice!)) : 0;

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      const colorWithStock = availableColors.find(c => 
        product.variants.some(v => v.color === c && v.stock > 0)
      );
      setSelectedColor(colorWithStock || availableColors[0]);
    }
  }, [availableColors, selectedColor, product.variants]);

  const handleAddToCart = async () => {
    if (!selectedVariant || stockStatus === 'out-of-stock') {
      showToast({ type: 'error', title: 'Unavailable', message: 'This item is currently out of stock.' });
      return;
    }

    try {
      await addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: Number(product.basePrice),
        salePrice: product.salePrice === null ? null : Number(product.salePrice),
        images: product.images.map(({ url, alt }) => ({ url, alt })),
      }, selectedVariant, quantity);
      showToast({ 
        type: 'success', 
        title: 'Added to cart', 
        message: `${product.name} (${selectedVariant.size} / ${selectedVariant.color}) × ${quantity}` 
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to add to cart' });
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || stockStatus === 'out-of-stock') return;
    await addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice === null ? null : Number(product.salePrice),
      images: product.images.map(({ url, alt }) => ({ url, alt })),
    }, selectedVariant, quantity);
    window.location.href = '/checkout';
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <nav className="container py-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-black transition-colors">Home</a></li>
            <li><span className="mx-2">/</span></li>
            <li><a href="/shop" className="hover:text-black transition-colors">Shop</a></li>
            <li><span className="mx-2">/</span></li>
            <li><a href={`/shop?category=${product.category.slug}`} className="hover:text-black transition-colors">{product.category.name}</a></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-black font-medium truncate max-w-[200px]" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="container py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative aspect-[3/4] overflow-hidden" role="region" aria-label="Product image gallery">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={getSafeImageUrl(product.images[selectedImageIndex]?.url)}
                      alt={product.images[selectedImageIndex]?.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                    {isZoomed && selectedVariant && (
                      <div
                        className="absolute inset-0 bg-white z-10"
                        style={{
                          backgroundImage: `url(${getSafeImageUrl(product.images[selectedImageIndex]?.url)})`,
                          backgroundSize: '200%',
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          backgroundRepeat: 'no-repeat',
                        }}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setZoomPosition({ x, y });
                        }}
                        onMouseLeave={() => setIsZoomed(false)}
                      />
                    )}
                    {stockStatus === 'out-of-stock' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="badge badge-out-of-stock text-base px-6 py-3">Out of Stock</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          index === selectedImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/75'
                        )}
                        aria-label={`View image ${index + 1}`}
                        aria-current={index === selectedImageIndex ? 'true' : 'false'}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hidden md:block"
                  aria-label="Previous image"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hidden md:block"
                  aria-label="Next image"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2" role="list" aria-label="Product thumbnails">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'relative flex-shrink-0 w-20 h-28 rounded overflow-hidden border-2 transition-all',
                        index === selectedImageIndex
                          ? 'border-black'
                          : 'border-transparent hover:border-gray-300'
                      )}
                      role="listitem"
                      aria-label={`Image ${index + 1}`}
                      aria-current={index === selectedImageIndex ? 'true' : 'false'}
                    >
                      <Image
                        src={getSafeImageUrl(image.url)}
                        alt={image.alt || ''}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium tracking-widest uppercase text-gray-500 mb-2">
                  {product.category.name}
                </p>
                <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-3">
                    {hasSale ? (
                      <>
                        <span className="text-2xl font-medium">{formatPrice(Number(product.salePrice!))}</span>
                        <span className="text-gray-400 line-through text-xl">{formatPrice(Number(product.basePrice))}</span>
                        <span className="badge badge-sale">-{discount}%</span>
                      </>
                    ) : (
                      <span className="text-2xl font-medium">{formatPrice(Number(product.basePrice))}</span>
                    )}
                  </div>
                  {product.isNewArrival && <span className="badge badge-new">New Arrival</span>}
                  {product.isBestSeller && <span className="badge badge-bestseller">Best Seller</span>}
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                {product.shortDescription && (
                  <p className="text-gray-600 leading-relaxed mb-4">{product.shortDescription}</p>
                )}
                {product.description && (
                  <div className="prose max-w-none text-gray-600">{product.description}</div>
                )}
              </div>

              <fieldset className="space-y-4">
                <legend className="label">Color</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select color">
                  {availableColors.map((color) => {
                    const variant = product.variants.find(v => v.color === color);
                    const isOutOfStock = variant ? variant.stock <= 0 : true;
                    return (
                      <button
                        key={color}
                        onClick={() => !isOutOfStock && setSelectedColor(color)}
                        disabled={isOutOfStock}
                        className={cn(
                          'px-4 py-2 border text-sm font-medium transition-all min-w-[80px]',
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : isOutOfStock
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:border-black'
                        )}
                        aria-label={color}
                        aria-pressed={selectedColor === color}
                        aria-disabled={isOutOfStock}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="label">Size</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
                  {availableSizes.map((size) => {
                    const variant = product.variants.find(v => v.size === size && v.color === selectedColor);
                    const isOutOfStock = variant ? variant.stock <= 0 : true;
                    return (
                      <button
                        key={size}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={cn(
                          'w-12 h-12 flex items-center justify-center border text-sm font-medium transition-all',
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : isOutOfStock
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:border-black'
                        )}
                        aria-label={`Size ${size}`}
                        aria-pressed={selectedSize === size}
                        aria-disabled={isOutOfStock}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && selectedVariant && (
                  <p className={cn('text-sm', stockStatus === 'out-of-stock' ? 'text-red-600' : stockStatus === 'low-stock' ? 'text-amber-600' : 'text-green-600')}>
                    {stockStatus === 'out-of-stock' && 'Out of Stock'}
                    {stockStatus === 'low-stock' && `Only ${selectedVariant.stock} left in stock`}
                    {stockStatus === 'in-stock' && 'In Stock'}
                  </p>
                )}
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="label">Quantity</legend>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-50 transition-colors"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="px-6 py-2 text-center font-medium min-w-[60px]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant?.stock || 99, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                      disabled={quantity >= (selectedVariant?.stock || 99)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">Max: {selectedVariant?.stock || 0}</span>
                </div>
              </fieldset>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={stockStatus === 'out-of-stock' || cartLoading || !selectedVariant}
                  className="btn btn-primary btn-lg btn-full"
                >
                  {cartLoading ? 'Adding...' : 'Put in Bag'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={stockStatus === 'out-of-stock' || cartLoading || !selectedVariant}
                  className="btn btn-secondary btn-lg btn-full"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Add to wishlist">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Share">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.59 13.51l-1.59 1.59M15.49 19.49l-1.59 1.59M15.49 6.51l-1.59-1.59M8.59 10.49l-1.59-1.59" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-200">
                <div className="p-4 bg-gray-50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-gray-600">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-500">On orders over $200</p>
                </div>
                <div className="p-4 bg-gray-50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-gray-600">
                    <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-.87-6.8-2.4l-6.8 1.02a.5.5 0 0 1-.48-.64l1.06-6.77A9 9 0 0 1 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
                  </svg>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-gray-500">30-day return policy</p>
                </div>
                <div className="p-4 bg-gray-50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-gray-600">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <path d="M1 12h22M9 4v16M15 4v16" />
                  </svg>
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="section bg-gray-50" aria-labelledby="related-heading">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 id="related-heading" className="section-title">You May Also Like</h2>
              <a href="/shop" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                View all →
              </a>
            </div>
            <div className="product-grid">
              {relatedProducts.map((related, index) => (
                <motion.article
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="card group"
                >
                  <Link href={`/product/${related.slug}`} className="block" aria-label={`View ${related.name}`}>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={related.images[0]?.url || ''}
                        alt={related.images[0]?.alt || related.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      {related.isNewArrival && <span className="absolute top-3 left-3 badge badge-new">New</span>}
                      {related.salePrice && (
                        <span className="absolute top-3 left-3 badge badge-sale">
                          -{calculateDiscount(Number(related.basePrice), Number(related.salePrice))}%
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-1.5">
                        {related.category?.name || 'Dresses'}
                      </p>
                      <h3 className="font-serif text-lg font-medium mb-2 group-hover:text-gray-500 transition-colors">
                        {related.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {related.salePrice ? (
                          <>
                            <span className="font-medium">{formatPrice(Number(related.salePrice))}</span>
                            <span className="text-gray-400 line-through text-sm">{formatPrice(Number(related.basePrice))}</span>
                          </>
                        ) : (
                          <span className="font-medium">{formatPrice(Number(related.basePrice))}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}