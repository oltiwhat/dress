import { AdminSidebar } from '@/components/AdminSidebar';

export function AdminPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="min-h-screen pt-28 lg:ml-64 lg:pt-0">{children}</main>
    </div>
  );
}