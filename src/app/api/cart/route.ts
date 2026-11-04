import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';
import { z } from 'zod';

const cartItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid(),
  quantity: z.number().int().positive().default(1),
});

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ items: [] });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
              },
            },
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isMain: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ items: cart?.items || [] });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, variantId, quantity } = cartItemSchema.parse(body);

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.isActive || variant.stock < quantity) {
      return NextResponse.json({ error: 'Product not available' }, { status: 400 });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.userId },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > variant.stock) {
        return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isMain: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ items: updatedCart?.items || [] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { variantId, quantity } = z.object({
      variantId: z.string().cuid(),
      quantity: z.number().int().min(0),
    }).parse(body);

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      });
    } else {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant || variant.stock < quantity) {
        return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
      }

      await prisma.cartItem.update({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
        data: { quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isMain: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ items: updatedCart?.items || [] });
  } catch (error) {
    console.error('Cart PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { variantId, newVariantId } = z.object({
      variantId: z.string().cuid(),
      newVariantId: z.string().cuid(),
    }).parse(body);

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const newVariant = await prisma.productVariant.findUnique({
      where: { id: newVariantId },
    });

    if (!newVariant || !newVariant.isActive || newVariant.stock < existingItem.quantity) {
      return NextResponse.json({ error: 'Variant not available' }, { status: 400 });
    }

    const duplicateItem = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId: newVariantId } },
    });

    if (duplicateItem) {
      await prisma.cartItem.delete({ where: { id: existingItem.id } });
      await prisma.cartItem.update({
        where: { id: duplicateItem.id },
        data: { quantity: duplicateItem.quantity + existingItem.quantity },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { variantId: newVariantId, productId: newVariant.productId },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isMain: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ items: updatedCart?.items || [] });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ items: [] });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}