'use client';
import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapse: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isMobileOpen,
      toggleCollapse: () => setIsCollapsed(p => !p),
      toggleMobile: () => setIsMobileOpen(p => !p),
      closeMobile: () => setIsMobileOpen(false),
    }}>
      {children}
    </SidebarContext.Provider>
  );
}
