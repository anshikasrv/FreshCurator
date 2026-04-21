'use client';

import React from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import DeliverySidebar from '@/components/layout/DeliverySidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-surface-container-lowest">
        {/* Sidebar */}
        <DeliverySidebar />

        {/* Main content column */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
