'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product } from '@/lib/api';
import Link from 'next/link';
import InventoryTable from '@/components/features/admin/InventoryTable';
import ProductModal from '@/components/features/admin/ProductModal';

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user && (session.user as any).role !== 'Admin')) {
      router.push('/login');
    }
  }, [session, status, router]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try { setProducts(await fetchProducts()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (session) loadProducts(); }, [session, loadProducts]);

  const handleSave = async (form: Partial<Product>) => {
    setSaving(true);
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct._id, form);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? updated : p));
      } else {
        const created = await createProduct(form as any);
        setProducts(prev => [created, ...prev]);
      }
      setModalOpen(false);
      setEditingProduct(null);
    } catch (e) { alert('Failed to save product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch { alert('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  if (status === 'loading') return <div className="p-10 font-bold">Loading Admin...</div>;

  return (
    <main className="pt-20 pb-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6">
      <div className="py-6 flex items-center gap-4 mb-2">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1 text-left">
          <h1 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">Inventory Manager</h1>
          <p className="text-on-surface-variant font-body text-sm mt-0.5">{products.length} products total</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setModalOpen(true); }}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-headline text-sm hover:scale-[1.02] transition-transform shadow-lg"
        >
          Add Product
        </button>
      </div>

      <InventoryTable 
        products={products} 
        loading={loading} 
        onEdit={(p) => { setEditingProduct(p); setModalOpen(true); }} 
        onDelete={handleDelete} 
        deletingId={deletingId} 
      />

      {modalOpen && (
        <ProductModal 
          editingProduct={editingProduct} 
          onClose={() => { setModalOpen(false); setEditingProduct(null); }} 
          onSave={handleSave} 
          saving={saving} 
        />
      )}
    </main>
  );
}
