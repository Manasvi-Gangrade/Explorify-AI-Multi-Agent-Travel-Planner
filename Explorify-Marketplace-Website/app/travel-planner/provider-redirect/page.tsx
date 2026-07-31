"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";

function ProviderRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUrl = searchParams.get("url");

  useEffect(() => {
    if (targetUrl) {
      // Navigate current tab to provider URL
      window.location.href = targetUrl;

      // Auto-close tab after synchronization window
      const timer = setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          console.log("Auto-close fallback:", e);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [targetUrl]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-5 font-sans">
      <div className="size-16 rounded-2xl bg-[#1d6fa5] flex items-center justify-center shadow-2xl animate-pulse">
        <Sparkles className="size-8 text-white" />
      </div>
      <div className="text-center space-y-1 max-w-sm">
        <h2 className="text-xl font-extrabold text-sky-400 font-sans">
          Explorify Agent Provider Gateway
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Autonomous Agent is synchronizing live inventory & verifying fare locks...
        </p>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-slate-900/90 px-5 py-2.5 rounded-full border border-slate-800 shadow-inner">
        <Loader2 className="size-4 animate-spin text-emerald-400" /> Auto-Closing Tab & Returning to Explorify...
      </div>

      <button
        onClick={() => {
          try { window.close(); } catch {}
          router.push("/travel-planner");
        }}
        className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 pt-4 transition"
      >
        <ArrowLeft className="size-3.5" /> Return to Explorify Planner
      </button>
    </div>
  );
}

export default function ProviderRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#1d6fa5]" />
      </div>
    }>
      <ProviderRedirectContent />
    </Suspense>
  );
}
