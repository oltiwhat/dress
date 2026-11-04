import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().cuid(),
    variantId: z.string().cuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  shipping: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    country: z.string().min(1),
    city: z.string().min(1),
    address: z.string().min(1),
    postalCode: z.string().min(1),
    saveInfo: z.boolean().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shipping } = checkoutSchema.parse(body);

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: items.map((item) => item.variantId) }, isActive: true },
      include: { product: true },
    });
    const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
    const requestedQuantities = new Map<string, number>();

    for (const item of items) {
      const variant = variantsById.get(item.variantId);
      if (!variant || variant.productId !== item.productId || !variant.product.isActive) {
        return NextResponse.json({ error: 'One or more cart items are no longer available' }, { status: 400 });
      }
      requestedQuantities.set(item.variantId, (requestedQuantities.get(item.variantId) ?? 0) + item.quantity);
    }

    for (const [variantId, quantity] of Array.from(requestedQuantities.entries())) {
      const variant = variantsById.get(variantId)!;
      if (variant.stock < quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${variant.size} / ${variant.color}` }, { status: 400 });
      }
    }

    const pricedItems = items.map((item) => {
      const variant = variantsById.get(item.variantId)!;
      const price = variant.product.salePrice ?? variant.product.basePrice;
      return {
        ...item,
        size: variant.size,
        color: variant.color,
        priceInCents: Math.round(Number(price) * 100),
      };
    });

    const subtotal = pricedItems.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
    const shippingCost = subtotal > 20000 ? 0 : 1500;
    const calculatedTotal = subtotal + shippingCost;

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.userId,
        email: shipping.email,
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        phone: shipping.phone,
        country: shipping.country,
        city: shipping.city,
        address: shipping.address,
        postalCode: shipping.postalCode,
        subtotal: subtotal / 100,
        shippingCost: shippingCost / 100,
        total: calculatedTotal / 100,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentProvider: 'stripe',
        items: {
          create: pricedItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.priceInCents / 100,
            size: item.size,
            color: item.color,
          })),
        },
      },
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculatedTotal,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.userId,
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
    });

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: calculatedTotal / 100,
        currency: 'USD',
        status: 'PENDING',
        provider: 'stripe',
        providerPaymentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}