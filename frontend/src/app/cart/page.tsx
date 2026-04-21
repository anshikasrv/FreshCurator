'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addToCart, removeFromCart, clearCart } from '@/store/cartSlice';
import Link from 'next/link';

export default function CartPage() {
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  if (items.length === 0) {
    return (
      <main className="pt-24 pb-24 max-w-2xl mx-auto px-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-32 h-32 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant">shopping_basket</span>
          </div>
          <h1 className="text-3xl font-extrabold font-headline text-on-surface mb-3">Your basket is empty</h1>
          <p className="text-on-surface-variant font-body mb-8 max-w-sm mx-auto">
            Looks like you haven&rsquo;t added anything yet. Explore our fresh produce and start filling up!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold font-headline hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined">storefront</span>
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-24 max-w-4xl mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">My Basket</h1>
          <p className="text-on-surface-variant font-body mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-sm text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-base">delete_sweep</span>
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex items-center gap-5 group"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0">
                <img
                  src={item.imageUrl || `https://placehold.co/200x200/e8f5e9/2e7d32?text=${encodeURIComponent(item.name)}`}
                  alt={item.name}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-headline font-bold text-on-surface truncate">{item.name}</h3>
                <p className="text-primary font-extrabold font-headline mt-1">₹{item.price.toFixed(2)} each</p>
              </div>

              <div className="flex flex-col items-end gap-3">
                {/* Quantity Control */}
                <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-2 py-1">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) {
                        dispatch(removeFromCart(item.id));
                      } else {
                        dispatch(addToCart({ ...item, quantity: -1 }));
                      }
                    }}
                    className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">{item.quantity <= 1 ? 'delete' : 'remove'}</span>
                  </button>
                  <span className="font-bold font-headline text-on-surface w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                    className="w-7 h-7 rounded-full bg-primary text-on-primary shadow-sm flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <p className="font-extrabold text-on-surface font-headline">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 sticky top-24">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-5 pb-4 border-b border-outline-variant/10">
              Order Summary
            </h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm font-body">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-on-surface-variant">Delivery</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-on-surface-variant">Tax (5%)</span>
                <span className="font-semibold">₹{(totalAmount * 0.05).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-extrabold font-headline text-lg pt-4 border-t border-outline-variant/10 mb-6">
              <span>Total</span>
              <span className="text-primary">₹{(totalAmount * 1.05).toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold font-headline py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">payment</span>
              Proceed to Checkout
            </Link>
            <Link
              href="/"
              className="w-full mt-3 py-3 rounded-xl font-bold font-headline text-center text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1 text-sm"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
