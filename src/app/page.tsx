import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Activity, Users, BarChart3, Building2, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <main id="main">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Healthcare Tech &middot; AI &middot; Enterprise Software
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Software engineered for <span className="text-blue-700">real-world impact</span>.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
              We design and build production-grade web systems, mobile apps, and government-scale healthcare platforms
              like <strong>BalSaathi</strong> that transform maternal and child health.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-700 text-white font-semibold shadow-lg hover:bg-blue-800 transition-all hover:scale-[1.02]"
              >
                <span>Access BalSaathi Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/balsaathi"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-all"
              >
                Explore BalSaathi Product
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BALSAATHI WEB PORTAL HIGHLIGHT CARD ==================== */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                ⭐ Official Web Portal
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                BalSaathi Governance &amp; Parent Dashboard
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                A unified, role-based web interface delivering real-time child growth tracking, WHO Z-score analytics,
                and immunisation monitoring across all administrative levels.
              </p>

              {/* Roles Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>BDO Portal</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Full Taluka overview, Anganwadi rankings, malnutrition SAM/MAM metrics.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>Sarpanch Portal</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Village-level child health cards, upcoming vaccine camps, malnutrition alerts.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1">
                    <Heart className="w-5 h-5 text-rose-400" />
                    <span>Parent Portal</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Individual child growth curve (WHO standards) and vaccine due dates.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                >
                  <span>Login to Your Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/balsaathi"
                  className="text-sm font-semibold text-slate-300 hover:text-white underline underline-offset-4"
                >
                  Learn how BalSaathi works &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS ROW ==================== */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold text-blue-700">12+</p>
              <p className="text-sm text-slate-600 mt-1 font-medium">Service Practices</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-blue-700">40+</p>
              <p className="text-sm text-slate-600 mt-1 font-medium">BalSaathi Modules</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-blue-700">100%</p>
              <p className="text-sm text-slate-600 mt-1 font-medium">WHO Standard Compliant</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-blue-700">1-Day</p>
              <p className="text-sm text-slate-600 mt-1 font-medium">Response Time</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
