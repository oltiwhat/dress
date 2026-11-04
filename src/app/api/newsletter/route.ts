import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);

    const existing = await prisma.setting.findUnique({
      where: { key: `newsletter_${email}` },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already subscribed' });
    }

    await prisma.setting.create({
      data: {
        key: `newsletter_${email}`,
        value: JSON.stringify({ email, subscribedAt: new Date().toISOString() }),
      },
    });

    return NextResponse.json({ message: 'Subscribed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}