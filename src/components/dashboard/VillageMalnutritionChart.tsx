"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { BarChart3, AlertCircle } from "lucide-react";

interface VillageData {
  id: string;
  sector: string;
  village: string;
  awcName: string;
  workerName: string;
  totalChildren: number;
  normalCount: number;
  mamCount: number;
  samCount: number;
  vaccineRate: number;
  status: "Normal" | "Attention" | "Critical";
}

interface Props {
  data: VillageData[];
  talukaName: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 z-50">
        <div className="font-bold text-sm text-slate-100 flex items-center justify-between gap-4">
          <span>{d.village}</span>
          <span className="text-[10px] text-slate-400 font-normal">Sector: {d.sector}</span>
        </div>
        <p className="text-[11px] text-slate-300 font-medium pb-1 border-b border-slate-800">
          Total Children: <span className="font-bold text-white">{d.total}</span>
        </p>
        <div className="flex items-center justify-between gap-4 text-emerald-400">
          <span>🟢 Healthy (Normal):</span>
          <span className="font-bold">{d.normal} ({d.total > 0 ? Math.round((d.normal / d.total) * 100) : 0}%)</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-amber-400">
          <span>🟡 Moderate (MAM):</span>
          <span className="font-bold">{d.mam} ({d.total > 0 ? Math.round((d.mam / d.total) * 100) : 0}%)</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-rose-400">
          <span>🔴 Severe (SAM):</span>
          <span className="font-bold">{d.sam} ({d.total > 0 ? Math.round((d.sam / d.total) * 100) : 0}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function VillageMalnutritionChart({ data, talukaName }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format data for Recharts
  const chartData = data.map((item) => ({
    name: item.village.length > 12 ? item.village.slice(0, 12) + "…" : item.village,
    village: item.village,
    sector: item.sector,
    total: item.totalChildren,
    normal: item.normalCount,
    mam: item.mamCount,
    sam: item.samCount,
  }));

  const totalSamCases = data.reduce((acc, curr) => acc + curr.samCount, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Village-Wise Malnutrition Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative cohort distribution across all Anganwadi centers in {talukaName}
            </p>
          </div>

          {totalSamCases > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold self-start sm:self-auto">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{totalSamCases} SAM Cases Requiring Clinical Triage</span>
            </div>
          )}
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-4 pb-2">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded bg-emerald-500"></span> Healthy (Normal)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded bg-amber-500"></span> Moderate (MAM)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded bg-rose-500"></span> Severe (SAM Red)
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 pt-2">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl animate-pulse text-xs text-slate-400">
            Loading chart visualizations...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#475569" }}
                angle={-20}
                textAnchor="end"
                interval={0}
                stroke="#CBD5E1"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                stroke="#CBD5E1"
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="normal" name="Healthy" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="mam" name="MAM (Moderate)" stackId="a" fill="#F59E0B" />
              <Bar dataKey="sam" name="SAM (Severe)" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Note */}
      <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span>Click or hover any bar to view child counts by village</span>
        <span className="font-medium text-slate-500">WHO Standard Z-Score Triage</span>
      </p>
    </div>
  );
}
