"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { LoginResponse, clearSession, getOfficialRole, saveSession } from "@/lib/auth";

// API error codes -> message shown on the form. Unknown user and wrong password read the same,
// so the form doesn't reveal which mobile numbers are registered.
const LOGIN_ERRORS: Record<string, string> = {
  user_not_found: "Invalid mobile number or password.",
  invalid_credentials: "Invalid mobile number or password.",
  user_not_active: "This account is not active. Please contact your administrator.",
};

export default function LoginPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const mobile = mobileNumber.trim();
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    clearSession();

    try {
      const login = await api.post<LoginResponse>("/auth/login", {
        mobile_number: mobile,
        password: password.trim(),
      });

      const role = getOfficialRole(login.roles ?? []);
      if (!role) {
        setError("This account does not have access to the officer portal.");
        setLoading(false);
        return;
      }

      saveSession(login, role);
      // Use window.location.href for guaranteed hard redirect
      window.location.href = "/dashboard/bdo";
    } catch (err) {
      setError(
        err instanceof ApiError
          ? LOGIN_ERRORS[err.message] ?? "Sign in failed. Please try again."
          : "Could not reach the server. Please check your connection and try again."
      );
      setLoading(false);
    }
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
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="username"
                  maxLength={10}
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-slate-50/50 font-medium"
                  placeholder="10-digit mobile number"
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
                  autoComplete="current-password"
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
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
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
