import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createUserSession, hashPassword, verifyPassword } from '@/lib/auth';

const authSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('signin'),
    email: z.string().email().transform((value) => value.toLowerCase()),
    password: z.string().min(1),
  }),
  z.object({
    mode: z.literal('register'),
    email: z.string().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
  }),
]);

export async function POST(request: NextRequest) {
  try {
    const input = authSchema.parse(await request.json());
    let user;

    if (input.mode === 'register') {
      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
      if (existingUser) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      user = await prisma.user.create({
        data: {
          email: input.email,
          passwordHash: await hashPassword(input.password),
          firstName: input.firstName,
          lastName: input.lastName,
        },
        select: { id: true, email: true },
      });
    } else {
      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
      if (!existingUser || !(await verifyPassword(input.password, existingUser.passwordHash))) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
      user = { id: existingUser.id, email: existingUser.email };
    }

    await createUserSession(user.id, user.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Check the information you entered' }, { status: 400 });
    }
    console.error('Customer authentication error:', error);
    return NextResponse.json({ error: 'Unable to sign in right now' }, { status: 500 });
  }
}