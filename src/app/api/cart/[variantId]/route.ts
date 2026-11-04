import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { variantId } = await params;

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, variantId },
    });

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
    console.error('Cart item DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}