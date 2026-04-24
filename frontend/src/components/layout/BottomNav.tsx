'use client';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const cartCount = useSelector((state: RootState) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const role = (session?.user as any)?.role as string | undefined;

  const USER_NAV = [
    { href: '/shop', label: 'Explore', icon: 'storefront' },
    { href: '/cart', label: 'Basket', icon: 'shopping_basket', showBadge: true },
    { href: '/orders', label: 'Orders', icon: 'receipt_long' },
    { href: session ? '/profile' : '/login', label: session ? (session.user?.name?.split(' ')[0] || 'Profile') : 'Join', icon: 'person' },
  ];

  const ADMIN_NAV = [
    { href: '/admin', label: 'Overview', icon: 'dashboard' },
    { href: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
    { href: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
    { href: '/admin/users', label: 'Users', icon: 'people' },
  ];

  const DELIVERY_NAV = [
    { href: '/delivery/dashboard', label: 'Tasks', icon: 'pending_actions' },
    { href: '/delivery/map', label: 'Map', icon: 'map' },
    { href: '/login', label: 'Logout', icon: 'logout', isLogout: true },
  ];

  const nav = role === 'Admin' ? ADMIN_NAV : role === 'Delivery Boy' ? DELIVERY_NAV : USER_NAV;

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe pt-2 bg-surface/95 dark:bg-[#1a1c1e]/98 backdrop-blur-2xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-outline-variant/10 dark:border-outline-variant/30">
      {nav.map((item: any) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        if (item.isLogout) {
          return (
            <button
              key={item.href}
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-red-500 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-2xl font-light">{item.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-widest font-label">{item.label}</span>
            </button>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-2xl transition-all active:scale-90 ${
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl transition-all ${isActive ? 'scale-110' : 'font-light'}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {item.icon}
            </span>
            {item.showBadge && cartCount > 0 && (
              <span className="absolute top-1.5 right-3 w-4.5 h-4.5 bg-secondary text-on-secondary text-[8px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
            <span className={`text-[9px] font-black uppercase tracking-widest font-label transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
              {item.label}
            </span>
            {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
