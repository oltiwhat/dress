import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ShopClient } from './ShopClient';

export interface ShopSearchParams {
  category?: string;
  filter?: string;
  sort?: string;
  page?: string;
  search?: string;
  sizes?: string;
  colors?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}

export interface ShopCollection {
  title: string;
  description: string;
  basePath: string;
  category?: string;
  filter?: string;
}

export async function ShopListing({
  searchParams,
  collection,
}: {
  searchParams: ShopSearchParams;
  collection: ShopCollection;
}) {
  const params = {
    ...searchParams,
    category: collection.category ?? searchParams.category,
    filter: collection.filter ?? searchParams.filter,
  };
  const requestedPage = Number.parseInt(params.page || '1', 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const sizeFilters = params.sizes?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];
  const colorFilters = params.colors?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];
  const minPrice = Number(params.minPrice ?? 0);
  const maxPrice = Number(params.maxPrice ?? 1000);
  const where: Record<string, unknown> = {
    isActive: true,
    variants: { some: { isActive: true, stock: { gt: 0 } } },
  };

  if (params.category) where.category = { slug: params.category };
  if (params.filter === 'new') where.isNewArrival = true;
  else if (params.filter === 'sale') where.salePrice = { not: null };
  else if (params.filter === 'bestseller') where.isBestSeller = true;

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { sku: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const variantFilters: Record<string, unknown> = { isActive: true, stock: { gt: 0 } };
  if (sizeFilters.length) variantFilters.size = { in: sizeFilters };
  if (colorFilters.length) variantFilters.color = { in: colorFilters };
  if (Object.keys(variantFilters).length > 1) {
    where.variants = { some: variantFilters };
  }

  const priceFilter: Record<string, unknown> = {};
  if (Number.isFinite(minPrice) && minPrice > 0) priceFilter.gte = minPrice;
  if (Number.isFinite(maxPrice) && maxPrice < 1000) priceFilter.lte = maxPrice;
  if (Object.keys(priceFilter).length) where.basePrice = priceFilter;

  try {
    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { where: { isMain: true }, take: 1 },
          variants: { where: { isActive: true }, select: { id: true, productId: true, size: true, color: true, stock: true } },
        },
        orderBy: getSortOrder(params.sort),
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    return (
      <ShopClient
        initialProducts={products.map((product) => ({
          ...product,
          basePrice: Number(product.basePrice),
          salePrice: product.salePrice === null ? null : Number(product.salePrice),
        }))}
        initialCategories={categories}
        totalProducts={total}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        currentCategory={params.category}
        currentFilter={params.filter}
        currentSort={params.sort}
        searchQuery={params.search}
        collectionTitle={collection.title}
        collectionDescription={collection.description}
        collectionBasePath={collection.basePath}
      />
    );
  } catch (error) {
    console.error('Shop catalog query failed:', error);
    return (
      <main className="container flex min-h-[60vh] items-center justify-center py-16">
        <section className="max-w-lg text-center" role="alert">
          <p className="section-eyebrow">Catalog unavailable</p>
          <h1 className="font-serif text-3xl font-medium">We can't load the collection right now.</h1>
          <p className="mt-3 text-gray-600">Please try again in a moment.</p>
          <a href={collection.basePath} className="btn btn-primary mt-6">Try again</a>
        </section>
      </main>
    );
  }
}

function getSortOrder(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-asc':
      return [{ basePrice: 'asc' }];
    case 'price-desc':
      return [{ basePrice: 'desc' }];
    case 'popularity':
      return [{ isBestSeller: 'desc' }, { createdAt: 'desc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }];
  }
}