import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminLogin } from './AdminLogin';
import { getAdminSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  
  if (!session) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}