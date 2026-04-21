'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import OrderChat from '@/components/features/orders/OrderChat';

// Leaflet markers are tricky in Next.js, we need to fix the default icons
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });

export default function OrderTracking() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [deliveryPos, setDeliveryPos] = useState<[number, number] | null>(null);
  const [customerPos, setCustomerPos] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi until geolocation loads
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Load Leaflet on client side to get icons fixed
    import('leaflet').then((leaflet) => {
      const DefaultIcon = leaflet.L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      leaflet.L.Marker.prototype.options.icon = DefaultIcon;
      setL(leaflet.L);
    });

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${(session as any)?.user?.accessToken}` }
        });
        setOrder(res.data);
        if (res.data.deliveryCoords?.coordinates) {
            // If the order already has delivery coords recorded
            setDeliveryPos([res.data.deliveryCoords.coordinates[1], res.data.deliveryCoords.coordinates[0]]);
        }
      } catch (err) {
        console.error('Failed to fetch order', err);
      }
    };

    if (id && session) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setCustomerPos([pos.coords.latitude, pos.coords.longitude]);
        }, (err) => console.log('Geolocation skipped/denied', err));
      }
      fetchOrder();
    }
  }, [id, session]);

  useEffect(() => {
    if (!id) return;
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
    const socket = io(SOCKET_URL);

    socket.emit('join_order_tracking', { orderId: id });

    socket.on('delivery_location_update', (coords) => {
      console.log('Location update received:', coords);
      setDeliveryPos([coords.lat, coords.lng]);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (!order || !L) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-headline font-bold text-on-surface">Initializing live tracking...</p>
      </div>
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-mesh flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar Info */}
      <div className="w-full lg:w-[400px] bg-white/80 backdrop-blur-xl border-r border-outline-variant/10 p-6 flex flex-col z-10 shadow-xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 font-bold text-sm">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Orders
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          <div className="pb-6 border-b border-outline-variant/10">
            <p className="text-[10px] font-black font-label text-primary uppercase tracking-widest mb-1">Live Tracking</p>
            <h1 className="text-3xl font-black font-headline tracking-tighter">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold text-on-surface">{order.status}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Delivery Partner</p>
                  <p className="font-bold text-on-surface">{(order.deliveryBoyId as any)?.name || 'Assigning Partner...'}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Estimated Time</p>
                  <p className="font-bold text-on-surface">{order.status === 'Out for Delivery' ? '15-20 mins' : 'Calculating...'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Order Details</p>
            <div className="space-y-3">
              {order.products.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">{(p.productId as any)?.name || 'Item'} <span className="text-[10px] font-bold">×{p.quantity}</span></span>
                  <span className="font-bold text-on-surface">₹{(p.price * p.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-outline-variant/10 flex justify-between items-center font-black">
                <span>Total Amount</span>
                <span className="text-primary">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-auto border-t border-outline-variant/10">
          <button className="w-full bg-primary text-on-primary font-black py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">call</span>
            Contact Partner
          </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative h-[50vh] lg:h-auto z-0">
        <MapContainer
          center={deliveryPos || customerPos}
          zoom={15}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Customer Marker */}
          <Marker position={customerPos}>
            <Popup>
              <div className="font-headline font-bold">Delivery Destination</div>
              <p className="text-xs text-on-surface-variant">{order.deliveryAddress}</p>
            </Popup>
          </Marker>

          {/* Delivery Marker */}
          {deliveryPos && (
            <Marker position={deliveryPos}>
               <Popup>
                 <div className="font-headline font-bold">Rider is here</div>
                 <p className="text-xs">Moving towards you</p>
               </Popup>
            </Marker>
          )}

          {deliveryPos && <Circle center={deliveryPos} radius={300} pathOptions={{ color: 'var(--md-sys-color-primary)', fillColor: 'var(--md-sys-color-primary)', fillOpacity: 0.1 }} />}
        </MapContainer>

        {/* Floating Controls */}
        <div className="absolute top-6 left-6 z-[1000] lg:hidden">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-outline-variant/10">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Status</p>
                <p className="text-sm font-bold">{order.status}</p>
            </div>
        </div>
      </div>
      <OrderChat orderId={id as string} />
    </div>
  );
}
