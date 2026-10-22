'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearCart, restoreCart } from '@/store/cartSlice';
import { setAuthToken } from '@/lib/api';
import { store } from '@/store';

function SessionHydration({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    setAuthToken(session?.user?.accessToken || '');
    if (status === 'authenticated' && session.user?.id) {
      const storageKey = `freshcurator-cart:${session.user.id}`;
      try {
        const savedCart = localStorage.getItem(storageKey);
        const parsed: unknown = savedCart ? JSON.parse(savedCart) : [];
        dispatch(restoreCart(Array.isArray(parsed) ? parsed : []));
      } catch {
        localStorage.removeItem(storageKey);
        dispatch(restoreCart([]));
      }
    } else if (status === 'unauthenticated') {
      dispatch(clearCart());
    }
  }, [session, status, dispatch]);

  useEffect(() => {
    const userId = status === 'authenticated' ? session?.user?.id : undefined;
    if (!userId) return;
    const storageKey = `freshcurator-cart:${userId}`;
    return store.subscribe(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(store.getState().cart.items));
      } catch (error) {
        console.error('Could not save the basket on this device.', error);
      }
    });
  }, [session?.user?.id, status]);

  return <>{children}</>;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionHydration>
        {children}
      </SessionHydration>
    </SessionProvider>
  );
}
