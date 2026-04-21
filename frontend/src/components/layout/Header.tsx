'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

const USER_NAV = [
  { href: '/shop', label: 'Store', icon: 'storefront' },
  { href: '/cart', label: 'Basket', icon: 'shopping_basket' },
  { href: '/orders', label: 'My Orders', icon: 'receipt_long' },
];

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
  { href: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
  { href: '/admin/users', label: 'Users', icon: 'people' },
];

const DELIVERY_NAV = [
  { href: '/delivery/dashboard', label: 'My tasks', icon: 'pending_actions' },
  { href: '/delivery/map', label: 'Live Map', icon: 'map' },
];

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useSelector((state: RootState) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const role = (session?.user as any)?.role as string | undefined;
  const [isScrolled, setIsScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        router.push(`/shop?search=${encodeURIComponent(query)}`);
      }
    }, 500),
    [router]
  );

  // Hide on auth, admin, and delivery pages - MUST BE AFTER ALL HOOKS
  if (
    pathname === '/login' || 
    pathname === '/signup' ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/delivery')
  ) return null;


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    debouncedSearch(val);
  };

  const navLinks = role === 'Admin' ? ADMIN_NAV : role === 'Delivery Boy' ? DELIVERY_NAV : USER_NAV;

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-surface/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-8 text-left">
          <Link href={role === 'Admin' ? '/admin' : role === 'Delivery Boy' ? '/delivery/dashboard' : '/shop'} className="text-2xl font-black text-primary tracking-tighter font-headline hover:scale-105 transition-transform">
            Fresh<span className="text-secondary dark:text-on-surface-variant">Curator</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-1 items-center">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-headline font-bold text-sm tracking-tight transition-all duration-200 ${
                  pathname === link.href ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {(!role || role === 'User') && (
            <div className="relative hidden md:block group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg group-focus-within:text-primary transition-colors">search</span>
              <input
                value={search}
                onChange={handleSearchChange}
                className="bg-surface-container-low border-2 border-transparent rounded-full py-2.5 pl-10 pr-4 w-64 focus:ring-0 focus:border-primary/20 focus:bg-surface transition-all duration-300 font-body text-sm"
                placeholder="Search fresh items..."
                type="text"
              />
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all hover:scale-110 text-on-surface"
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
            {!mounted && <div className="w-5 h-5" />}
          </button>

          {(!role || role === 'User') && (
            <Link href="/cart" className="relative p-2.5 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all hover:scale-110">
              <span className="material-symbols-outlined text-on-surface">shopping_basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-on-secondary text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {session ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high transition-all hover:shadow-md"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-black font-label uppercase tracking-widest leading-none text-primary mb-0.5">{role || 'Buyer'}</p>
                  <p className="text-xs font-bold font-headline leading-none text-on-surface truncate max-w-[100px]">
                    {session.user?.name || 'Guest'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-primary/20 shadow-sm flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {(session.user as any)?.profileImage || (session.user as any)?.image ? (
                    <img src={(session.user as any).profileImage || (session.user as any).image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-primary text-base font-headline">
                      {(session.user as any)?.name?.charAt(0).toUpperCase() || 'G'}
                    </span>
                  )}
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-surface rounded-2xl shadow-2xl border border-outline-variant/10 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-outline-variant/10 mb-2">
                       <p className="font-bold text-sm text-on-surface truncate">{session.user?.name}</p>
                       <p className="text-xs text-on-surface-variant truncate">{session.user?.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm font-semibold hover:bg-surface-container-low transition-colors text-on-surface">
                      <span className="material-symbols-outlined text-lg">account_circle</span> Profile
                    </Link>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold hover:bg-error/10 text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 bg-primary text-on-primary px-5 py-2.5 rounded-2xl text-sm font-black font-headline hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[18px]">login</span>
              JOIN NOW
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
