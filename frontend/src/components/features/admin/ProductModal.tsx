'use client';
import React, { useRef, useState } from 'react';
import { Product } from '@/lib/api';

interface ProductModalProps {
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (form: Partial<Product>) => Promise<void>;
  saving: boolean;
}

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Other'];

export default function ProductModal({ editingProduct, onClose, onSave, saving }: ProductModalProps) {
  const [form, setForm] = useState<Partial<Product>>(editingProduct || { name: '', price: 0, category: 'Vegetables', description: '', imageUrl: '', tags: [] });
  const [uploadingImg, setUploadingImg] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
    const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'freshcurator';
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      setForm(f => ({ ...f, imageUrl: data.secure_url }));
    } catch { alert('Image upload failed'); }
    finally { setUploadingImg(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto text-left">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-headline">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Product Name *</label>
            <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Organic Spinach" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Price (₹) *</label>
              <input type="number" min="0" step="0.01" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Category *</label>
              <select value={form.category || 'Vegetables'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Short product description..." />
          </div>
          <div>
            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Tags</label>
            <div className="bg-surface-container-low rounded-xl px-2 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary/30 border border-transparent">
              {(form.tags || []).map((tag, idx) => (
                <div key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold font-label flex items-center gap-1">
                  {tag}
                  <button onClick={() => setForm(f => ({ ...f, tags: f.tags?.filter((_, i) => i !== idx) }))} className="hover:text-error transition-colors flex items-center text-xs">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
              <input 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
                    e.preventDefault();
                    if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
                      setForm(f => ({ ...f, tags: [...(f.tags || []), tagInput.trim()] }));
                    }
                    setTagInput('');
                  }
                }}
                className="flex-1 bg-transparent border-none px-2 py-1.5 text-on-surface font-body text-sm focus:outline-none min-w-[120px]" 
                placeholder="Type and press Enter" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">Product Image</label>
            <div className="flex gap-3">
              {(localPreview || form.imageUrl) && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 relative border border-outline-variant/10">
                  <img src={localPreview || form.imageUrl} alt="" className="w-full h-full object-cover" />
                  {uploadingImg && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                       <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 flex flex-col gap-2">
                <input value={form.imageUrl || ''} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://image-url.com/..." />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImg} className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl text-sm font-bold font-label hover:bg-surface-container-highest transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-base">{uploadingImg ? 'progress_activity' : 'cloud_upload'}</span>
                  {uploadingImg ? 'Uploading...' : 'Upload Image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold font-headline border-2 border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancel</button>
          <button 
            onClick={() => onSave(form)} 
            disabled={saving || uploadingImg || !form.name || !form.price || !form.imageUrl} 
            className="flex-1 py-3 rounded-xl font-bold font-headline bg-primary text-on-primary hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
          </button>
        </div>
      </div>
    </div>
  );
}
