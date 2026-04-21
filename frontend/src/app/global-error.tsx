'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0F1115]">
        <div className="min-h-screen flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-[#1a1c1e] rounded-[3rem] p-12 border border-white/5 shadow-[0_0_100px_rgba(255,0,0,0.1)] text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-red-500/20">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            
            <h1 className="text-4xl font-black mb-4 tracking-tighter">System Critical</h1>
            <p className="text-gray-400 text-sm mb-12 leading-relaxed">
              We encountered a critical runtime failure. The system environment has been stabilized. Please attempt a hard reset to restore service.
            </p>

            <button
              onClick={() => reset()}
              className="w-full py-5 rounded-[1.5rem] bg-white text-black font-black text-lg transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-white/10"
            >
              <RefreshCw size={20} strokeWidth={3} />
              HARD RESET SYSTEM
            </button>
            
            <p className="mt-10 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
              Error Code: {error.digest || 'CRITICAL_BOOT_FAILURE'}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
