import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles, Smartphone, BarChart3, Database, Users } from "lucide-react";

export default function BalSaathiPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="pt-16 pb-20 bg-gradient-to-b from-blue-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              Flagship Healthcare Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              AI-Powered Maternal &amp; Child Health Monitoring
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              BalSaathi connects parents, pregnant women, Anganwadi workers, and administrative officers (BDOs &amp; Sarpanches)
              around one single record of child growth, nutrition, and immunisation.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
              >
                <span>Open Web Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
              >
                View Core Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Why BalSaathi Transforms Rural Healthcare
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Built with an offline-first architecture, Marathi-first localisation, and WHO-certified clinical algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">WHO Z-Score Growth Monitoring</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatic computation of Weight-for-Age, Height-for-Age, and Weight-for-Height with visual malnutrition classification (SAM/MAM).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Universal Immunisation Tracker</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Birth to 5-year vaccination schedules with due-date alerts for parents and coverage audits for Anganwadi workers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-Tier Governance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dedicated views for Block Development Officers (Taluka), Sarpanches (Village), and Parents (Individual child).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Ready to explore your administrative or parent dashboard?
          </h2>
          <p className="text-slate-600">
            Log in with your registered mobile number to access your jurisdiction's health analytics.
          </p>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-700 text-white font-bold text-lg hover:bg-blue-800 shadow-md transition"
            >
              <span>Go to BalSaathi Web Login</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
