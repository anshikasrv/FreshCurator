'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Map, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

const DELIVERY_NAV = [
  { href: '/delivery/dashboard', label: 'Tasks', icon: LayoutDashboard },
  { href: '/delivery/map', label: 'Live Map', icon: Map },
];

export default function DeliverySidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();

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
        {/* Logo Area */}
        <div className={`flex items-center justify-between p-6 mb-4 min-h-[72px] border-b border-outline-variant/10 ${isCollapsed ? 'px-4 justify-center' : ''}`}>
          {!isCollapsed && (
            <Link href="/delivery/dashboard" className="text-xl font-black text-primary font-headline tracking-tighter">
              Fresh<span className="text-on-surface-variant">Curator</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/delivery/dashboard" className="text-xl font-black text-primary font-headline">F</Link>
          )}
          {/* Toggle button — desktop only */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/10 items-center justify-center hover:bg-surface-container-highest transition-all ml-auto flex-shrink-0"
          >
            {isCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Profile Card */}
        {!isCollapsed && (
          <div className="mx-4 bg-surface-container-low rounded-2xl p-4 mb-6 border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-base font-headline flex-shrink-0">
                {session?.user?.name?.charAt(0).toUpperCase() || 'R'}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black font-label text-primary uppercase tracking-widest leading-none mb-1">RIDER</p>
                <p className="font-bold text-on-surface text-sm truncate">{session?.user?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-surface/50 rounded-xl p-2 text-center">
                <p className="text-[8px] font-black text-on-surface-variant uppercase">Shift</p>
                <p className="text-[10px] font-bold text-green-600">Active</p>
              </div>
              <div className="bg-surface/50 rounded-xl p-2 text-center">
                <p className="text-[8px] font-black text-on-surface-variant uppercase">Rating</p>
                <p className="text-[10px] font-bold text-on-surface">4.9 ★</p>
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto mb-6 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-base font-headline">
            {session?.user?.name?.charAt(0).toUpperCase() || 'R'}
          </div>
        )}

        {/* Navigation */}
        {!isCollapsed && (
          <p className="px-6 text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Navigation</p>
        )}
        <nav className="flex-1 px-3 space-y-1">
          {DELIVERY_NAV.map((item) => {
            const active = pathname === item.href;
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
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl font-headline font-bold text-sm text-error hover:bg-error/10 transition-all ${isCollapsed ? 'justify-center w-full' : 'w-full'}`}
          >
            <LogOut size={18} strokeWidth={2.5} className="flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
