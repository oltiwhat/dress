import type { Metadata } from 'next';
import { ShopListing, ShopSearchParams } from './ShopListing';

export const metadata: Metadata = {
  title: 'Shop All Dresses',
  description: 'Browse our complete collection of premium dresses. Evening wear, day dresses, work essentials, and occasion wear.',
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  return (
    <ShopListing
      searchParams={await searchParams}
      collection={{
        title: 'Shop the edit',
        description: 'Thoughtful silhouettes for every moment, from city mornings to candlelit evenings.',
        basePath: '/shop',
      }}
    />
  );
}
