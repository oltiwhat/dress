import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('createCategory'), name: z.string().trim().min(1).max(100), slug: z.string().trim().min(1).max(120), description: z.string().max(1000).optional() }),
  z.object({ action: z.literal('createProduct'), name: z.string().trim().min(1), slug: z.string().trim().min(1), sku: z.string().trim().min(1), categoryId: z.string().cuid(), basePrice: z.number().positive(), salePrice: z.number().positive().nullable(), description: z.string().optional(), size: z.string().trim().min(1), color: z.string().trim().min(1), variantSku: z.string().trim().min(1), stock: z.number().int().min(0) }),
  z.object({ action: z.literal('setProductActive'), productId: z.string().cuid(), isActive: z.boolean() }),
  z.object({ action: z.literal('setOrderStatus'), orderId: z.string().cuid(), status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']) }),
  z.object({ action: z.literal('setStock'), variantId: z.string().cuid(), stock: z.number().int().min(0), reason: z.string().max(250).optional() }),
  z.object({ action: z.literal('saveSetting'), key: z.string().trim().min(1).max(100), value: z.string().max(5000) }),
]);

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const input = actionSchema.parse(await request.json());
    switch (input.action) {
      case 'createCategory': {
        const category = await prisma.category.create({
          data: { name: input.name, slug: input.slug, description: input.description || null },
        });
        return NextResponse.json({ success: true, id: category.id });
      }
      case 'createProduct': {
        const product = await prisma.product.create({
          data: {
            name: input.name,
            slug: input.slug,
            sku: input.sku,
            categoryId: input.categoryId,
            basePrice: input.basePrice,
            salePrice: input.salePrice,
            description: input.description || null,
            isActive: true,
            variants: { create: { size: input.size, color: input.color, sku: input.variantSku, stock: input.stock } },
          },
        });
        return NextResponse.json({ success: true, id: product.id });
      }
      case 'setProductActive':
        await prisma.product.update({ where: { id: input.productId }, data: { isActive: input.isActive } });
        return NextResponse.json({ success: true });
      case 'setOrderStatus':
        await prisma.order.update({ where: { id: input.orderId }, data: { status: input.status } });
        return NextResponse.json({ success: true });
      case 'setStock': {
        const variant = await prisma.productVariant.findUnique({ where: { id: input.variantId }, select: { stock: true } });
        if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        await prisma.$transaction([
          prisma.productVariant.update({ where: { id: input.variantId }, data: { stock: input.stock } }),
          prisma.inventoryLog.create({
            data: {
              variantId: input.variantId,
              type: 'set',
              quantity: input.stock - variant.stock,
              previousStock: variant.stock,
              newStock: input.stock,
              reason: input.reason || 'Admin stock adjustment',
            },
          }),
        ]);
        return NextResponse.json({ success: true });
      }
      case 'saveSetting':
        await prisma.setting.upsert({ where: { key: input.key }, create: { key: input.key, value: input.value }, update: { value: input.value } });
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    console.error('Admin update failed:', error);
    return NextResponse.json({ error: 'Unable to complete the admin action' }, { status: 500 });
  }
}