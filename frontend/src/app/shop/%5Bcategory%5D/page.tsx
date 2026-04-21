import React from 'react';
import ProductFeed from '@/components/features/shop/ProductFeed';
import Link from 'next/link';

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = decodeURIComponent(params.category);
  
  return (
    <main className="pt-24 pb-24 md:pb-8 max-w-7xl mx-auto px-4 sm:px-6 min-h-screen">
      <div className="mb-8">
        <Link href="/shop" className="text-primary font-bold flex items-center gap-1 hover:underline mb-4">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Shop
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-on-surface capitalize">
          {category}
        </h1>
      </div>
      
      <ProductFeed initialCategory={category} hideFilters={true} />

      {/* FAB Cart */}
      <Link
        href="/cart"
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-on-primary-container rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90 z-40"
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart_checkout</span>
      </Link>
    </main>
  );
}
