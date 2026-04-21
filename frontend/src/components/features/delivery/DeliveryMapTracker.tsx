'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next-auth/react'; // This is wrong, it should be next/navigation
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { fetchAITip } from '@/lib/api';
import Link from 'next/link';

export default function DeliveryMapTracker() {
  const searchParams = useNextSearchParams();
  const address = searchParams.get('address') || 'Jaipur, Rajasthan, India';
  const orderId = searchParams.get('orderId') || '';
  const [aiTip, setAiTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const socketRef = useRef<any>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    setLoadingTip(true);
    fetchAITip(address)
      .then(tip => setAiTip(tip))
      .catch(() => setAiTip('Stay alert and follow local traffic rules for safe delivery.'))
      .finally(() => setLoadingTip(false));
  }, [address]);

  const toggleLocationSharing = () => {
    if (locationSharing) {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      if (socketRef.current) socketRef.current.disconnect();
      socketRef.current = null;
      setLocationSharing(false);
      return;
    }
    if (!navigator.geolocation) { alert('Geolocation not supported on this device'); return; }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
    socketRef.current = io(SOCKET_URL);
    setLocationSharing(true);

    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(loc);
        if (socketRef.current && orderId) {
          socketRef.current.emit('update_location', { orderId, location: loc });
        }
      },
      () => { setLocationSharing(false); alert('Location access denied'); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const encodedAddress = encodeURIComponent(address);
  const osmLink = `https://www.openstreetmap.org/search?query=${encodedAddress}`;

  return (
    <div className="space-y-6">
      {/* AI Tip Banner */}
      <div className="bg-gradient-to-r from-tertiary/10 to-primary/5 border border-tertiary/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-tertiary/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <div className="flex-1">
          <p className="font-label text-xs font-bold text-tertiary uppercase tracking-wider mb-1 text-left">AI Route Tip</p>
          {loadingTip ? (
            <div className="space-y-1.5">
              <div className="h-3 bg-surface-container-low rounded animate-pulse w-full" />
              <div className="h-3 bg-surface-container-low rounded animate-pulse w-2/3" />
            </div>
          ) : (
            <p className="text-on-surface font-semibold text-sm leading-relaxed text-left">{aiTip}</p>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl border border-outline-variant/10">
        <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
            <span className="font-bold font-headline">OpenStreetMap</span>
          </div>
          <a href={osmLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Full Screen
          </a>
        </div>
        <div className="w-full h-[400px]">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&query=${encodedAddress}`}
            className="w-full h-full border-0"
            title="Delivery Map"
            loading="lazy"
          />
        </div>
      </div>

      {/* Tracker Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 text-left">
          <h3 className="font-bold font-headline mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">my_location</span>
            Location Sharing
          </h3>
          <p className="text-on-surface-variant font-body text-[13px] mb-4">
            Share your live GPS with the customer.
          </p>
          <button
            onClick={toggleLocationSharing}
            className={`w-full py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
              locationSharing
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-primary text-on-primary hover:scale-[1.02]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{locationSharing ? 'location_off' : 'location_on'}</span>
            {locationSharing ? 'Stop Sharing' : 'Start Tracking'}
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 text-left">
          <h3 className="font-bold font-headline mb-4 flex items-center gap-2 text-left">
            <span className="material-symbols-outlined text-primary text-base text-left">info</span>
            Delivery Info
          </h3>
          <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-1">Destination</p>
          <p className="font-semibold text-sm text-on-surface truncate">{address}</p>
          <Link href="/delivery/dashboard" className="mt-4 block text-center py-2 text-xs font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5">
            View Task List
          </Link>
        </div>
      </div>
    </div>
  );
}
