"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Bell, Sun, Moon, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import { useState, useEffect } from "react";

interface DashboardHeaderProps {
  title?: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  const { toggleCollapse, toggleMobile } = useSidebar();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 flex-shrink-0 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/10 flex items-center justify-between px-4 sm:px-6 z-30 relative">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        {/* Desktop: collapse toggle */}
        {/* <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={2} />
        </button> */}
        {/* Mobile: drawer toggle */}
        <button
          onClick={toggleMobile}
          className="flex lg:hidden p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant"
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
        {title && (
          <h1 className="font-headline font-bold text-on-surface text-sm sm:text-base tracking-tight hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant"
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )
          ) : (
            <div className="w-[18px] h-[18px]" />
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high transition-all"
          >
            <div className="hidden sm:block text-right">
              <p className="text-[9px] font-black font-label uppercase tracking-widest leading-none text-primary mb-0.5">
                {(session?.user as any)?.role || "Rider"}
              </p>
              <p className="text-xs font-bold font-headline leading-none text-on-surface truncate max-w-[90px]">
                {session?.user?.name || "User"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm font-headline">
              {(session?.user as any)?.profileImage ||
              (session?.user as any)?.image ? (
                <img
                  src={
                    (session?.user as any).profileImage ||
                    (session?.user as any).image
                  }
                  alt=""
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                session?.user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-surface rounded-2xl shadow-2xl border border-outline-variant/10 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-outline-variant/10 mb-1">
                  <p className="font-bold text-sm text-on-surface truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-semibold hover:bg-surface-container-low transition-colors text-on-surface"
                >
                  <User size={16} /> Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold hover:bg-error/10 text-error transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
