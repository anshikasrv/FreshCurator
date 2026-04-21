"use client";

import React from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error("Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-2xl text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle size={40} className="text-error" />
        </div>

        <h1 className="text-3xl font-black font-headline tracking-tighter text-on-surface mb-2">
          Something went wrong
        </h1>
        <p className="text-on-surface-variant font-body text-sm mb-10 leading-relaxed">
          An unexpected error occurred while rendering this page. We have logged
          the incident and our team is already looking into it.
        </p>

        {error.message && (
          <div className="bg-error/5 border border-error/10 rounded-2xl p-4 mb-10 text-left">
            <p className="text-[10px] font-black text-error uppercase tracking-widest mb-1">
              Diagnostic Info
            </p>
            <p className="text-xs font-mono font-bold text-on-surface leading-tight break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold font-headline transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
          >
            <RefreshCcw size={18} strokeWidth={2.5} />
            Try to Recover
          </button>

          <Link
            href="/"
            className="w-full py-4 rounded-2xl bg-surface-container-high text-on-surface font-bold font-headline transition-all hover:bg-surface-container-highest flex items-center justify-center gap-2"
          >
            <Home size={18} strokeWidth={2.5} />
            Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
}
