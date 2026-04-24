'use client';
import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  isAdded: boolean;
}

export default function ProductCard({ product, onAddToCart, isAdded }: ProductCardProps) {
  return (
    <div className="group">
      <div className="bg-surface-container-lowest rounded-[1.5rem] p-4 transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(44,47,49,0.1)] hover:-translate-y-1 relative">
        <Link href={`/product/${product._id}`}>
          <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-4 cursor-pointer">
              <img
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={product.imageUrl || `https://placehold.co/400x400/e8f5e9/2e7d32?text=${encodeURIComponent(product.name)}`}
              />
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-start">
              <h3 className="font-headline font-bold text-on-surface text-sm leading-tight">{product.name}</h3>
              <span className="font-headline font-extrabold text-primary text-sm ml-2 whitespace-nowrap">₹{product.price.toFixed(2)}</span>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-label">{product.category}</span>
          </div>
        </Link>
        <button
          onClick={() => onAddToCart(product)}
          className={`w-full py-2 px-3 rounded-xl font-bold font-headline transition-all text-sm flex items-center justify-center gap-1.5 relative z-10 ${
            isAdded
              ? 'bg-green-500 text-white scale-95'
              : 'bg-surface-container-highest group-hover:bg-primary group-hover:text-on-primary'
          }`}
        >
          {isAdded ? (
            <><span className="material-symbols-outlined text-base leading-none">check</span> Added!</>
          ) : (
            <><span className="material-symbols-outlined text-base leading-none">add_shopping_cart</span> Add to Basket</>
          )}
        </button>
      </div>
    </div>
  );
}
