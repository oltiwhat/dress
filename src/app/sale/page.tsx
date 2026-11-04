import type { Metadata } from 'next';
import { ShopListing, ShopSearchParams } from '@/app/shop/ShopListing';

export const metadata: Metadata = {
  title: 'Sale',
  description: 'Shop selected Fustana dresses at special prices while available.',
};

export default async function SalePage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  return (
    <ShopListing
      searchParams={await searchParams}
      collection={{
        title: 'The Sale Edit',
        description: 'Discover considered styles at special prices, available while stocks last.',
        basePath: '/sale',
        filter: 'sale',
      }}
    />
  );
}