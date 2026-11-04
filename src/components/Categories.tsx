'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Category {
  name: string;
  slug: string;
  href: string;
  image: string;
  description: string;
}

const categories: Category[] = [
  {
    name: 'All Dresses',
    slug: 'dresses',
    href: '/dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85',
    description: 'Explore the full collection',
  },
  {
    name: 'Evening Wear',
    slug: 'evening-wear',
    href: '/shop?category=evening-wear',
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85',
    description: 'Gowns for after dark',
  },
  {
    name: 'Occasion Wear',
    slug: 'wedding-dress',
    href: '/occasion-wear',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85',
    description: 'For celebrations worth dressing up for',
  },
  {
    name: 'Sale',
    slug: 'sale',
    href: '/sale',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85',
    description: 'Selected styles at special prices',
  },
];

export function Categories() {
  return (
    <section className="section bg-gray-50" aria-labelledby="categories-heading">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Find your fit</span>
          <h2 id="categories-heading" className="section-title">A dress for the occasion</h2>
          <p className="section-subtitle">Explore the edits, from everyday ease to the nights worth dressing up for.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.article
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="category-tile relative group overflow-hidden"
            >
              <Link href={category.href} className="block" aria-label={`Shop ${category.name}`}>
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-serif text-2xl font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-white/80 mb-2">{category.description}</p>
                  <span className="text-xs font-medium tracking-wider uppercase text-white/70">
                    Explore edit →
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}