'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DeliveryTaskList from '@/components/features/delivery/DeliveryTaskList';
import { PackageCheck, ClipboardList, TrendingUp, Package, CheckCircle } from 'lucide-react';
import { fetchAllOrders, fetchAvailableOrders, updateOrderStatus, Order } from '@/lib/api';
import { io } from 'socket.io-client';

export default function DeliveryDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [viewStatus, setViewStatus] = useState<'active' | 'completed' | 'available'>('available');
  const [sortType, setSortType] = useState<'newest' | 'priority'>('newest');

  const riderId = (session?.user as any)?.id;

  const loadData = useCallback(async () => {
    if (!riderId) return;
    setLoading(true);
    try {
      const [assigned, available] = await Promise.all([
        fetchAllOrders({ deliveryBoyId: riderId }),
        fetchAvailableOrders(),
      ]);
      setMyOrders(assigned);
      setAvailableOrders(available);
    } catch (error) {
      console.error('[Rider] Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user && (session.user as any).role !== 'Delivery Boy')) {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadData();
    }
  }, [session, status, router, loadData]);

  // Socket.io for live updates
  useEffect(() => {
    if (!session?.user) return;
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
    const socket = io(SOCKET_URL);
    socket.on('new_order', () => loadData());
    socket.on('order_updated', () => loadData());
    return () => { socket.disconnect(); };
  }, [session, loadData]);

  const handleAcceptOrder = async (order: Order) => {
    setAccepting(order._id);
    try {
      await updateOrderStatus(order._id, 'Accepted', riderId);
      await loadData(); // Refresh both lists
      setViewStatus('active'); // Switch to active tab after accepting
    } catch (err) {
      console.error('Failed to accept order:', err);
      alert('Failed to accept order. Please try again.');
    } finally {
      setAccepting(null);
    }
  };

  // Derived Stats
  const activeOrders = myOrders.filter(o => ['Accepted', 'Out for Delivery'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'Delivered');
  const totalRelevant = activeOrders.length + completedOrders.length;
  const performance = totalRelevant > 0
    ? Math.round((completedOrders.length / totalRelevant) * 100)
    : 100;

  if (status === 'loading') return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 w-48 bg-surface-container-low rounded-xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-container-low rounded-3xl" />)}
      </div>
      <div className="h-96 bg-surface-container-low rounded-3xl" />
    </div>
  );

  const displayOrders = viewStatus === 'active'
    ? activeOrders
    : viewStatus === 'completed'
    ? completedOrders
    : [];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-10 border-b border-outline-variant/5 pb-8">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface mb-2 whitespace-nowrap">
            {viewStatus === 'active' ? 'My Tasks' : viewStatus === 'completed' ? 'Delivery History' : 'Available Orders'}
          </h1>
          <p className="text-on-surface-variant font-medium flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            Online & Ready
          </p>
        </div>
        <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10 shadow-inner">
          <button
            onClick={() => setSortType('newest')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${sortType === 'newest' ? 'bg-surface text-primary shadow-lg shadow-primary/5' : 'text-on-surface-variant hover:text-on-surface'}`}
          >Newest</button>
          <button
            onClick={() => setSortType('priority')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${sortType === 'priority' ? 'bg-surface text-primary shadow-lg shadow-primary/5' : 'text-on-surface-variant hover:text-on-surface'}`}
          >Priority</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'New Orders',
            icon: Package,
            val: availableOrders.length.toString().padStart(2, '0'),
            color: 'text-violet-500',
            bg: 'bg-violet-500/10',
            view: 'available' as const,
          },
          {
            label: 'Active Tasks',
            icon: ClipboardList,
            val: activeOrders.length.toString().padStart(2, '0'),
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            view: 'active' as const,
          },
          {
            label: 'Completed',
            icon: PackageCheck,
            val: completedOrders.length.toString().padStart(2, '0'),
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            view: 'completed' as const,
          },
          {
            label: 'Performance',
            icon: TrendingUp,
            val: `${performance}%`,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            view: null,
          },
        ].map(s => (
          <button
            key={s.label}
            disabled={!s.view}
            onClick={() => s.view && setViewStatus(s.view)}
            className={`bg-surface-container-lowest rounded-[2rem] p-5 border transition-all group overflow-hidden relative text-left w-full ${s.view && viewStatus === s.view ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-outline-variant/10 shadow-sm hover:shadow-md'}`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${s.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
                <s.icon size={20} />
              </div>
              <p className="text-3xl font-black font-headline text-on-surface">{s.val}</p>
            </div>
            <p className="text-xs font-black font-label text-on-surface-variant uppercase tracking-widest relative z-10">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Available Orders Pool */}
      {viewStatus === 'available' && (
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => <div key={i} className="h-40 bg-surface-container-low rounded-3xl" />)}
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest/50 rounded-[2.5rem] border border-outline-variant/5">
              <Package size={80} strokeWidth={1} className="mx-auto mb-6 text-on-surface-variant/20" />
              <h2 className="text-2xl font-bold font-headline mb-2">No orders here</h2>
              <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
                When customers place orders, they will appear here for you to accept.
              </p>
            </div>
          ) : (
            availableOrders.map(order => (
              <div key={order._id} className="bg-surface rounded-3xl shadow-sm border border-outline-variant/10 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">New Order</p>
                    <h2 className="text-xl font-black font-headline tracking-tight">#{order._id.slice(-8).toUpperCase()}</h2>
                    <p className="text-primary text-lg font-black mt-0.5">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-violet-100 text-violet-700 text-xs font-black rounded-2xl uppercase tracking-widest">
                    Awaiting Pickup
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  <span className="font-medium">{order.deliveryAddress}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {order.products.map((p, i) => {
                    const prod = typeof p.productId === 'object' ? p.productId as any : null;
                    return (
                      <span key={i} className="bg-surface-container-high text-xs font-bold px-3 py-1.5 rounded-xl">
                        {p.quantity}x {prod?.name || 'Item'}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => handleAcceptOrder(order)}
                  disabled={accepting === order._id}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-4 rounded-2xl font-black font-headline text-sm hover:scale-[1.02] shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <CheckCircle size={18} strokeWidth={2.5} />
                  {accepting === order._id ? 'Accepting...' : 'ACCEPT ORDER'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Assigned Tasks */}
      {viewStatus !== 'available' && (
        <div className="bg-surface-container-lowest/50 rounded-[2.5rem] border border-outline-variant/5">
          <DeliveryTaskList
            orders={displayOrders}
            loading={loading}
            sortType={sortType}
            onUpdate={loadData}
          />
        </div>
      )}
    </div>
  );
}
