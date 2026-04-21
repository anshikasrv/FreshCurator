'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderManagement from '@/components/features/admin/OrderManagement';

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated' || (session?.user && (session.user as any).role !== 'Admin')) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') return <div className="p-10 font-bold">Loading Admin...</div>;

  return (
    <main className="pt-20 pb-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6">
      <div className="py-6 flex items-center gap-4 mb-4">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1 text-left">
          <h1 className="text-3xl font-extrabold font-headline tracking-tight">Order Management</h1>
          <p className="text-on-surface-variant font-body text-sm mt-0.5">Real-time oversight of all customer orders</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-full font-label font-bold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Connected
        </div>
      </div>

      <OrderManagement />
    </main>
  );
}
