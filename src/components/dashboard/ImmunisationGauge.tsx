"use client";

import React from "react";
import { ShieldCheck, Target, Award } from "lucide-react";

interface Props {
  rate: string;
  target?: number; // default 95.0%
}

export default function ImmunisationGauge({ rate, target = 95.0 }: Props) {
  const currentRate = parseFloat(rate) || 0;
  const isTargetAchieved = currentRate >= target;
  const delta = (currentRate - target).toFixed(1);

  // SVG Gauge Math for a clean semi-circle arc (radius = 70, cx = 100, cy = 85)
  // Angle spans from -180 deg (left) to 0 deg (right), length = PI * r
  const radius = 70;
  const circumference = Math.PI * radius; // ~219.9
  // Clamped percentage between 0 and 100
  const clampedPercent = Math.min(Math.max(currentRate, 0), 100);
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  // Benchmark target point calculation on arc
  const targetAngleRad = Math.PI * (1 - target / 100);
  const targetX = 100 + radius * Math.cos(targetAngleRad);
  const targetY = 85 - radius * Math.sin(targetAngleRad);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Immunisation Coverage</h3>
        </div>
        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
            isTargetAchieved
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {isTargetAchieved ? "Target Exceeded" : "Action Needed"}
        </span>
      </div>

      {/* Speedometer Gauge Visualizer */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <svg viewBox="0 0 200 115" className="w-52 h-28 overflow-visible">
          {/* Background Track Arc */}
          <path
            d="M 30 85 A 70 70 0 0 1 170 85"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <path
            d="M 30 85 A 70 70 0 0 1 170 85"
            fill="none"
            stroke={isTargetAchieved ? "#10B981" : "#F59E0B"}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Benchmark Target Marker Line (95%) */}
          <line
            x1={targetX - 2}
            y1={targetY - 8}
            x2={targetX + 2}
            y2={targetY + 8}
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Needle Value Callout in Semi-Circle Center */}
        <div className="absolute top-12 flex flex-col items-center justify-center">
          <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            {rate}%
          </div>
          <span className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
            Fully Vaccinated
          </span>
        </div>
      </div>

      {/* Target Comparison Bar */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-medium">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            National Goal: <strong className="text-slate-700">{target.toFixed(1)}%</strong>
          </span>
          <span
            className={`font-bold flex items-center gap-1 ${
              isTargetAchieved ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            {isTargetAchieved ? `+${delta}% above target` : `${delta}% gap`}
          </span>
        </div>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isTargetAchieved ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(currentRate, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
