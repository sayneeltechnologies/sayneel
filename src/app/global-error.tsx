"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <h2 className="text-2xl font-black mb-2">Global System Error</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          The web portal encountered a critical error.
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg transition"
        >
          Recover Session
        </button>
      </body>
    </html>
  );
}
