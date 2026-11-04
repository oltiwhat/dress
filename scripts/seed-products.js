const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
  {
    slug: 'thea-satin-gown',
    name: 'Thea Satin Gown',
    description: 'A fluid satin column gown shaped for evening events, dinners, and understated glamour.',
    shortDescription: 'Fluid satin column gown',
    basePrice: '420.00',
    salePrice: '360.00',
    sku: 'FST-THA-001',
    category: 'evening-wear',
    isNewArrival: true,
    isFeatured: true,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1000&q=85',
    variants: [
      { size: 'XS', color: 'Black', sku: 'FST-THA-001-BLK-XS', stock: 3 },
      { size: 'S', color: 'Black', sku: 'FST-THA-001-BLK-S', stock: 4 },
      { size: 'M', color: 'Black', sku: 'FST-THA-001-BLK-M', stock: 2 },
    ],
  },
  {
    slug: 'celeste-slip-dress',
    name: 'Celeste Slip Dress',
    description: 'A refined slip silhouette with a soft drape and minimalist finish for late summer nights.',
    shortDescription: 'Minimalist satin slip dress',
    basePrice: '280.00',
    salePrice: null,
    sku: 'FST-CEL-002',
    category: 'evening-wear',
    isNewArrival: true,
    isFeatured: false,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
    variants: [
      { size: 'S', color: 'Navy', sku: 'FST-CEL-002-NAV-S', stock: 5 },
      { size: 'M', color: 'Navy', sku: 'FST-CEL-002-NAV-M', stock: 4 },
      { size: 'L', color: 'Emerald', sku: 'FST-CEL-002-EML-L', stock: 2 },
    ],
  },
  {
    slug: 'cassia-column-dress',
    name: 'Cassia Column Dress',
    description: 'An architectural column dress with elegant movement, designed for wedding weekends and formal portraits.',
    shortDescription: 'Elegant wedding guest dress',
    basePrice: '620.00',
    salePrice: '520.00',
    sku: 'FST-CAS-003',
    category: 'wedding-dress',
    isNewArrival: true,
    isFeatured: true,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
    variants: [
      { size: '6', color: 'Ivory', sku: 'FST-CAS-003-IVY-6', stock: 2 },
      { size: '8', color: 'Ivory', sku: 'FST-CAS-003-IVY-8', stock: 3 },
      { size: '10', color: 'Champagne', sku: 'FST-CAS-003-CHP-10', stock: 2 },
    ],
  },
  {
    slug: 'sienna-celebration-dress',
    name: 'Sienna Celebration Dress',
    description: 'Softly sculpted with a vintage-inspired neckline and graceful sweep, ideal for celebrations and receptions.',
    shortDescription: 'Softly sculpted celebration dress',
    basePrice: '410.00',
    salePrice: null,
    sku: 'FST-SIE-004',
    category: 'wedding-dress',
    isNewArrival: false,
    isFeatured: false,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85',
    variants: [
      { size: 'S', color: 'Blush', sku: 'FST-SIE-004-BLS-S', stock: 4 },
      { size: 'M', color: 'Blush', sku: 'FST-SIE-004-BLS-M', stock: 3 },
      { size: 'L', color: 'Champagne', sku: 'FST-SIE-004-CHP-L', stock: 2 },
    ],
  },
  {
    slug: 'evelyn-rose-dress',
    name: 'Evelyn Rose Dress',
    description: 'An elevated midi silhouette in a flattering fit made for garden parties and romantic evenings.',
    shortDescription: 'Elevated midi silhouette',
    basePrice: '310.00',
    salePrice: '275.00',
    sku: 'FST-EVE-005',
    category: 'wedding-dress',
    isNewArrival: false,
    isFeatured: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
    variants: [
      { size: '8', color: 'Rose', sku: 'FST-EVE-005-ROS-8', stock: 3 },
      { size: '10', color: 'Rose', sku: 'FST-EVE-005-ROS-10', stock: 2 },
    ],
  },
];

async function main() {
  for (const product of products) {
    const existing = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        basePrice: new Prisma.Decimal(product.basePrice),
        salePrice: product.salePrice ? new Prisma.Decimal(product.salePrice) : null,
        sku: product.sku,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
        category: { connect: { slug: product.category } },
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        basePrice: new Prisma.Decimal(product.basePrice),
        salePrice: product.salePrice ? new Prisma.Decimal(product.salePrice) : null,
        sku: product.sku,
        category: { connect: { slug: product.category } },
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
      },
    });

    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: {
          productId_size_color: {
            productId: existing.id,
            size: variant.size,
            color: variant.color,
          },
        },
        update: {
          stock: variant.stock,
          sku: variant.sku,
          isActive: true,
        },
        create: {
          productId: existing.id,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          stock: variant.stock,
          isActive: true,
        },
      });
    }

    const imageExists = await prisma.productImage.findFirst({
      where: { productId: existing.id },
    });

    if (!imageExists) {
      await prisma.productImage.create({
        data: {
          productId: existing.id,
          url: product.image,
          alt: product.name,
          isMain: true,
          sortOrder: 0,
        },
      });
    } else if (imageExists.url === '/images/fashion-placeholder.svg') {
      await prisma.productImage.update({
        where: { id: imageExists.id },
        data: { url: product.image, alt: product.name, isMain: true, sortOrder: 0 },
      });
    }
  }

  const counts = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*) FROM "Product") AS product_count,
      (SELECT COUNT(*) FROM "ProductVariant") AS variant_count,
      (SELECT COUNT(*) FROM "ProductImage") AS image_count;
  `;

  const summary = counts[0];
  console.log({
    product_count: Number(summary.product_count),
    variant_count: Number(summary.variant_count),
    image_count: Number(summary.image_count),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
