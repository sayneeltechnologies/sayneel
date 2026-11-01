"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Activity } from "lucide-react";

interface Props {
  totalChildren: number;
  normalCount: number;
  normalPercent: string;
  mamCount: number;
  mamPercent: string;
  samCount: number;
  samPercent: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 text-xs">
        <span className="font-bold flex items-center gap-1.5" style={{ color: data.color }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></span>
          {data.name}
        </span>
        <div className="mt-1 text-slate-200">
          <strong className="text-white text-sm">{data.value}</strong> children ({data.percent}%)
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">{data.description}</p>
      </div>
    );
  }
  return null;
};

export default function NutritionDonutChart({
  totalChildren,
  normalCount,
  normalPercent,
  mamCount,
  mamPercent,
  samCount,
  samPercent,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = [
    {
      name: "Healthy",
      value: normalCount,
      percent: normalPercent,
      color: "#10B981",
      description: "WHO Z-score > -2 SD (Standard Growth)",
    },
    {
      name: "MAM (Moderate)",
      value: mamCount,
      percent: mamPercent,
      color: "#F59E0B",
      description: "WHO Z-score between -2 SD & -3 SD (THR Supplement)",
    },
    {
      name: "SAM (Severe)",
      value: samCount,
      percent: samPercent,
      color: "#EF4444",
      description: "WHO Z-score < -3 SD (Urgent NRC Hospital Referral)",
    },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">WHO Nutrition Triage</h3>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          WHO Z-Score
        </span>
      </div>

      {/* Donut Chart with Centered KPI */}
      <div className="relative w-full h-44 my-1 flex items-center justify-center">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl animate-pulse text-xs text-slate-400">
            Rendering chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={2}
                stroke="#FFFFFF"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Donut Hole Summary */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">
            {totalChildren}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
            Children
          </span>
        </div>
      </div>

      {/* Breakdown Legend */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
        <div className="p-1.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-800 block">Healthy</span>
          <span className="text-xs font-black text-emerald-600">{normalCount}</span>
          <span className="text-[10px] text-emerald-700/80 block">({normalPercent}%)</span>
        </div>
        <div className="p-1.5 rounded-lg bg-amber-50/50 border border-amber-100">
          <span className="text-[10px] font-bold text-amber-800 block">MAM</span>
          <span className="text-xs font-black text-amber-600">{mamCount}</span>
          <span className="text-[10px] text-amber-700/80 block">({mamPercent}%)</span>
        </div>
        <div className="p-1.5 rounded-lg bg-rose-50/50 border border-rose-100">
          <span className="text-[10px] font-bold text-rose-800 block">SAM</span>
          <span className="text-xs font-black text-rose-600">{samCount}</span>
          <span className="text-[10px] text-rose-700/80 block">({samPercent}%)</span>
        </div>
      </div>
    </div>
  );
}
