"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, ArrowRight, Building2, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("bdo_haveli");
  const [password, setPassword] = useState("bdo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Hardcoded BDO credentials check
    setTimeout(() => {
      if (
        (username.trim().toLowerCase() === "bdo_haveli" ||
          username.trim() === "9876543210" ||
          username.trim().toLowerCase() === "bdo@balsaathi.in") &&
        password === "bdo123"
      ) {
        // Save user session
        const bdoUser = {
          name: "Dr. R. K. Patil",
          role: "BDO",
          roleLabel: "Block Development Officer (गट विकास अधिकारी)",
          jurisdiction: "Haveli Taluka, District Pune",
          blockId: "haveli_01",
          totalAwcs: 248,
          totalChildren: 8420,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem("balsaathi_user", JSON.stringify(bdoUser));
        router.push("/dashboard/bdo");
      } else {
        setError("Invalid username or password. Please use the demo credentials below.");
        setLoading(false);
      }
    }, 400);
  };

  const fillDemoCredentials = () => {
    setUsername("bdo_haveli");
    setPassword("bdo123");
    setError("");
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-slate-900 tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
              S
            </span>
            <span>BalSaathi Portal</span>
          </Link>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Government of Maharashtra &middot; Rural Health &amp; Nutrition System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 relative overflow-hidden">
          {/* Top Role Indicator */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200/60 mb-6 text-blue-900">
            <Building2 className="w-5 h-5 text-blue-700 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-blue-800">Role: BDO (Block Development Officer)</span>
              <span className="block text-slate-500">Taluka-level administrative dashboard access</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Officer Sign In</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Enter your credentials to access the growth &amp; immunisation reports.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Officer Username / Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-slate-50/50 font-medium"
                  placeholder="e.g. bdo_haveli or 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-slate-50/50 font-medium"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to BDO Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Hardcoded Demo Credentials Helper Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-amber-50/80 -mx-8 -mb-8 p-6 rounded-b-3xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                Test Credentials (Hardcoded)
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
              >
                Auto-Fill
              </button>
            </div>
            <div className="text-xs text-amber-950/80 space-y-1 font-mono bg-white/70 p-2.5 rounded-lg border border-amber-200">
              <div>
                Username: <strong className="text-slate-900">bdo_haveli</strong>
              </div>
              <div>
                Password: <strong className="text-slate-900">bdo123</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-blue-700 transition">
            &larr; Return to SayNeel Technologies Home
          </Link>
        </div>
      </div>
    </div>
  );
}
