'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getSafeImageUrl } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: { url: string; alt: string | null }[];
  category: { name: string; slug: string };
}

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'The Midnight Gown',
    slug: 'midnight-gown',
    basePrice: 485,
    salePrice: null,
    isNewArrival: true,
    isBestSeller: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', alt: 'Midnight Gown' }
    ],
    category: { name: 'Evening', slug: 'evening' },
  },
  {
    id: '2',
    name: 'Silk Chiffon Maxi',
    slug: 'silk-chiffon-maxi',
    basePrice: 320,
    salePrice: 256,
    isNewArrival: false,
    isBestSeller: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', alt: 'Silk Chiffon Maxi' }
    ],
    category: { name: 'Day', slug: 'day' },
  },
  {
    id: '3',
    name: 'Structured Crepe Dress',
    slug: 'structured-crepe-dress',
    basePrice: 295,
    salePrice: null,
    isNewArrival: true,
    isBestSeller: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80', alt: 'Structured Crepe Dress' }
    ],
    category: { name: 'Work', slug: 'work' },
  },
  {
    id: '4',
    name: 'Floral Print Midi',
    slug: 'floral-print-midi',
    basePrice: 245,
    salePrice: 196,
    isNewArrival: false,
    isBestSeller: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80', alt: 'Floral Print Midi' }
    ],
    category: { name: 'Day', slug: 'day' },
  },
];

export function FeaturedProducts() {
  return (
    <section className="section" aria-labelledby="featured-heading">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Selected for you</span>
          <h2 id="featured-heading" className="section-title">The pieces to know</h2>
          <p className="section-subtitle">Modern silhouettes, made for the plans already in your calendar.</p>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="product-card group"
            >
              <Link href="/shop" className="block" aria-label={`Shop ${product.name}`}>
                <div className="product-image-wrap relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={getSafeImageUrl(product.images[0].url)}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  {(product.isNewArrival || product.salePrice || product.isBestSeller) && (
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isNewArrival && <span className="badge badge-new">New</span>}
                      {product.salePrice && <span className="badge badge-sale">Sale</span>}
                      {product.isBestSeller && !product.isNewArrival && !product.salePrice && <span className="badge badge-bestseller">Best Seller</span>}
                    </div>
                  )}
                </div>
                <div className="product-details">
                  <p className="product-category">
                    {product.category.name}
                  </p>
                  <h3 className="product-name group-hover:text-gray-500 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-medium">${product.salePrice.toFixed(2)}</span>
                        <span className="text-gray-400 line-through">${product.basePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-medium">${product.basePrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/shop" className="btn btn-outline">
            View All Dresses
          </Link>
        </div>
      </div>
    </section>
  );
}