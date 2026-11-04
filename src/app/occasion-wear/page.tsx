import type { Metadata } from 'next';
import { ShopListing, ShopSearchParams } from '@/app/shop/ShopListing';

export const metadata: Metadata = {
  title: 'Occasion Wear',
  description: 'Discover dresses for weddings, celebrations, and the moments worth dressing up for.',
};

export default async function OccasionWearPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  return (
    <ShopListing
      searchParams={await searchParams}
      collection={{
        title: 'Occasion Wear',
        description: 'Find the right dress for weddings, celebrations, and unforgettable evenings.',
        basePath: '/occasion-wear',
        category: 'wedding-dress',
      }}
    />
  );
}