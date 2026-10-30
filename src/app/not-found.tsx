import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-2xl font-bold mb-4">
        404
      </div>
      <h2 className="text-2xl font-black mb-2">Page Not Found</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        The requested portal page could not be located or may have been relocated.
      </p>
      <Link
        href="/dashboard/bdo"
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg transition"
      >
        Return to BDO Dashboard
      </Link>
    </div>
  );
}
