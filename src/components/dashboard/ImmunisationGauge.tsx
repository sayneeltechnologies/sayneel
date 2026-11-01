"use client";

import React from "react";
import { ShieldCheck, Target, Award } from "lucide-react";

interface Props {
  rate: string;
  target?: number; // default 95.0%
}

// Compact horizontal strip: title, headline rate, progress bar with benchmark marker, and status.
export default function ImmunisationGauge({ rate, target = 95.0 }: Props) {
  const currentRate = parseFloat(rate) || 0;
  const isTargetAchieved = currentRate >= target;
  const delta = (currentRate - target).toFixed(1);
  // Clamped percentage between 0 and 100
  const clampedPercent = Math.min(Math.max(currentRate, 0), 100);
  const clampedTarget = Math.min(Math.max(target, 0), 100);

  return (
    <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
      {/* Title */}
      <div className="flex items-center gap-2.5 md:w-52 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-[18px] h-[18px] text-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">Vaccination Meter</h3>
          <span className="text-[10px] text-slate-400 font-medium">Routine Immunisation (FIC)</span>
        </div>
      </div>

      {/* Headline Rate */}
      <div className="flex items-baseline gap-2 shrink-0 md:pl-6 md:border-l md:border-slate-100">
        <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">{rate}%</span>
        <span className="text-[10px] text-slate-500 font-semibold uppercase">Doses Administered</span>
      </div>

      {/* Progress Bar with Benchmark Marker */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isTargetAchieved ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${clampedPercent}%` }}
          ></div>
          <div
            className="absolute -top-1 -bottom-1 w-[3px] -ml-[1.5px] rounded-full bg-slate-800"
            style={{ left: `${clampedTarget}%` }}
            title={`National Benchmark: ${target.toFixed(1)}%`}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-medium">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            National Benchmark: <strong className="text-slate-700">{target.toFixed(1)}%</strong>
          </span>
          <span
            className={`font-bold flex items-center gap-1 ${
              isTargetAchieved ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            {isTargetAchieved ? `+${delta}% above benchmark` : `${Math.abs(parseFloat(delta))}% to reach benchmark`}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <span
        className={`self-start md:self-auto shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
          isTargetAchieved
            ? "bg-emerald-100 text-emerald-800"
            : currentRate >= 80
            ? "bg-blue-100 text-blue-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {isTargetAchieved ? "Target Exceeded" : currentRate >= 80 ? "Good Coverage" : "Action Needed"}
      </span>
    </div>
  );
}
