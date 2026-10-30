"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, Scale, Ruler, HeartPulse } from "lucide-react";

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

const DIMENSION_CONFIG = {
  status: {
    title: "Overall Triage Status",
    subtitle: "Standard WHO Composite Clinical Triage (Normal vs MAM vs SAM)",
    labels: {
      normal: "Healthy (Standard)",
      moderate: "MAM (Moderate)",
      severe: "SAM (Severe Red)",
    },
    desc: {
      normal: "WHO Z-Score > -2 SD (Healthy Growth)",
      moderate: "WHO Z-Score between -2 SD and -3 SD",
      severe: "WHO Z-Score < -3 SD (Emergency Triage)",
    },
  },
  waz: {
    title: "Weight-for-Age (WAZ)",
    subtitle: "Underweight Assessment (Body mass proportional to age)",
    labels: {
      normal: "Normal Weight",
      moderate: "Moderately Underweight",
      severe: "Severely Underweight",
    },
    desc: {
      normal: "WAZ >= -2 SD",
      moderate: "WAZ between -2 SD & -3 SD",
      severe: "WAZ < -3 SD (Severe Underweight)",
    },
  },
  whz: {
    title: "Weight-for-Height (WHZ / WFL)",
    subtitle: "Acute Wasting Assessment (Body mass proportional to stature)",
    labels: {
      normal: "Normal Proportions",
      moderate: "Moderate Wasting",
      severe: "Severe Wasting",
    },
    desc: {
      normal: "WHZ >= -2 SD",
      moderate: "WHZ between -2 SD & -3 SD (MAM Wasting)",
      severe: "WHZ < -3 SD (SAM Acute Starvation)",
    },
  },
  haz: {
    title: "Height-for-Age (HAZ / LHFA)",
    subtitle: "Chronic Stunting Assessment (Linear growth failure over age)",
    labels: {
      normal: "Normal Stature",
      moderate: "Moderate Stunting",
      severe: "Severe Stunting",
    },
    desc: {
      normal: "HAZ >= -2 SD",
      moderate: "HAZ between -2 SD & -3 SD (Chronic Nutrition Lag)",
      severe: "HAZ < -3 SD (Severe Growth Stunting)",
    },
  },
};

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

  const config = DIMENSION_CONFIG[activeDimension];
  const activeData = dimensions[activeDimension] || { normal: 0, moderate: 0, severe: 0 };

  const normPct = totalChildren > 0 ? ((activeData.normal / totalChildren) * 100).toFixed(1) : "0";
  const modPct = totalChildren > 0 ? ((activeData.moderate / totalChildren) * 100).toFixed(1) : "0";
  const sevPct = totalChildren > 0 ? ((activeData.severe / totalChildren) * 100).toFixed(1) : "0";

  const chartData = [
    {
      name: config.labels.normal,
      value: activeData.normal,
      percent: normPct,
      color: "#10B981",
      description: config.desc.normal,
    },
    {
      name: config.labels.moderate,
      value: activeData.moderate,
      percent: modPct,
      color: "#F59E0B",
      description: config.desc.moderate,
    },
    {
      name: config.labels.severe,
      value: activeData.severe,
      percent: sevPct,
      color: "#EF4444",
      description: config.desc.severe,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
      {/* ==================== DIMENSION TOGGLE PILLS ==================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {config.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{config.subtitle}</p>
          </div>

          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 self-start sm:self-auto">
            {talukaName} Taluka
          </span>
        </div>

        {/* 4 Dimension Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
          <button
            onClick={() => onDimensionChange("status")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeDimension === "status"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overall Status</span>
          </button>

          <button
            onClick={() => onDimensionChange("waz")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeDimension === "waz"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Weight (WAZ)</span>
          </button>

          <button
            onClick={() => onDimensionChange("whz")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeDimension === "whz"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Wasting (WHZ)</span>
          </button>

          <button
            onClick={() => onDimensionChange("haz")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeDimension === "haz"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Height (HAZ)</span>
          </button>
        </div>
      </div>

      {/* ==================== DONUT VISUALIZER ==================== */}
      <div className="relative w-full h-56 my-2 flex items-center justify-center">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl animate-pulse text-xs text-slate-400">
            Rendering WHO Distribution...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                        <span className="font-bold flex items-center gap-1.5" style={{ color: d.color }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                          {d.name}
                        </span>
                        <div className="mt-1 text-slate-200">
                          <strong className="text-white text-base">{d.value}</strong> children ({d.percent}%)
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{d.description}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={92}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={2}
                stroke="#FFFFFF"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Center Hole Total Summary */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            {totalChildren}
          </span>
          <span className="text-[11px] text-slate-500 font-extrabold tracking-wider uppercase mt-1">
            Total Cohort
          </span>
        </div>
      </div>

      {/* ==================== SUMMARY STATS BOTTOM PILLS ==================== */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
        <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-800 block truncate">
            {config.labels.normal}
          </span>
          <div className="text-base font-black text-emerald-700 mt-0.5">
            {activeData.normal} <span className="text-xs font-semibold text-emerald-600/80">({normPct}%)</span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
          <span className="text-[11px] font-bold text-amber-800 block truncate">
            {config.labels.moderate}
          </span>
          <div className="text-base font-black text-amber-700 mt-0.5">
            {activeData.moderate} <span className="text-xs font-semibold text-amber-600/80">({modPct}%)</span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100">
          <span className="text-[11px] font-bold text-rose-800 block truncate">
            {config.labels.severe}
          </span>
          <div className="text-base font-black text-rose-700 mt-0.5">
            {activeData.severe} <span className="text-xs font-semibold text-rose-600/80">({sevPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
