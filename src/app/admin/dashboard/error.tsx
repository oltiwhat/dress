'use client';

import { AdminSidebar } from '@/components/AdminSidebar';

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="min-h-screen pt-28 lg:ml-64 lg:pt-0">
        <div className="container flex min-h-[60vh] max-w-xl flex-col items-start justify-center py-12">
          <p className="section-eyebrow">Dashboard unavailable</p>
          <h1 className="font-serif text-3xl font-medium">Store data could not be loaded.</h1>
          <p className="mt-3 text-gray-600">Check that PostgreSQL is running, then retry.</p>
          <button type="button" onClick={reset} className="btn btn-primary mt-6">Retry</button>
        </div>
      </main>
    </div>
  );
}