"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchUserOrders, Order } from "@/lib/api";
import { io } from "socket.io-client";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Placed: "bg-blue-100 text-blue-700",
  Accepted: "bg-indigo-100 text-indigo-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const STATUS_ICONS: Record<string, string> = {
  Pending: "schedule",
  Placed: "receipt",
  Accepted: "handshake",
  "Out for Delivery": "local_shipping",
  Delivered: "check_circle",
  Cancelled: "cancel",
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadOrders = useCallback(async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    try {
      const data = await fetchUserOrders(userId);
      setOrders(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) loadOrders();
  }, [session, loadOrders]);

  // Real-time socket updates
  useEffect(() => {
    if (!orders.length) return;
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000";
    const socket = io(SOCKET_URL);
    orders.forEach((o) => socket.emit("join_order_room", o._id));

    socket.on("order_status_update", ({ orderId, status: newStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [orders.length]);

  if (status === "loading" || loading) {
    return (
      <main className="pt-24 pb-24 max-w-4xl mx-auto px-6">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-2xl p-6 h-40"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-24 max-w-4xl mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">
            My Orders
          </h1>
          <p className="text-on-surface-variant font-body mt-1">
            Track all your FreshCurator deliveries
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-headline text-sm hover:scale-[1.02] transition-transform"
        >
          <span className="material-symbols-outlined text-base">
            add_shopping_cart
          </span>
          Shop More
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">
            receipt_long
          </span>
          <h2 className="text-2xl font-bold font-headline mb-2">
            No orders yet
          </h2>
          <p className="text-on-surface-variant mb-8">
            Your order history will appear here after your first purchase.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold font-headline hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined">storefront</span>
            Start Shopping
          </Link>
        </div>
      ) : (
        // <div className="space-y-6">
        //   {orders.map(order => (
        //     <div key={order._id} className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        //       {/* Order Header */}
        //       <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/10 flex-wrap gap-3">
        //         <div>
        //           <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Order ID</p>
        //           <p className="font-headline font-bold text-on-surface">#{order._id.slice(-8).toUpperCase()}</p>
        //         </div>
        //         <div className="text-right sm:text-left">
        //           <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Date</p>
        //           <p className="font-body text-sm text-on-surface">
        //             {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        //           </p>
        //         </div>
        //         <div className="text-right">
        //           <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Total</p>
        //           <p className="font-headline font-extrabold text-primary">${order.totalAmount.toFixed(2)}</p>
        //         </div>
        //         <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-label ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
        //           <span className="material-symbols-outlined text-sm">{STATUS_ICONS[order.status] || 'help'}</span>
        //           {order.status}
        //         </span>
        //       </div>

        //       {/* Status Timeline */}
        //       <div className="px-6 py-4 border-b border-outline-variant/10">
        //         <div className="flex items-center gap-0">
        //           {['Placed', 'Accepted', 'Out for Delivery', 'Delivered'].map((s, i, arr) => {
        //             const statuses = ['Placed', 'Accepted', 'Out for Delivery', 'Delivered'];
        //             const currentIdx = statuses.indexOf(order.status);
        //             const stepIdx = statuses.indexOf(s);
        //             const isComplete = stepIdx <= currentIdx;
        //             const isCurrent = stepIdx === currentIdx;
        //             return (
        //               <React.Fragment key={s}>
        //                 <div className="flex flex-col items-center">
        //                   <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
        //                     isComplete ? 'bg-primary' : 'bg-surface-container-low border-2 border-outline-variant/20'
        //                   } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
        //                     {isComplete && <span className="material-symbols-outlined text-on-primary text-xs">check</span>}
        //                   </div>
        //                   <p className={`text-xs mt-1 font-label whitespace-nowrap hidden sm:block ${isComplete ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{s}</p>
        //                 </div>
        //                 {i < arr.length - 1 && (
        //                   <div className={`flex-1 h-0.5 mx-1 transition-all ${stepIdx < currentIdx ? 'bg-primary' : 'bg-surface-container-low'}`} />
        //                 )}
        //               </React.Fragment>
        //             );
        //           })}
        //         </div>
        //       </div>

        //       {/* Items */}
        //       <div className="px-6 py-4">
        //         <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-3">Items</p>
        //         <div className="flex flex-wrap gap-2">
        //           {order.products.map((p, i) => {
        //             const prod = typeof p.productId === 'object' ? p.productId as any : null;
        //             return (
        //               <div key={i} className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl">
        //                 <span className="font-body text-sm text-on-surface">{prod?.name || 'Product'}</span>
        //                 <span className="text-xs text-on-surface-variant">×{p.quantity}</span>
        //               </div>
        //             );
        //           })}
        //         </div>
        //         {order.deliveryAddress && (
        //           <p className="mt-3 text-xs text-on-surface-variant flex items-center gap-1">
        //             <span className="material-symbols-outlined text-sm">location_on</span>
        //             {order.deliveryAddress}
        //           </p>
        //         )}
        //         {order.status === 'Out for Delivery' && order.deliveryOtp && (
        //           <div className="mt-4 p-4 border-2 border-primary bg-primary/5 rounded-2xl flex items-center justify-between">
        //             <div>
        //               <p className="text-xs font-bold font-headline text-primary uppercase tracking-wider mb-0.5">Delivery OTP</p>
        //               <p className="text-sm text-on-surface-variant">Share this code with your rider</p>
        //             </div>
        //             <span className="text-2xl font-black tracking-widest text-primary font-mono">{order.deliveryOtp}</span>
        //           </div>
        //         )}
        //       </div>
        //     </div>
        //   ))}
        // </div>
        <div className="space-y-6">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}/tracking`}
              className="block transition-all active:scale-[0.98] group"
            >
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden group-hover:border-primary/50 group-hover:shadow-md transition-all">
                {/* Order Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/10 flex-wrap gap-3 bg-white group-hover:bg-primary/[0.02] transition-colors">
                  <div>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">
                      Order ID
                    </p>
                    <p className="font-headline font-bold text-on-surface">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">
                      Date
                    </p>
                    <p className="font-body text-sm text-on-surface">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">
                      Total
                    </p>
                    <p className="font-headline font-extrabold text-primary">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-label ${
                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {STATUS_ICONS[order.status] || "help"}
                    </span>
                    {order.status}
                  </span>
                </div>

                {/* Status Timeline */}
                <div className="px-6 py-4 border-b border-outline-variant/10">
                  <div className="flex items-center gap-0">
                    {[
                      "Placed",
                      "Accepted",
                      "Out for Delivery",
                      "Delivered",
                    ].map((s, i, arr) => {
                      const statuses = [
                        "Placed",
                        "Accepted",
                        "Out for Delivery",
                        "Delivered",
                      ];
                      const currentIdx = statuses.indexOf(order.status);
                      const stepIdx = statuses.indexOf(s);
                      const isComplete = stepIdx <= currentIdx;
                      const isCurrent = stepIdx === currentIdx;
                      return (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isComplete
                                  ? "bg-primary"
                                  : "bg-surface-container-low border-2 border-outline-variant/20"
                              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                            >
                              {isComplete && (
                                <span className="material-symbols-outlined text-on-primary text-xs">
                                  check
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs mt-1 font-label whitespace-nowrap hidden sm:block ${
                                isComplete
                                  ? "text-primary font-bold"
                                  : "text-on-surface-variant"
                              }`}
                            >
                              {s}
                            </p>
                          </div>
                          {i < arr.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-1 transition-all ${
                                stepIdx < currentIdx
                                  ? "bg-primary"
                                  : "bg-surface-container-low"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                  <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-3">
                    Items
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.products.map((p, i) => {
                      const prod =
                        typeof p.productId === "object"
                          ? (p.productId as any)
                          : null;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl"
                        >
                          <span className="font-body text-sm text-on-surface">
                            {prod?.name || "Product"}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            ×{p.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {order.deliveryAddress && (
                    <p className="mt-3 text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        location_on
                      </span>
                      {order.deliveryAddress}
                    </p>
                  )}

                  {/* Delivery OTP - Only shows when rider is out */}
                  {order.status === "Out for Delivery" && order.deliveryOtp && (
                    <div className="mt-4 p-4 border-2 border-primary bg-primary/5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold font-headline text-primary uppercase tracking-wider mb-0.5">
                          Delivery OTP
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          Share this code with your rider
                        </p>
                      </div>
                      <span className="text-2xl font-black tracking-widest text-primary font-mono">
                        {order.deliveryOtp}
                      </span>
                    </div>
                  )}

                  {/* Subtle "Click to track" indicator */}
                  <div className="mt-4 text-center sm:text-right">
                    <span className="text-primary text-xs font-bold flex items-center justify-end gap-1">
                      View details & track{" "}
                      <span className="material-symbols-outlined text-xs">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
