'use client';
import React, { Suspense } from 'react';
import DeliveryMapTracker from '@/components/features/delivery/DeliveryMapTracker';
import Link from 'next/link';
import OrderChat from '@/components/features/orders/OrderChat';
import { useSearchParams } from 'next/navigation';

export default function DeliveryMapPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  return (
    <main className="pt-20 pb-24 min-h-screen max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="py-6 flex items-center gap-4 mb-4">
        <Link href="/delivery/dashboard" className="p-2 rounded-xl hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold font-headline tracking-tight text-left">Navigation</h1>
          <p className="text-on-surface-variant font-body text-sm text-left">Live Tracking & Route Tips</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-surface-container-low rounded-2xl" />
          <div className="h-[400px] bg-surface-container-low rounded-2xl" />
        </div>
      }>
        <DeliveryMapTracker />
      </Suspense>
      {orderId && <OrderChat orderId={orderId as string} />}
    </main>
  );
}
