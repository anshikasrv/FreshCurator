'use client';
import React, { useState } from 'react';
import { Product } from '@/lib/api';

interface InventoryTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export default function InventoryTable({ products, loading, onEdit, onDelete, deletingId }: InventoryTableProps) {
  const [filterCat, setFilterCat] = useState('All');
  const [searchQ, setSearchQ] = useState('');
  const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Other'];

  const filtered = products
    .filter(p => filterCat === 'All' || p.category === filterCat)
    .filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterCat === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface-container-lowest rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Tags</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-surface-container-high flex-shrink-0 text-left border border-outline-variant/10">
                          <img src={p.imageUrl || `https://placehold.co/100x100/e8f5e9/2e7d32?text=${encodeURIComponent(p.name.charAt(0))}`} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold font-headline text-sm text-on-surface">{p.name}</p>
                          <p className="text-xs text-on-surface-variant truncate max-w-[200px]">{p.description || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">{p.category}</span></td>
                    <td className="px-6 py-4 font-extrabold font-headline text-primary">₹{p.price.toFixed(2)}</td>
                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{(p.tags || []).map(t => <span key={t} className="bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-full text-xs">#{t}</span>)}</div></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEdit(p)} className="p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => onDelete(p._id)} disabled={deletingId === p._id} className="p-2 rounded-xl hover:bg-red-50 transition-colors text-on-surface-variant hover:text-red-600 disabled:opacity-50">
                          <span className="material-symbols-outlined text-base">{deletingId === p._id ? 'progress_activity' : 'delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2">inventory_2</span>
                    No products match your filters
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
