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
    shortCode: "WAZ",
    subtitle: "Underweight Monitoring",
    icon: Scale,
    normalLabel: "Normal Weight",
    moderateLabel: "Mod. Underweight",
    severeLabel: "Sev. Underweight",
  },
  {
    key: "whz",
    title: "Weight-for-Height",
    shortCode: "WHZ / WFL",
    subtitle: "Acute Wasting & Starvation",
    icon: HeartPulse,
    normalLabel: "Normal Proportions",
    moderateLabel: "Moderate Wasting",
    severeLabel: "Severe Wasting",
  },
  {
    key: "haz",
    title: "Height-for-Age",
    shortCode: "HAZ / LHFA",
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
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>WHO Clinical Growth Standards &mdash; 4 Dimensions</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Simultaneous Overview
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Click any of the 4 pie charts to inspect its village-wise stacked distribution below
          </p>
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          {talukaName} Taluka
        </span>
      </div>

      {/* 4 Pie / Donut Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-500/30"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600">
                      Select &rarr;
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug line-clamp-1">
                  {dim.subtitle}
                </p>
              </div>

              {/* Mini Donut Chart Canvas */}
              <div className="relative w-full h-36 my-2 flex items-center justify-center">
                {!isMounted ? (
                  <div className="w-24 h-24 rounded-full border-4 border-slate-100 animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={56}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={700}
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
                                <span className="font-bold">{d.name}:</span> {d.value} children ({evaluated > 0 ? Math.round(((d.value as number) / evaluated) * 100) : 0}%)
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* Center Hole Callout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                    {evaluated}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                    Cohort
                  </span>
                </div>
              </div>

              {/* Status Breakdown Pills */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {data.normal} <span className="text-[10px] text-slate-400 font-normal">({normPct}%)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate
                  </span>
                  <span className="font-mono font-bold text-amber-700">
                    {data.moderate} <span className="text-[10px] text-slate-400 font-normal">({modPct}%)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Severe
                  </span>
                  <span className={`font-mono font-bold ${data.severe > 0 ? "text-rose-600" : "text-slate-400"}`}>
                    {data.severe} <span className="text-[10px] text-slate-400 font-normal">({sevPct}%)</span>
                  </span>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-center">
                {isActive ? (
                  <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                    <span>Showing on Village Chart below</span> &darr;
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400 group-hover:text-blue-600 transition">
                    Click to view village distribution
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
