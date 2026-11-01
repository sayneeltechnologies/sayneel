"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, Scale, Ruler, HeartPulse, CheckCircle2 } from "lucide-react";

export type GrowthDimension = "status" | "waz" | "whz" | "haz";

interface Props {
  totalChildren: number;
  dimensions: {
    status: { normal: number; moderate: number; severe: number };
    waz: { normal: number; moderate: number; severe: number };
    whz: { normal: number; moderate: number; severe: number };
    haz: { normal: number; moderate: number; severe: number };
  };
  activeDimension: GrowthDimension;
  onDimensionChange: (dim: GrowthDimension) => void;
  talukaName: string;
}

interface DimensionMeta {
  key: GrowthDimension;
  title: string;
  shortCode: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  normalLabel: string;
  moderateLabel: string;
  severeLabel: string;
}

const DIMENSIONS_LIST: DimensionMeta[] = [
  {
    key: "status",
    title: "Overall Triage Status",
    shortCode: "WHO Triage",
    subtitle: "Composite Normal vs MAM vs SAM",
    icon: Activity,
    normalLabel: "Normal (Healthy)",
    moderateLabel: "MAM (Moderate)",
    severeLabel: "SAM (Severe Red)",
  },
  {
    key: "waz",
    title: "Weight-for-Age",
    shortCode: "WAZ Indicator",
    subtitle: "Underweight Assessment",
    icon: Scale,
    normalLabel: "Normal Weight",
    moderateLabel: "Mod. Underweight",
    severeLabel: "Sev. Underweight",
  },
  {
    key: "whz",
    title: "Weight-for-Height",
    shortCode: "WHZ / Wasting",
    subtitle: "Acute Wasting & Starvation",
    icon: HeartPulse,
    normalLabel: "Normal Proportions",
    moderateLabel: "Moderate Wasting",
    severeLabel: "Severe Wasting",
  },
  {
    key: "haz",
    title: "Height-for-Age",
    shortCode: "HAZ / Stunting",
    subtitle: "Chronic Stunting / Linear Growth",
    icon: Ruler,
    normalLabel: "Normal Stature",
    moderateLabel: "Moderate Stunting",
    severeLabel: "Severe Stunting",
  },
];

export default function MasterDonutChart({
  totalChildren,
  dimensions,
  activeDimension,
  onDimensionChange,
  talukaName,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Section Header with Unified Master Legend */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              WHO Clinical Growth Standards &mdash; 4 Dimensions
            </h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {talukaName} Taluka
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any dimension to inspect breakdown by village. Standard WHO Z-Score classification applied.
          </p>
        </div>

        {/* Unified Master Legend (Single source of truth) */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Legend:</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Normal / Healthy</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span>Moderate (MAM / -2 SD)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/60 font-semibold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span>Severe (SAM / -3 SD)</span>
          </div>
        </div>
      </div>

      {/* 4 Pie / Donut Charts Side-by-Side Grid with Expanded Charts */}
      <div
        className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {DIMENSIONS_LIST.map((dim) => {
          const Icon = dim.icon;
          const isActive = activeDimension === dim.key;
          const data = dimensions[dim.key] || { normal: 0, moderate: 0, severe: 0 };
          const evaluated = data.normal + data.moderate + data.severe;

          const normPct = evaluated > 0 ? ((data.normal / evaluated) * 100).toFixed(0) : "0";
          const modPct = evaluated > 0 ? ((data.moderate / evaluated) * 100).toFixed(0) : "0";
          const sevPct = evaluated > 0 ? ((data.severe / evaluated) * 100).toFixed(0) : "0";

          const chartData = [
            { name: dim.normalLabel, value: data.normal, color: "#10B981" },
            { name: dim.moderateLabel, value: data.moderate, color: "#F59E0B" },
            { name: dim.severeLabel, value: data.severe, color: "#EF4444" },
          ];

          return (
            <div
              key={dim.key}
              onClick={() => onDimensionChange(dim.key)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? "bg-white border-blue-600 shadow-lg ring-2 ring-blue-500/30"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">
                        {dim.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        {dim.shortCode}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition">
                      View &rarr;
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-1">
                  {dim.subtitle}
                </p>
              </div>

              {/* Enlarged Donut Chart Canvas (Height increased to h-48 ~ 192px) */}
              <div className="relative w-full h-48 my-2 flex items-center justify-center">
                {!isMounted ? (
                  <div className="w-28 h-28 rounded-full border-4 border-slate-100 animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={600}
                      >
                        {chartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0];
                            return (
                              <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] font-medium z-50">
                                <span className="font-bold">{d.name}:</span> {d.value} ({evaluated > 0 ? Math.round(((d.value as number) / evaluated) * 100) : 0}%)
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* Center Hole Callout - Kept COHORT jargon as requested */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {evaluated}
                  </span>
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider mt-1">
                    COHORT
                  </span>
                </div>
              </div>

              {/* Compact 3-Pill Stats Strip (Space-efficient, no repeated full-line text) */}
              <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-100">
                <div className="flex flex-col items-center justify-center bg-emerald-50/70 border border-emerald-100 rounded-xl py-1.5 px-1">
                  <span className="text-[10px] font-bold text-emerald-800">
                    {data.normal}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold">
                    {normPct}% Normal
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center bg-amber-50/70 border border-amber-100 rounded-xl py-1.5 px-1">
                  <span className="text-[10px] font-bold text-amber-800">
                    {data.moderate}
                  </span>
                  <span className="text-[9px] text-amber-600 font-semibold">
                    {modPct}% Mod.
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center bg-rose-50/70 border border-rose-100 rounded-xl py-1.5 px-1">
                  <span className={`text-[10px] font-bold ${data.severe > 0 ? "text-rose-700 font-black" : "text-slate-400"}`}>
                    {data.severe}
                  </span>
                  <span className="text-[9px] text-rose-600 font-semibold">
                    {sevPct}% Sev.
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
