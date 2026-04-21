'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, Package, Receipt, Users, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: Receipt },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminSidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-surface border-r border-outline-variant/10
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:flex
        `}
      >
        {/* Logo */}
        <div className={`flex items-center min-h-[72px] border-b border-outline-variant/10 px-5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <Link href="/admin" className="text-xl font-black text-primary font-headline tracking-tighter">
              Fresh<span className="text-on-surface-variant">Curator</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin" className="text-xl font-black text-primary font-headline">F</Link>
          )}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/10 items-center justify-center hover:bg-surface-container-highest transition-all ml-2 flex-shrink-0"
          >
            {isCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Admin badge */}
        {!isCollapsed && (
          <div className="mx-4 mt-4 mb-2 bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm font-headline flex-shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black font-label text-primary uppercase tracking-widest leading-none mb-0.5">ADMIN</p>
              <p className="font-bold text-on-surface text-sm truncate">{session?.user?.name}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto mt-4 mb-2 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm font-headline">
            {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        )}

        {/* Nav */}
        {!isCollapsed && (
          <p className="px-6 text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-2 mt-2">Navigation</p>
        )}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl font-headline font-bold text-sm tracking-tight transition-all ${
                  active
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon size={18} strokeWidth={2.5} className="flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={`p-3 border-t border-outline-variant/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title={isCollapsed ? 'Logout' : undefined}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl font-headline font-bold text-sm text-error hover:bg-error/10 transition-all w-full ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} strokeWidth={2.5} className="flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
