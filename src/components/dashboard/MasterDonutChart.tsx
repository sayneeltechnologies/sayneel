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
      {/* Section Header with Taluka & Standard Info */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              WHO Clinical Growth Standards &mdash; 4 Dimensions
            </h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {talukaName} Taluka
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any pie chart below to inspect village-wise distribution. Standard WHO Z-Score classifications applied.
          </p>
        </div>

        {/* Unified Legend Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Triage:</span>
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

      {/* 4 Pie / Donut Charts Side-by-Side (Modeled after Executive Dashboard reference) */}
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

          const chartData = [
            { name: dim.normalLabel, value: data.normal, color: "#10B981" },
            { name: dim.moderateLabel, value: data.moderate, color: "#F59E0B" },
            { name: dim.severeLabel, value: data.severe, color: "#EF4444" },
          ];

          return (
            <div
              key={dim.key}
              onClick={() => onDimensionChange(dim.key)}
              className={`rounded-2xl border p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 ${
                isActive
                  ? "bg-gradient-to-b from-blue-50/50 via-white to-white border-blue-600 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                        {dim.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {dim.shortCode}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 transition">
                      View &rarr;
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-1">
                  {dim.subtitle}
                </p>
              </div>

              {/* Donut Chart Canvas with Sculpted Center & Sleek Ring */}
              <div className="relative w-full h-[200px] my-1 flex items-center justify-center">
                {!isMounted ? (
                  <div className="w-32 h-32 rounded-full border-4 border-slate-100 animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="64%"
                        outerRadius="88%"
                        paddingAngle={data.moderate > 0 || data.severe > 0 ? 2.5 : 0}
                        cornerRadius={3}
                        dataKey="value"
                        labelLine={false}
                        isAnimationActive={true}
                        animationDuration={500}
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {chartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 12,
                          backgroundColor: "#0F172A",
                          borderColor: "#334155",
                          color: "#F8FAFC",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        }}
                        itemStyle={{ color: "#F8FAFC", fontWeight: 600 }}
                        formatter={(val, name) => [
                          `${Number(val).toLocaleString()} children (${evaluated > 0 ? ((Number(val) * 100) / evaluated).toFixed(1) : 0}%)`,
                          String(name),
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* Polished Center Hub */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[100px] h-[100px] rounded-full bg-slate-50/90 border border-slate-200/70 shadow-xs flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                      COHORT
                    </span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-1">
                      {Number(evaluated).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full mt-1 border border-emerald-300/50 leading-none">
                      {evaluated > 0 ? Math.round((data.normal / evaluated) * 100) : 0}% Normal
                    </span>
                  </div>
                </div>
              </div>

              {/* Finishing Touch: Crisp 3-Part Micro-Pill Metric Row */}
              <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-slate-100 mt-1">
                <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl py-1 px-1 text-center">
                  <div className="text-[10px] font-bold text-emerald-800">Normal</div>
                  <div className="font-extrabold text-xs text-emerald-950 font-mono">
                    {evaluated > 0 ? Math.round((data.normal / evaluated) * 100) : 0}%
                  </div>
                </div>

                <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl py-1 px-1 text-center">
                  <div className="text-[10px] font-bold text-amber-800">MAM</div>
                  <div className="font-extrabold text-xs text-amber-950 font-mono">
                    {evaluated > 0 ? Math.round((data.moderate / evaluated) * 100) : 0}%
                  </div>
                </div>

                <div
                  className={`border rounded-xl py-1 px-1 text-center ${
                    data.severe > 0 ? "bg-rose-50 border-rose-200 shadow-xs" : "bg-slate-50 border-slate-200/60"
                  }`}
                >
                  <div className={`text-[10px] font-bold ${data.severe > 0 ? "text-rose-800" : "text-slate-400"}`}>
                    SAM
                  </div>
                  <div
                    className={`font-extrabold text-xs font-mono ${
                      data.severe > 0 ? "text-rose-950" : "text-slate-400"
                    }`}
                  >
                    {evaluated > 0 ? Math.round((data.severe / evaluated) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
