import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Categories } from '@/components/Categories';
import { BrandStory } from '@/components/BrandStory';
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Premium Dress Boutique',
  description: 'Discover elegant dresses for every occasion. Premium quality, timeless designs, and effortless style.',
  openGraph: {
    title: 'Fustana | Premium Dress Boutique',
    description: 'Discover elegant dresses for every occasion.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <Hero />
        <FeaturedProducts />
        <Categories />
        <BrandStory />
        <Newsletter />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}