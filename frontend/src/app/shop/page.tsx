import React, { Suspense } from 'react';
import ShopHero from '@/components/features/shop/ShopHero';
import ProductFeed from '@/components/features/shop/ProductFeed';

export default function ShopPage() {
  return (
    <main className="pt-20 pb-24 md:pb-8 max-w-7xl mx-auto px-4 sm:px-6">
      <ShopHero />
      <Suspense fallback={<div className="py-16 text-center">Loading products…</div>}><ProductFeed /></Suspense>
    </main>
  );
}
