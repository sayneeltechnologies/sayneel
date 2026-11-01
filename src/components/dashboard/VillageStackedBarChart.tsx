"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BarChart3, AlertCircle, ArrowDownRight, Maximize2, Minimize2, ChevronDown, ChevronUp } from "lucide-react";
import { GrowthDimension } from "./MasterDonutChart";

interface VillageSummary {
  village: string;
  sector: string;
  awcIds: string[];
  awcCount: number;
  totalChildren: number;
  normalCount: number;
  mamCount: number;
  samCount: number;
  wazNormal: number;
  wazModerate: number;
  wazSevere: number;
  whzNormal: number;
  whzModerate: number;
  whzSevere: number;
  hazNormal: number;
  hazModerate: number;
  hazSevere: number;
}

interface Props {
  villages: VillageSummary[];
  activeDimension: GrowthDimension;
  talukaName: string;
  selectedVillage: string | null;
  onSelectVillage: (villageName: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DIMENSION_TITLES = {
  status: "Overall Malnutrition (Normal vs MAM vs SAM)",
  waz: "Underweight Distribution (Weight-for-Age)",
  whz: "Acute Wasting Distribution (Weight-for-Height)",
  haz: "Chronic Stunting Distribution (Height-for-Age)",
};

export default function VillageStackedBarChart({
  villages,
  activeDimension,
  talukaName,
  selectedVillage,
  onSelectVillage,
  isExpanded = false,
  onToggleExpand,
  isCollapsed = false,
  onToggleCollapse,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Senior Dev Optimization: Single O(N) pass to filter active villages, transform chart data,
  // and compute severe hotspots, memoized to preserve object references and prevent Recharts re-render thrashing.
  const { displayedVillages, chartData, totalSevere } = useMemo(() => {
    const displayed: VillageSummary[] = [];
    const chart: Array<{
      name: string;
      village: string;
      sector: string;
      total: number;
      normal: number;
      moderate: number;
      severe: number;
    }> = [];
    let severeSum = 0;

    for (let i = 0; i < villages.length; i++) {
      const v = villages[i];
      if (v.totalChildren <= 0) continue;

      displayed.push(v);

      let normal = v.normalCount;
      let moderate = v.mamCount;
      let severe = v.samCount;

      if (activeDimension === "waz") {
        normal = v.wazNormal;
        moderate = v.wazModerate;
        severe = v.wazSevere;
      } else if (activeDimension === "whz") {
        normal = v.whzNormal;
        moderate = v.whzModerate;
        severe = v.whzSevere;
      } else if (activeDimension === "haz") {
        normal = v.hazNormal;
        moderate = v.hazModerate;
        severe = v.hazSevere;
      }

      severeSum += severe;

      chart.push({
        name: v.village,
        village: v.village,
        sector: v.sector,
        total: v.totalChildren,
        normal,
        moderate,
        severe,
      });
    }

    return { displayedVillages: displayed, chartData: chart, totalSevere: severeSum };
  }, [villages, activeDimension]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Village-Wise Stacked Distribution
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing: <strong className="text-slate-800">{DIMENSION_TITLES[activeDimension]}</strong> across {talukaName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {totalSevere > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>{totalSevere} Severe Hotspots</span>
              </span>
            )}

            {/* Expand / Maximize Width Button */}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition border border-slate-200 cursor-pointer"
                title={isExpanded ? "Restore standard 8-column layout" : "Expand chart across full width (12 columns)"}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Compact</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Expand</span>
                  </>
                )}
              </button>
            )}

            {/* Collapse / Unfold Toggle Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
                title={isCollapsed ? "Show Chart View" : "Hide Chart View"}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                    <span>Open</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                    <span>Hide</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Legend Pills & Drill-down Helper */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-2">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Normal / Healthy
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> Moderate (MAM / -2 SD)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> Severe (SAM / -3 SD)
            </span>
          </div>

          <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> Click any bar below to inspect children
          </span>
        </div>

        {/* Chart Canvas */}
        <div className={`w-full pt-2 cursor-pointer ${chartData.length > 8 ? "overflow-x-auto" : "h-72 sm:h-80"}`}>
        {!isMounted ? (
          <div className="w-full h-72 flex items-center justify-center bg-slate-50 rounded-2xl animate-pulse text-xs text-slate-400">
            Rendering Village Stacked Bars...
          </div>
        ) : (
          <div style={{ minWidth: chartData.length > 8 ? `${Math.max(chartData.length * 70, 700)}px` : "100%", height: "320px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 45 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const clickedVillage = e.activePayload[0].payload.village;
                    onSelectVillage(clickedVillage);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#334155", fontWeight: 700 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  height={65}
                  stroke="#CBD5E1"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  stroke="#CBD5E1"
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 z-50">
                          <div className="font-bold text-sm text-slate-100 flex items-center justify-between gap-4">
                            <span>{d.village}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Sector: {d.sector}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium pb-1 border-b border-slate-800">
                            Total Children: <strong className="text-white">{d.total}</strong>
                          </p>
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <span>🟢 Healthy:</span>
                            <strong className="font-mono">{d.normal} ({d.total > 0 ? Math.round((d.normal / d.total) * 100) : 0}%)</strong>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-amber-400">
                            <span>🟡 Moderate:</span>
                            <strong className="font-mono">{d.moderate} ({d.total > 0 ? Math.round((d.moderate / d.total) * 100) : 0}%)</strong>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-rose-400">
                            <span>🔴 Severe:</span>
                            <strong className="font-mono">{d.severe} ({d.total > 0 ? Math.round((d.severe / d.total) * 100) : 0}%)</strong>
                          </div>
                          <p className="text-[10px] text-blue-300 pt-1 border-t border-slate-800 italic">
                            Click to view {d.village} child table &darr;
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="normal"
                  name="Normal"
                  stackId="a"
                  fill="#10B981"
                  radius={[0, 0, 0, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    const v = data?.village || data?.name;
                    if (v) onSelectVillage(v);
                  }}
                />
                <Bar
                  dataKey="moderate"
                  name="Moderate"
                  stackId="a"
                  fill="#F59E0B"
                  cursor="pointer"
                  onClick={(data: any) => {
                    const v = data?.village || data?.name;
                    if (v) onSelectVillage(v);
                  }}
                />
                <Bar
                  dataKey="severe"
                  name="Severe"
                  stackId="a"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    const v = data?.village || data?.name;
                    if (v) onSelectVillage(v);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  )}
</div>

{!isCollapsed && (
  <div className="pt-3 border-t border-slate-100 space-y-2.5">
    {/* Interactive Village Drilldown Selection Bar */}
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
        <ArrowDownRight className="w-3.5 h-3.5 text-blue-600" />
        Select Village:
      </span>
      {displayedVillages.map((v) => {
        const isSelected = selectedVillage === v.village;
        return (
          <button
            key={v.village}
            type="button"
            onClick={() => onSelectVillage(v.village)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              isSelected
                ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300"
                : "bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200"
            }`}
            title={`Click to view ${v.village} child clinical table`}
          >
            <span>{v.village}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-px rounded-md ${
                isSelected ? "bg-blue-800 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {v.totalChildren}
            </span>
            {v.samCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title={`${v.samCount} SAM`} />
            )}
          </button>
        );
      })}
    </div>

    <div className="text-[11px] text-slate-400 flex items-center justify-between">
      <span>Click any bar or village button above to inspect individual child records below</span>
      {selectedVillage && (
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
          Showing: {selectedVillage}
        </span>
      )}
    </div>
  </div>
)}
</div>
);
}
