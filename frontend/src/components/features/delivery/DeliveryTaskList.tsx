'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { updateOrderStatus, fetchAITip, Order } from '@/lib/api';
import Link from 'next/link';
import { Truck, CheckCircle, Brain, MapPin, User, Navigation, X, Lock, BadgeCheck } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Accepted: 'bg-indigo-100 text-indigo-700',
  'Out for Delivery': 'bg-orange-100 text-orange-700',
  Delivered: 'bg-green-100 text-green-700',
};

interface DeliveryTaskListProps {
  orders: Order[];
  loading: boolean;
  sortType: 'newest' | 'priority';
  onUpdate: () => void;
}

export default function DeliveryTaskList({ orders: rawOrders, loading, sortType, onUpdate }: DeliveryTaskListProps) {
  const { data: session } = useSession();
  const [tips, setTips] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [otpModalOrder, setOtpModalOrder] = useState<Order | null>(null);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Sorting logic
  const orders = [...rawOrders].sort((a, b) => {
    if (sortType === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // Priority: 'Out for Delivery' > 'Accepted'
      const statusOrder = { 'Out for Delivery': 0, 'Accepted': 1, 'Delivered': 2 };
      const sA = statusOrder[a.status as keyof typeof statusOrder] ?? 99;
      const sB = statusOrder[b.status as keyof typeof statusOrder] ?? 99;
      if (sA !== sB) return sA - sB;
      // Secondary priority: larger amounts first
      return b.totalAmount - a.totalAmount;
    }
  });

  // AI Tip Fetching
  useEffect(() => {
    orders.forEach(async o => {
      if (o.deliveryAddress && !tips[o._id]) {
        try {
          const tip = await fetchAITip(o.deliveryAddress);
          setTips(prev => ({ ...prev, [o._id]: tip }));
        } catch { /* ignore */ }
      }
    });
  }, [orders, tips]);

  useEffect(() => {
    if (!session) return;
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
    const sock = io(SOCKET_URL);
    setSocket(sock);
    return () => { sock.disconnect(); };
  }, [session]);

  const handleStatusUpdate = async (order: Order, newStatus: Order['status'], otp?: string) => {
    if (newStatus === 'Delivered' && !otp) {
      setOtpModalOrder(order);
      setDeliveryOtp('');
      setOtpError('');
      return;
    }

    setUpdatingId(order._id);
    setOtpError('');
    try {
      await updateOrderStatus(order._id, newStatus, (session?.user as any)?.id, otp);
      if (socket) {
        socket.emit('delivery_status_changed', { orderId: order._id, status: newStatus });
      }
      if (newStatus === 'Delivered') {
        setOtpModalOrder(null);
      }
      onUpdate(); // Trigger parent refresh
    } catch (err: any) {
      if (newStatus === 'Delivered') {
        setOtpError(err.response?.data?.error || 'Invalid OTP');
      } else {
        alert('Failed to update status');
      }
    }
    finally { setUpdatingId(null); }
  };

  if (loading) return (
    <div className="animate-pulse space-y-4 p-8">
      {[1, 2].map(i => <div key={i} className="h-48 bg-surface-container-low rounded-2xl" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-20 px-6">
      <div className="flex justify-center mb-6 text-on-surface-variant/20">
        <Truck size={80} strokeWidth={1} />
      </div>
      <h2 className="text-2xl font-bold font-headline mb-2 text-on-surface">No orders here</h2>
      <p className="text-on-surface-variant font-body text-sm max-w-xs mx-auto">
        When orders match this filter, they will appear here. Keep up the great work!
      </p>
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-8">
      {orders.map(order => (
        <div key={order._id} className="bg-surface rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden text-left hover:shadow-md transition-shadow">
          {/* AI Tip */}
          {tips[order._id] && (
            <div className="bg-gradient-to-r from-tertiary/10 to-primary/5 border-b border-tertiary/10 px-6 py-3 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Brain size={16} className="text-tertiary" />
              </div>
              <div className="flex-1">
                <p className="font-black text-[10px] text-tertiary uppercase tracking-widest mb-0.5">AI RIDER ASSIST</p>
                <p className="text-on-surface text-sm font-semibold italic">"{tips[order._id]}"</p>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-black text-[10px] text-on-surface-variant uppercase tracking-widest">Order Reference</p>
                  <div className="h-[1px] w-8 bg-outline-variant/30" />
                </div>
                <h2 className="text-2xl font-black font-headline tracking-tight">#{order._id.slice(-8).toUpperCase()}</h2>
                <p className="text-primary text-xl font-black mt-1">₹{order.totalAmount.toFixed(2)}</p>
              </div>
              <span className={`px-4 py-2 rounded-2xl text-xs font-black tracking-widest uppercase ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Delivery Address</p>
                    <p className="font-bold text-sm text-on-surface leading-tight">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-on-surface-variant/10 flex items-center justify-center text-on-surface-variant flex-shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Customer Details</p>
                    <p className="font-bold text-sm text-on-surface">{typeof order.userId === 'object' ? order.userId.name : 'Customer'}</p>
                    <p className="text-xs text-on-surface-variant">{typeof order.userId === 'object' ? order.userId.email : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 px-1">Manifest Items</p>
              <div className="flex flex-wrap gap-2">
                {order.products.map((p, i) => {
                  const prod = typeof p.productId === 'object' ? p.productId as any : null;
                  return (
                    <div key={i} className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-2xl group transition-all hover:bg-primary/5 border border-outline-variant/5">
                      <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center text-[10px] font-black text-primary border border-outline-variant/10">
                        {p.quantity}x
                      </div>
                      <span className="text-xs font-bold text-on-surface">
                        {prod?.name || 'Item'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {order.status === 'Accepted' && (
                <button
                  onClick={() => handleStatusUpdate(order, 'Out for Delivery')}
                  disabled={updatingId === order._id}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-2xl font-black font-headline text-sm hover:scale-[1.02] shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Truck size={18} strokeWidth={2.5} />
                  {updatingId === order._id ? 'Updating...' : 'START DELIVERY'}
                </button>
              )}
              {order.status === 'Out for Delivery' && (
                <button
                  onClick={() => handleStatusUpdate(order, 'Delivered')}
                  disabled={updatingId === order._id}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-2xl font-black font-headline text-sm hover:scale-[1.02] shadow-xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <CheckCircle size={18} strokeWidth={2.5} />
                  {updatingId === order._id ? 'Updating...' : 'CONFIRM DELIVERY'}
                </button>
              )}
              {order.status !== 'Delivered' && (
                <Link
                  href={`/delivery/map?address=${encodeURIComponent(order.deliveryAddress || '')}&orderId=${order._id}`}
                  className="flex items-center justify-center gap-2 bg-surface-container-high px-8 py-4 rounded-2xl font-headline font-black text-sm hover:bg-surface-container-highest transition-all active:scale-95 border border-outline-variant/10"
                >
                  <Navigation size={18} strokeWidth={2.5} />
                  MAP
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* OTP Modal */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-300 border border-outline-variant/10">
            <button onClick={() => setOtpModalOrder(null)} className="absolute top-6 right-6 p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
              <X size={24} />
            </button>
            <div className="text-center mb-10 mt-4">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <Lock size={40} className="text-primary" />
              </div>
              <h2 className="text-3xl font-black font-headline tracking-tighter text-on-surface mb-2">Verify Handover</h2>
              <p className="text-sm text-on-surface-variant font-body leading-relaxed px-4">Enter the 6-digit Delivery OTP sent to the customer.</p>
            </div>
            {otpError && (
              <div className="bg-error/5 text-error text-xs text-center mb-6 font-bold py-3 px-4 rounded-2xl border border-error/10 animate-in shake duration-300">
                {otpError}
              </div>
            )}
            <input
              type="text"
              value={deliveryOtp}
              onChange={(e) => setDeliveryOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full text-center text-4xl tracking-[16px] font-mono font-black bg-surface-container-low text-on-surface rounded-2xl py-6 border-none ring-2 ring-outline-variant/20 focus:ring-4 focus:ring-primary/20 focus:bg-surface mb-10 transition-all placeholder:opacity-20"
            />
            <button
              onClick={() => handleStatusUpdate(otpModalOrder, 'Delivered', deliveryOtp)}
              disabled={updatingId === otpModalOrder._id || deliveryOtp.length < 6}
              className="w-full py-5 rounded-[1.5rem] font-black font-headline tracking-tight transition-all text-sm flex items-center justify-center gap-3 bg-primary text-on-primary hover:scale-[1.03] shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:grayscale"
            >
              <BadgeCheck size={20} strokeWidth={3} />
              {updatingId === otpModalOrder._id ? 'VERIFYING...' : 'CONFIRM DELIVERY'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
