import type { Metadata } from 'next';
import { ShopListing, ShopSearchParams } from '@/app/shop/ShopListing';

export const metadata: Metadata = {
  title: 'Dresses',
  description: 'Explore the complete Fustana dress collection, from everyday styles to statement pieces.',
};

export default async function DressesPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  return (
    <ShopListing
      searchParams={await searchParams}
      collection={{
        title: 'All Dresses',
        description: 'Explore the full collection of considered silhouettes for every day and every occasion.',
        basePath: '/dresses',
      }}
    />
  );
}