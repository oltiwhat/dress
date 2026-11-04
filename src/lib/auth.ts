import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;
const ADMIN_COOKIE_NAME = 'admin_session';
const USER_COOKIE_NAME = 'user_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function createAdminSession(adminId: string, email: string) {
  const token = generateToken({ userId: adminId, email, role: 'ADMIN' });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function createUserSession(userId: string, email: string) {
  const token = generateToken({ userId, email, role: 'USER' });
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function destroyUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return null;
  }
  const admin = await prisma.admin.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });
  return admin;
}

export async function requireUser() {
  const session = await getUserSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  return user;
}