// 'use client';
// import React, { useEffect, useState, useCallback } from 'react';
// import { fetchAllOrders, fetchAllUsers, updateOrderStatus, Order, UserRecord } from '@/lib/api';
// import { io } from 'socket.io-client';

// const STATUSES = ['All', 'Pending', 'Placed', 'Accepted', 'Out for Delivery', 'Delivered', 'Cancelled'] as const;
// const STATUS_COLORS: Record<string, string> = {
//   Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
//   Placed: 'bg-blue-100 text-blue-700 border-blue-200',
//   Accepted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
//   'Out for Delivery': 'bg-orange-100 text-orange-700 border-orange-200',
//   Delivered: 'bg-green-100 text-green-700 border-green-200',
//   Cancelled: 'bg-red-100 text-red-700 border-red-200',
// };
// const NEXT_STATUS: Record<string, Order['status']> = {
//   Pending: 'Placed',
//   Placed: 'Accepted',
//   Accepted: 'Out for Delivery',
//   'Out for Delivery': 'Delivered',
// };

// export default function OrderManagement() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [users, setUsers] = useState<UserRecord[]>([]);
//   const [filterStatus, setFilterStatus] = useState('All');
//   const [loading, setLoading] = useState(true);
//   const [updatingId, setUpdatingId] = useState<string | null>(null);

//   const loadData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [o, u] = await Promise.all([fetchAllOrders(), fetchAllUsers()]);
//       setOrders(o); setUsers(u);
//     } catch { /* ignore */ }
//     finally { setLoading(false); }
//   }, []);

//   useEffect(() => { loadData(); }, [loadData]);

//   useEffect(() => {
//     const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
//     const socket = io(SOCKET_URL);
//     socket.on('new_order', (order: Order) => setOrders(prev => [order, ...prev]));
//     socket.on('order_updated', ({ orderId, status: s, deliveryBoyId }) => {
//       setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: s, deliveryBoyId: deliveryBoyId || o.deliveryBoyId } : o));
//     });
//     return () => { socket.disconnect(); };
//   }, []);

//   const handleStatusAdvance = async (order: Order) => {
//     const next = NEXT_STATUS[order.status];
//     if (!next) return;
//     setUpdatingId(order._id);
//     try {
//       const updated = await updateOrderStatus(order._id, next);
//       setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: updated.status } : o));
//     } catch { alert('Failed to update status'); }
//     finally { setUpdatingId(null); }
//   };

//   const handleAssignDelivery = async (orderId: string, deliveryBoyId: string) => {
//     try {
//       const updated = await updateOrderStatus(orderId, 'Accepted', deliveryBoyId);
//       setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: updated.status, deliveryBoyId: updated.deliveryBoyId } : o));
//     } catch { alert('Failed to assign'); }
//   };

//   const deliveryBoys = users.filter(u => u.role === 'Delivery Boy');
//   const filtered = orders.filter(o => filterStatus === 'All' || o.status === filterStatus);

//   if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container-lowest rounded-2xl animate-pulse" />)}</div>;

//   return (
//     <div className="space-y-6">
//       <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
//         {STATUSES.map(s => (
//           <button key={s} onClick={() => setFilterStatus(s)}
//             className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterStatus === s ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
//             {s} {s !== 'All' && <span className="ml-1 opacity-70">({orders.filter(o => o.status === s).length})</span>}
//           </button>
//         ))}
//       </div>

//       <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead>
//               <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
//                 <th className="px-6 py-3">Order</th>
//                 <th className="px-6 py-3">Customer</th>
//                 <th className="px-6 py-3">Address</th>
//                 <th className="px-6 py-3">Amount</th>
//                 <th className="px-6 py-3">Status</th>
//                 <th className="px-6 py-3">Delivery Boy</th>
//                 <th className="px-6 py-3 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map(o => (
//                 <tr key={o._id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
//                   <td className="px-6 py-4">
//                     <p className="font-bold font-headline text-sm text-left">#{o._id.slice(-8).toUpperCase()}</p>
//                     <p className="text-xs text-on-surface-variant mt-0.5 text-left">
//                       {new Date(o.createdAt).toLocaleDateString()}
//                     </p>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-left">{typeof o.userId === 'object' ? o.userId.name : 'Customer'}</td>
//                   <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[150px] truncate">{o.deliveryAddress || '—'}</td>
//                   <td className="px-6 py-4 font-extrabold text-primary">₹{o.totalAmount.toFixed(2)}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
//                       {o.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <select
//                       value={typeof o.deliveryBoyId === 'object' ? (o.deliveryBoyId as any)?._id : o.deliveryBoyId || ''}
//                       onChange={e => handleAssignDelivery(o._id, e.target.value)}
//                       className="bg-surface-container-low rounded-xl px-3 py-1.5 text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[130px]"
//                       disabled={o.status === 'Delivered' || o.status === 'Cancelled'}
//                     >
//                       <option value="">Unassigned</option>
//                       {deliveryBoys.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
//                     </select>
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     {NEXT_STATUS[o.status] && (
//                       <button onClick={() => handleStatusAdvance(o)} disabled={updatingId === o._id}
//                         className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary px-3 py-1.5 rounded-xl text-xs font-bold font-label transition-all disabled:opacity-50 whitespace-nowrap ml-auto">
//                         {updatingId === o._id
//                           ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
//                           : <span className="material-symbols-outlined text-sm">arrow_forward</span>
//                         }
//                         → {NEXT_STATUS[o.status].split(' ')[0]}
//                       </button>
//                     )}
//                     {o.status === 'Delivered' && <span className="text-green-600 text-xs font-bold">✓ Done</span>}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react"; // 1. Import useSession
import {
  fetchAllOrders,
  fetchAllUsers,
  updateOrderStatus,
  setAuthToken,
  Order,
  UserRecord,
} from "@/lib/api"; // 2. Import setAuthToken
import { io } from "socket.io-client";

const STATUSES = [
  "All",
  "Pending",
  "Placed",
  "Accepted",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;
const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Placed: "bg-blue-100 text-blue-700 border-blue-200",
  Accepted: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};
const NEXT_STATUS: Record<string, Order["status"]> = {
  Pending: "Placed",
  Placed: "Accepted",
  Accepted: "Out for Delivery",
  "Out for Delivery": "Delivered",
};

export default function OrderManagement() {
  const { data: session } = useSession(); // 3. Access session
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    // 4. Get the token from session
    const token =
      (session as any)?.accessToken || (session?.user as any)?.accessToken;
    if (!token) return;

    setLoading(true);
    try {
      // 5. Set token before fetching
      setAuthToken(token);

      const [o, u] = await Promise.all([fetchAllOrders(), fetchAllUsers()]);

      // 6. Robust data setting (handles raw arrays or nested {orders: []} objects)
      setOrders(
        Array.isArray(o) ? o : (o as any).orders || (o as any).data || [],
      );
      setUsers(
        Array.isArray(u) ? u : (u as any).users || (u as any).data || [],
      );
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // 7. Re-run when session becomes available
  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  useEffect(() => {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000";
    const socket = io(SOCKET_URL);
    socket.on("new_order", (order: Order) =>
      setOrders((prev) => [order, ...prev]),
    );
    socket.on("order_updated", ({ orderId, status: s, deliveryBoyId }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                status: s,
                deliveryBoyId: deliveryBoyId || o.deliveryBoyId,
              }
            : o,
        ),
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // ... rest of your handleStatusAdvance and handleAssignDelivery functions remain the same
  const handleStatusAdvance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    setUpdatingId(order._id);
    try {
      const updated = await updateOrderStatus(order._id, next);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id ? { ...o, status: updated.status } : o,
        ),
      );
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignDelivery = async (
    orderId: string,
    deliveryBoyId: string,
  ) => {
    try {
      const updated = await updateOrderStatus(
        orderId,
        "Accepted",
        deliveryBoyId,
      );
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                status: updated.status,
                deliveryBoyId: updated.deliveryBoyId,
              }
            : o,
        ),
      );
    } catch (err) {
      console.error("Failed to assign delivery", err);
    }
  };
  const deliveryBoys = users.filter((u) => u.role === "Delivery Boy");
  const filtered = orders.filter(
    (o) => filterStatus === "All" || o.status === filterStatus,
  );

  if (loading)
    return (
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant animate-pulse">
          Fetching fresh orders...
        </p>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-surface-container-lowest rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* 8. Debug counter to see if data is actually there */}
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-on-surface-variant uppercase">
          Total Records: {orders.length}
        </p>
        <button onClick={loadData} className="text-xs text-primary underline">
          Refresh Data
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterStatus === s ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
          >
            {s}{" "}
            {s !== "All" && (
              <span className="ml-1 opacity-70">
                ({orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ... The rest of your table UI ... */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-20 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2">
              inventory_2
            </span>
            <p>No orders found for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              {/* ... your existing <thead> and <tbody> ... */}
              <thead>
                <tr className="text-on-surface-variant text-xs font-label uppercase bg-surface-container-low">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Delivery Boy</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o._id}
                    className="border-t border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors"
                  >
                    {/* ... existing <td> cells ... */}
                    <td className="px-6 py-4">
                      <p className="font-bold font-headline text-sm text-left">
                        #{o._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5 text-left">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-left">
                      {typeof o.userId === "object"
                        ? o.userId.name
                        : "Customer"}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[150px] truncate">
                      {o.deliveryAddress || "—"}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-primary">
                      ₹{o.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={
                          typeof o.deliveryBoyId === "object"
                            ? (o.deliveryBoyId as any)?._id
                            : o.deliveryBoyId || ""
                        }
                        onChange={(e) =>
                          handleAssignDelivery(o._id, e.target.value)
                        }
                        className="bg-surface-container-low rounded-xl px-3 py-1.5 text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[130px]"
                        disabled={
                          o.status === "Delivered" || o.status === "Cancelled"
                        }
                      >
                        <option value="">Unassigned</option>
                        {deliveryBoys.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {NEXT_STATUS[o.status] && (
                        <button
                          onClick={() => handleStatusAdvance(o)}
                          disabled={updatingId === o._id}
                          className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary px-3 py-1.5 rounded-xl text-xs font-bold font-label transition-all disabled:opacity-50 whitespace-nowrap ml-auto"
                        >
                          {updatingId === o._id ? (
                            <span className="material-symbols-outlined text-sm animate-spin">
                              progress_activity
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">
                              arrow_forward
                            </span>
                          )}
                          → {NEXT_STATUS[o.status].split(" ")[0]}
                        </button>
                      )}
                      {o.status === "Delivered" && (
                        <span className="text-green-600 text-xs font-bold">
                          ✓ Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
