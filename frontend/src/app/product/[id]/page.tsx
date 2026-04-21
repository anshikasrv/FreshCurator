'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/cartSlice';
import { fetchProduct, Product } from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id as string)
      .then(setProduct)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ id: product._id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <main className="pt-24 pb-24 max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square rounded-[2rem] bg-surface-container-low" />
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-surface-container-low rounded w-3/4" />
            <div className="h-6 bg-surface-container-low rounded w-1/4" />
            <div className="h-4 bg-surface-container-low rounded" />
            <div className="h-4 bg-surface-container-low rounded w-5/6" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) return null;

  return (
    <main className="pt-24 pb-24 max-w-4xl mx-auto px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 font-body">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-on-surface font-semibold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Image */}
        <div className="aspect-square rounded-[2rem] overflow-hidden bg-surface-container-low shadow-xl">
          <img
            src={product.imageUrl || `https://placehold.co/600x600/e8f5e9/2e7d32?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold font-label mb-3">
              {product.category}
            </span>
            <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-3xl font-extrabold text-primary font-headline">
              ${product.price.toFixed(2)}
              <span className="text-sm text-on-surface-variant font-body font-normal ml-2">per unit</span>
            </p>
          </div>

          {product.description && (
            <p className="text-on-surface-variant font-body leading-relaxed text-base">
              {product.description}
            </p>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full text-xs font-label">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Quality Badges */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'eco', label: 'Certified Organic' },
              { icon: 'local_shipping', label: 'Same-day Delivery' },
              { icon: 'verified', label: 'Quality Guaranteed' },
              { icon: 'agriculture', label: 'Farm Direct' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-xl">{b.icon}</span>
                <span className="text-xs font-semibold text-on-surface font-label">{b.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-bold font-headline text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                added
                  ? 'bg-green-500 text-white scale-95'
                  : 'bg-gradient-to-br from-primary to-primary-container text-on-primary-container shadow-lg shadow-primary/20 hover:scale-[1.02]'
              }`}
            >
              <span className="material-symbols-outlined">{added ? 'check_circle' : 'add_shopping_cart'}</span>
              {added ? 'Added to Basket!' : 'Add to Basket'}
            </button>
            <Link
              href="/cart"
              className="w-full py-4 rounded-xl font-bold font-headline text-base border-2 border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">shopping_basket</span>
              View Basket
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
