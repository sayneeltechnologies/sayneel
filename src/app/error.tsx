"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl font-bold mb-4">
        !
      </div>
      <h2 className="text-2xl font-black mb-2">Something went wrong</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        An unexpected application error occurred while rendering the dashboard.
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg transition"
      >
        Try Again
      </button>
    </div>
  );
}
