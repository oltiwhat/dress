import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCancellation(paymentIntent);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.paymentStatus === 'SUCCEEDED') return;

    // Update order
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'SUCCEEDED',
      },
    });

    // Update payment
    await tx.payment.update({
      where: { orderId },
      data: {
        status: 'SUCCEEDED',
        providerData: paymentIntent as any,
      },
    });

    // Decrease stock
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      // Log inventory change
      await tx.inventoryLog.create({
        data: {
          variantId: item.variantId,
          type: 'sale',
          quantity: -item.quantity,
          previousStock: item.quantity, // This will be updated after decrement
          newStock: 0, // Will be set correctly
          reason: `Sale - Order ${order.orderNumber}`,
          orderId: order.id,
        },
      });
    }

    // Update inventory logs with correct stock values
    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (variant) {
        await tx.inventoryLog.updateMany({
          where: {
            variantId: item.variantId,
            orderId: order.id,
            type: 'sale',
          },
          data: {
            previousStock: variant.stock + item.quantity,
            newStock: variant.stock,
          },
        });
      }
    }
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
      },
    });

    await tx.payment.update({
      where: { orderId },
      data: {
        status: 'FAILED',
        providerData: paymentIntent as any,
      },
    });
  });
}

async function handlePaymentCancellation(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'CANCELLED',
      },
    });

    await tx.payment.update({
      where: { orderId },
      data: {
        status: 'CANCELLED',
        providerData: paymentIntent as any,
      },
    });
  });
}