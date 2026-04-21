'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/store/cartSlice';

function SessionHydration({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'unauthenticated') {
      dispatch(clearCart());
    }
  }, [status, dispatch]);

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
