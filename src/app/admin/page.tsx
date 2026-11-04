import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminLogin } from './AdminLogin';
import { getAdminSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: 'noindex, nofollow',
};

export default async function AdminPage() {
  const session = await getAdminSession();

  if (session) {
    redirect('/admin/dashboard');
  }

  return <AdminLogin />;
}
