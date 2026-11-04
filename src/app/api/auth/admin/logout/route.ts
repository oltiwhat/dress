import { NextRequest, NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await destroyAdminSession();
  return NextResponse.redirect(new URL('/admin', request.url));
}