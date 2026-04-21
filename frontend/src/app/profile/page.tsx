'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const user = session?.user as any;
  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-outline-variant/10 overflow-hidden"
        >
          {/* Cover / Header */}
          <div className="h-32 bg-primary relative">
            <div className="absolute -bottom-12 left-8 sm:left-12">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-surface-container-high p-1 shadow-xl">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover rounded-[1.8rem]" />
                ) : (
                  <div className="w-full h-full bg-secondary-container flex items-center justify-center rounded-[1.8rem]">
                    <span className="text-4xl sm:text-5xl font-black font-headline text-on-secondary-container">{initial}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-12 px-8 sm:px-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black font-headline tracking-tight text-on-surface mb-1">
                  {user?.name || 'User Profile'}
                </h1>
                <p className="text-on-surface-variant font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">mail</span>
                  {user?.email}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span className="material-symbols-outlined text-lg">verified_user</span>
                <span className="font-label font-bold text-sm tracking-widest uppercase">{user?.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-4">Account Status</p>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]"></span>
                  <p className="font-bold text-on-surface text-lg">Active & Verified</p>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-4">Member Since</p>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                  <p className="font-bold text-on-surface text-lg text-on-surface/90">April 2026</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.push('/shop')}
                className="flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-xl">shopping_basket</span>
                Back to Shop
              </button>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex-1 bg-error/10 hover:bg-error/20 text-error font-black py-4 rounded-2xl transition-all border border-error/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                Logout Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
