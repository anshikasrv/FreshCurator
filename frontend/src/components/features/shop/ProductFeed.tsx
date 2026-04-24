'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/cartSlice';
import { fetchProducts, Product } from '@/lib/api';
import ProductCard from './ProductCard';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy'];

const CATEGORY_ICONS: Record<string, string> = {
  All: 'grid_view',
  Vegetables: 'eco',
  Fruits: 'nutrition',
  Dairy: 'water_drop',
};

interface ProductFeedProps {
  initialCategory?: string;
  hideFilters?: boolean;
}

export default function ProductFeed({ initialCategory = 'All', hideFilters = false }: ProductFeedProps) {
  const dispatch = useDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  const loadProducts = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const data = await fetchProducts(cat === 'All' ? undefined : cat);
      setProducts(data);
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(activeCategory);
  }, [activeCategory, loadProducts]);

  const handleAddToCart = (p: Product) => {
    dispatch(addToCart({ id: p._id, name: p.name, price: p.price, quantity: 1, imageUrl: p.imageUrl }));
    setAddedId(p._id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <section id="products" className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-on-surface">
          {activeCategory === 'All' ? "Today's Picks" : `${activeCategory} Collection`}
        </h2>
        <span className="text-sm text-on-surface-variant font-body">{products.length} items</span>
      </div>

      {/* Category Filters */}
      {!hideFilters && (
        <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar py-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-1 sm:px-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[1.5rem] p-4 animate-pulse">
              <div className="aspect-square rounded-xl bg-surface-container-low mb-4" />
              <div className="h-4 bg-surface-container-low rounded mb-2" />
              <div className="h-4 bg-surface-container-low rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">inventory_2</span>
          <p className="font-headline font-bold text-xl">No products found</p>
          <p className="text-sm mt-2">Try a different category or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-1 sm:px-0">
          {products.map(p => (
            <ProductCard 
              key={p._id} 
              product={p} 
              onAddToCart={handleAddToCart} 
              isAdded={addedId === p._id} 
            />
          ))}
        </div>
      )}
    </section>
  );
}
