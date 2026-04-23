// 'use client';
// import React, { useEffect, useState, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { fetchAllOrders, fetchProducts, fetchAllUsers, Order, Product, UserRecord } from '@/lib/api';
// import Link from 'next/link';
// import { io } from 'socket.io-client';

// const STATUS_COLORS: Record<string, string> = {
//   Pending: 'bg-yellow-100 text-yellow-700',
//   Placed: 'bg-blue-100 text-blue-700',
//   Accepted: 'bg-indigo-100 text-indigo-700',
//   'Out for Delivery': 'bg-orange-100 text-orange-700',
//   Delivered: 'bg-green-100 text-green-700',
//   Cancelled: 'bg-red-100 text-red-700',
// };

// type Tab = 'overview' | 'inventory' | 'orders' | 'users';

// export default function AdminDashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [tab, setTab] = useState<Tab>('overview');
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [users, setUsers] = useState<UserRecord[]>([]);
//   const [loadingData, setLoadingData] = useState(false);

//   useEffect(() => {
//     if (status === 'unauthenticated' || (session?.user && (session.user as any).role !== 'Admin')) {
//       router.push('/login');
//     }
//   }, [session, status, router]);

//   const loadAll = useCallback(async () => {
//     setLoadingData(true);
//     try {
//       const [o, p, u] = await Promise.all([fetchAllOrders(), fetchProducts(), fetchAllUsers()]);
//       setOrders(o); setProducts(p); setUsers(u);
//     } catch (err) {
//       console.error('[Admin] Failed to load data:', err);
//     } finally { setLoadingData(false); }
//   }, []);

//   useEffect(() => { if (session) loadAll(); }, [session, loadAll]);

//   // Real-time socket for new orders
//   useEffect(() => {
//     const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
//     const socket = io(SOCKET_URL);
//     socket.on('new_order', (order: Order) => {
//       setOrders(prev => [order, ...prev]);
//     });
//     socket.on('order_updated', ({ orderId, status: newStatus }) => {
//       setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
//     });
//     return () => { socket.disconnect(); };
//   }, []);

//   if (status === 'loading') return <div className="p-10 font-bold">Loading...</div>;

//   const TABS: { id: Tab; label: string; icon: string }[] = [
//     { id: 'overview', label: 'Overview', icon: 'dashboard' },
//     { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
//     { id: 'orders', label: 'Orders', icon: 'receipt_long' },
//     { id: 'users', label: 'Users', icon: 'people' },
//   ];

//   const revenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);
//   const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));

//   return (
//     <div className="min-h-full">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6">
//         {/* Header */}
//         <div className="py-6 border-b border-outline-variant/10 mb-6 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">Admin Dashboard</h1>
//             <p className="text-on-surface-variant font-body mt-0.5">Welcome back, {session?.user?.name}</p>
//           </div>
//           <button onClick={loadAll} className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl font-label text-sm hover:bg-surface-container-high transition-colors">
//             <span className={`material-symbols-outlined text-base ${loadingData ? 'animate-spin' : ''}`}>refresh</span>
//             Refresh
//           </button>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
//           {TABS.map(t => (
//             <button
//               key={t.id}
//               onClick={() => setTab(t.id)}
//               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-label text-sm whitespace-nowrap transition-all duration-200 ${
//                 tab === t.id
//                   ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
//                   : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
//               }`}
//             >
//               <span className="material-symbols-outlined text-base">{t.icon}</span>
//               {t.label}
//             </button>
//           ))}
//         </div>

//         {/* OVERVIEW TAB */}
//         {tab === 'overview' && (
//           <div className="space-y-8">
//             {/* Stats */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//               {[
//                 { label: 'Total Revenue', value: `$₹{revenue.toFixed(2)}`, icon: 'payments', color: 'text-green-600', bg: 'bg-green-50', link: '/admin/orders' },
//                 { label: 'Active Orders', value: activeOrders.length, icon: 'local_shipping', color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/orders' },
//                 { label: 'Products Listed', value: products.length, icon: 'inventory_2', color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/inventory' },
//                 { label: 'Registered Users', value: users.length, icon: 'people', color: 'text-orange-600', bg: 'bg-orange-50', link: '/admin/users' },
//               ].map(s => (
//                 <Link
//                   href={s.link}
//                   key={s.label}
//                   className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 hover:scale-[1.02] hover:shadow-md transition-all block group"
//                 >
//                   <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
//                     <span className={`material-symbols-outlined ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
//                   </div>
//                   <p className="text-on-surface-variant font-label text-xs uppercase tracking-wider mb-1">{s.label}</p>
//                   <p className="text-3xl font-extrabold font-headline text-on-surface">{s.value}</p>
//                 </Link>
//               ))}
//             </div>

//             {/* Recent Orders Table */}
//             <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
//               <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
//                 <h2 className="text-lg font-bold font-headline">Recent Orders</h2>
//                 <button onClick={() => setTab('orders')} className="text-primary font-label text-sm font-bold hover:underline">
//                   View all →
//                 </button>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
//                       <th className="px-6 py-3">Order ID</th>
//                       <th className="px-6 py-3">Customer</th>
//                       <th className="px-6 py-3">Amount</th>
//                       <th className="px-6 py-3">Status</th>
//                       <th className="px-6 py-3">Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {orders.slice(0, 8).map(o => (
//                       <tr key={o._id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
//                         <td className="px-6 py-4 font-bold font-headline text-sm">#{o._id.slice(-8).toUpperCase()}</td>
//                         <td className="px-6 py-4 text-sm">{typeof o.userId === 'object' ? o.userId.name : o.userId}</td>
//                         <td className="px-6 py-4 font-bold text-primary">${o.totalAmount.toFixed(2)}</td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
//                             {o.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-on-surface-variant">
//                           {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
//                         </td>
//                       </tr>
//                     ))}
//                     {orders.length === 0 && (
//                       <tr><td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">No orders yet</td></tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* INVENTORY TAB */}
//         {tab === 'inventory' && (
//           <div>
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold font-headline">Product Inventory</h2>
//               <Link href="/admin/inventory" className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-headline text-sm hover:scale-[1.02] transition-transform">
//                 <span className="material-symbols-outlined text-base">open_in_new</span>
//                 Full Inventory Manager
//               </Link>
//             </div>
//             <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
//                       <th className="px-6 py-3">Product</th>
//                       <th className="px-6 py-3">Category</th>
//                       <th className="px-6 py-3">Price</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {products.map(p => (
//                       <tr key={p._id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/50">
//                         <td className="px-6 py-4 flex items-center gap-3">
//                           <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0">
//                             <img src={p.imageUrl || ''} alt={p.name} className="w-full h-full object-cover mix-blend-multiply" />
//                           </div>
//                           <span className="font-bold text-sm">{p.name}</span>
//                         </td>
//                         <td className="px-6 py-4"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">{p.category}</span></td>
//                         <td className="px-6 py-4 font-bold text-primary">${p.price.toFixed(2)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ORDERS TAB */}
//         {tab === 'orders' && (
//           <div>
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold font-headline">All Orders</h2>
//               <Link href="/admin/orders" className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-headline text-sm hover:scale-[1.02] transition-transform">
//                 <span className="material-symbols-outlined text-base">open_in_new</span>
//                 Full Order Manager
//               </Link>
//             </div>
//             <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
//                       <th className="px-6 py-3">Order ID</th>
//                       <th className="px-6 py-3">Customer</th>
//                       <th className="px-6 py-3">Delivery Boy</th>
//                       <th className="px-6 py-3">Amount</th>
//                       <th className="px-6 py-3">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {orders.map(o => (
//                       <tr key={o._id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/50">
//                         <td className="px-6 py-4 font-bold text-sm">#{o._id.slice(-8).toUpperCase()}</td>
//                         <td className="px-6 py-4 text-sm">{typeof o.userId === 'object' ? o.userId.name : o.userId}</td>
//                         <td className="px-6 py-4 text-sm text-on-surface-variant">
//                           {o.deliveryBoyId ? (typeof o.deliveryBoyId === 'object' ? o.deliveryBoyId.name : 'Assigned') : 'Unassigned'}
//                         </td>
//                         <td className="px-6 py-4 font-bold text-primary">${o.totalAmount.toFixed(2)}</td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
//                         </td>
//                       </tr>
//                     ))}
//                     {orders.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">No orders yet</td></tr>}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* USERS TAB */}
//         {tab === 'users' && (
//           <div>
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold font-headline">User Management</h2>
//               <Link href="/admin/users" className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-headline text-sm hover:scale-[1.02] transition-transform">
//                 <span className="material-symbols-outlined text-base">open_in_new</span>
//                 Full User Manager
//               </Link>
//             </div>
//             <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
//                       <th className="px-6 py-3">Name</th>
//                       <th className="px-6 py-3">Email</th>
//                       <th className="px-6 py-3">Role</th>
//                       <th className="px-6 py-3">Joined</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {users.map(u => (
//                       <tr key={u._id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/50">
//                         <td className="px-6 py-4 font-bold text-sm">{u.name}</td>
//                         <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                             u.role === 'Admin' ? 'bg-red-100 text-red-700' :
//                             u.role === 'Delivery Boy' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
//                           }`}>{u.role}</span>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-on-surface-variant">
//                           {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//                         </td>
//                       </tr>
//                     ))}
//                     {users.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant">No users found</td></tr>}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  fetchAllOrders,
  fetchProducts,
  fetchAllUsers,
  fetchAdminStats,
  setAuthToken,
  Order,
  Product,
  UserRecord,
} from "@/lib/api"; // Added setAuthToken
import Link from "next/link";
import { io } from "socket.io-client";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Placed: "bg-blue-100 text-blue-700",
  Accepted: "bg-indigo-100 text-indigo-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

type Tab = "overview" | "inventory" | "orders" | "users";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session?.user && (session.user as any).role !== "Admin")
    ) {
      router.push("/login");
    }
  }, [session, status, router]);

  // const loadAll = useCallback(async () => {
  //   // CRITICAL: Get token from session
  //   const token = (session as any)?.accessToken || (session?.user as any)?.accessToken;
  //   if (!token) return;

  //   setLoadingData(true);
  //   try {
  //     // Set token for axios instance before fetching
  //     setAuthToken(token);

  //     const [o, p, u] = await Promise.all([fetchAllOrders(), fetchProducts(), fetchAllUsers()]);

  //     // Safety check for production data structures
  //     setOrders(Array.isArray(o) ? o : (o as any).orders || []);
  //     setProducts(Array.isArray(p) ? p : (p as any).products || []);
  //     setUsers(Array.isArray(u) ? u : (u as any).users || []);
  //   } catch (err) {
  //     console.error('[Admin] Failed to load data:', err);
  //   } finally { setLoadingData(false); }
  // }, [session]);

  //newly------------------->>>>>>>>>
  const loadAll = useCallback(async () => {
    const token =
      (session as any)?.accessToken || (session?.user as any)?.accessToken;

    if (!token) {
      console.error("Token missing - cannot fetch admin data");
      return;
    }

    setLoadingData(true);
    try {
      // 1. Authorize the request
      setAuthToken(token);

      // 2. Fetch the combined data from your new backend controller
      const data = await fetchAdminStats();
      console.log("ADMIN API RESPONSE:", data);

      // 3. Populate your state arrays
      setOrders(data.orders || []);
      setProducts(data.products || []);
      setUsers(data.users || []);

      console.log("Dashboard synced successfully with live database.");
    } catch (err) {
      console.error("[Admin] Fetch Error:", err);
    } finally {
      setLoadingData(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) loadAll();
  }, [session, loadAll]);

  // Real-time socket for new orders
  useEffect(() => {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000";
    const socket = io(SOCKET_URL);
    socket.on("new_order", (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    });
    socket.on("order_updated", ({ orderId, status: newStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  if (status === "loading")
    return <div className="p-10 font-bold">Loading...</div>;

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "inventory", label: "Inventory", icon: "inventory_2" },
    { id: "orders", label: "Orders", icon: "receipt_long" },
    { id: "users", label: "Users", icon: "people" },
  ];

  const revenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((s, o) => s + o.totalAmount, 0);
  const activeOrders = orders.filter(
    (o) => !["Delivered", "Cancelled"].includes(o.status),
  );

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="py-6 border-b border-outline-variant/10 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-on-surface-variant font-body mt-0.5">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          <button
            onClick={loadAll}
            className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl font-label text-sm hover:bg-surface-container-high transition-colors"
          >
            <span
              className={`material-symbols-outlined text-base ${loadingData ? "animate-spin" : ""}`}
            >
              refresh
            </span>
            Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-label text-sm whitespace-nowrap transition-all duration-200 ${
                tab === t.id
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Revenue",
                  value: `₹${revenue.toLocaleString("en-IN")}`,
                  icon: "payments",
                  color: "text-green-600",
                  bg: "bg-green-50",
                  link: "/admin/orders",
                },
                {
                  label: "Active Orders",
                  value: activeOrders.length,
                  icon: "local_shipping",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  link: "/admin/orders",
                },
                {
                  label: "Products Listed",
                  value: products.length,
                  icon: "inventory_2",
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                  link: "/admin/inventory",
                },
                {
                  label: "Registered Users",
                  value: users.length,
                  icon: "people",
                  color: "text-orange-600",
                  bg: "bg-orange-50",
                  link: "/admin/users",
                },
              ].map((s) => (
                <Link
                  href={s.link}
                  key={s.label}
                  className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 hover:scale-[1.02] hover:shadow-md transition-all block group"
                >
                  <div
                    className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <span
                      className={`material-symbols-outlined ${s.color}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {s.icon}
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-label text-xs uppercase tracking-wider mb-1">
                    {s.label}
                  </p>
                  <p className="text-3xl font-extrabold font-headline text-on-surface">
                    {s.value}
                  </p>
                </Link>
              ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="text-lg font-bold font-headline">
                  Recent Orders
                </h2>
                <button
                  onClick={() => setTab("orders")}
                  className="text-primary font-label text-sm font-bold hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((o) => (
                      <tr
                        key={o._id}
                        className="border-t border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold font-headline text-sm">
                          #{o._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {typeof o.userId === "object"
                            ? (o.userId as any).name
                            : "Customer"}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          ₹{o.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-on-surface-variant"
                        >
                          No orders yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ... Rest of your tabs (Inventory, Orders, Users) ... */}
        {/* Note: Ensure all $ symbols are replaced with ₹ in those tabs as well */}
        {tab === "inventory" && (
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      className="border-t border-outline-variant/10 hover:bg-surface-container-low/50"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0">
                          <img
                            src={p.imageUrl || ""}
                            alt={p.name}
                            className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700 "
                          />
                        </div>
                        <span className="font-bold text-sm">{p.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        ₹{p.price.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB (SUMMARY) */}
        {tab === "orders" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-blue-50">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>

            <div className="p-6 rounded-2xl bg-yellow-50">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === "Pending").length}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-green-50">
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === "Delivered").length}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold">
                ₹
                {orders
                  .filter((o) => o.status === "Delivered")
                  .reduce((sum, o) => sum + o.totalAmount, 0)}
              </p>
            </div>
          </div>
        )}
        {/* USERS TAB (SUMMARY) */}
        {tab === "users" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-orange-50">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50">
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "Admin").length}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-green-50">
              <p className="text-sm text-gray-500">Delivery Boys</p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "Delivery Boy").length}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-100">
              <p className="text-sm text-gray-500">Customers</p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "User").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
