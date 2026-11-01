"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  MapPin,
  RefreshCw,
  LineChart,
} from "lucide-react";

import MasterDonutChart, { GrowthDimension } from "@/components/dashboard/MasterDonutChart";
import VillageStackedBarChart from "@/components/dashboard/VillageStackedBarChart";
import ImmunisationGauge from "@/components/dashboard/ImmunisationGauge";
import VillageChildRosterTable, { clearVillageChildrenCache } from "@/components/dashboard/VillageChildRosterTable";
import { api, ApiError } from "@/lib/api";
import { Officer, clearSession, getSession } from "@/lib/auth";

interface BlockOption {
  id: string;
  name: string;
}

// block_id for the "All talukas" view (every taluka the user may see, combined).
const ALL_TALUKAS = "all";

interface VillageSummary {
  // Display label; in the All talukas view it includes the taluka, e.g. "Kadgaon (Bhudargad)".
  village: string;
  villageName: string;
  blockId: string;
  block: string;
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

export default function BdoDashboardPage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [activeBlockName, setActiveBlockName] = useState<string>("");
  const [kpi, setKpi] = useState<any | null>(null);
  const [villages, setVillages] = useState<VillageSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Progressive Drill-down state
  const [activeDimension, setActiveDimension] = useState<GrowthDimension>("status");
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [isVillageChartExpanded, setIsVillageChartExpanded] = useState<boolean>(false);
  const [isVillageChartCollapsed, setIsVillageChartCollapsed] = useState<boolean>(true);

  // Signing out is done from the navbar; this is only used when the API rejects the token.
  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const fetchDashboardData = async (blockId?: string) => {
    setLoading(true);
    try {
      const data = await api.get<any>("/dashboard/bdo", { query: { block_id: blockId } });

      if (data) {
        setBlocks(data.blocks || []);
        setActiveBlockName(data.activeBlock?.name || "Taluka");
        setSelectedBlockId(data.activeBlock?.id || "");
        setKpi(data.kpi);
        setVillages(data.villages || []);

        // Do not auto-load village child roster on startup to reduce API calls (loads on-demand when clicked)
        setSelectedVillage((prev) =>
          prev && data.villages?.some((v: any) => v.village === prev) ? prev : null
        );
      }
    } catch (err) {
      // Expired or invalid token: back to sign in.
      if (err instanceof ApiError && err.status === 401) {
        handleLogout();
        return;
      }
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setOfficer(session);
    fetchDashboardData();
  }, []);

  const handleBlockChange = (newBlockId: string) => {
    clearVillageChildrenCache();
    setSelectedBlockId(newBlockId);
    setSelectedVillage(null);
    fetchDashboardData(newBlockId);
  };

  const handleRefresh = () => {
    clearVillageChildrenCache();
    fetchDashboardData(selectedBlockId);
  };

  // Senior Dev Optimization: Memoize transformed and filtered village lists
  // Prevents re-creating object arrays on every render pass
  const activeVillages = useMemo(
    () => villages.filter((v) => v.totalChildren > 0),
    [villages]
  );

  const villageOptions = useMemo(
    () => villages.map((v) => ({ village: v.village, totalChildren: v.totalChildren })),
    [villages]
  );

  const isAllTalukas = selectedBlockId === ALL_TALUKAS;
  // Empty until the first load says which taluka (or All Talukas) is active.
  const talukaLabel = isAllTalukas ? "All Talukas" : activeBlockName ? `${activeBlockName} Taluka` : "";
  // The drilldown needs the selected village's own name and taluka (they differ from the label in the All view).
  const selectedVillageSummary = villages.find((v) => v.village === selectedVillage);

  const handleDimensionChange = (dim: GrowthDimension) => {
    setActiveDimension(dim);
    setIsVillageChartCollapsed(false);
    // Smooth scroll down to village distribution section
    setTimeout(() => {
      const el = document.getElementById("village-distribution-tier");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleVillageSelect = (villageName: string) => {
    setSelectedVillage(villageName);
    // Smooth scroll down to the child roster table
    setTimeout(() => {
      const el = document.getElementById("village-child-roster");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleClearVillageFilter = () => {
    setSelectedVillage(null);
    const el = document.getElementById("village-distribution-tier");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* ==================== OFFICIALS DASHBOARD HEADER (BDO, CDPO, DPO, Sarpanch, Admin) ==================== */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider">
                  OFFICIALS DASHBOARD
                </span>              </div>
              <h1 className="text-2xl font-bold mt-1 text-white tracking-tight flex items-center gap-2">
                {talukaLabel} &mdash; Child Growth &amp; Immunisation
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as: <strong className="text-white">{officer?.name}</strong> ({officer?.roleLabel})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              {/* Taluka Selector */}
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300 font-semibold">Taluka:</span>
                <select
                  value={selectedBlockId}
                  onChange={(e) => handleBlockChange(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                >
                  {blocks.length > 1 && (
                    <option value={ALL_TALUKAS} className="bg-slate-900 text-white">
                      All Talukas
                    </option>
                  )}
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Refresh from Database (Clears Cache)"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ==================== TIER 1: ALL 4 PIE CHARTS SIDE BY SIDE (ZERO CARDS) ==================== */}
        {kpi && (
          <div className="w-full">
            <MasterDonutChart
              totalChildren={kpi.totalChildren}
              dimensions={kpi.dimensions}
              activeDimension={activeDimension}
              onDimensionChange={handleDimensionChange}
              talukaName={talukaLabel}
            />
          </div>
        )}

        {/* ==================== TIER 2: VILLAGE STACKED BAR CHART + VACCINATION METER ==================== */}
        {villages.length > 0 && kpi && (
          <div id="village-distribution-tier" className="scroll-mt-6">
            {isVillageChartCollapsed ? (
              <div
                onClick={() => setIsVillageChartCollapsed(false)}
                className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-[18px] flex items-center justify-between cursor-pointer transition shadow-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <LineChart className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>Village-Wise Stacked Distribution &amp; Immunisation Meter</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        {activeVillages.length} Active Villages
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Loaded on-demand. Click to inspect village distribution for <strong>{activeDimension.toUpperCase()}</strong> &rarr;
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 group-hover:bg-blue-600 group-hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Breakdown</span>
                  <span>▼</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Village-Wise Stacked Bar Chart (8 cols standard, or 12 cols full width when expanded) */}
                <div className={isVillageChartExpanded ? "lg:col-span-12" : "lg:col-span-8"}>
                  <VillageStackedBarChart
                    villages={villages}
                    activeDimension={activeDimension}
                    talukaName={talukaLabel}
                    selectedVillage={selectedVillage}
                    onSelectVillage={handleVillageSelect}
                    isExpanded={isVillageChartExpanded}
                    onToggleExpand={() => setIsVillageChartExpanded(!isVillageChartExpanded)}
                    isCollapsed={false}
                    onToggleCollapse={() => setIsVillageChartCollapsed(true)}
                  />
                </div>

                {/* Vaccination Meter (4 cols standard, or 12 cols below when expanded) */}
                <div className={isVillageChartExpanded ? "lg:col-span-12 flex flex-col justify-between" : "lg:col-span-4 flex flex-col justify-between"}>
                  <ImmunisationGauge rate={kpi.vaccineRate} target={95.0} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TIER 3: ON-DEMAND VILLAGE CHILD CLINICAL TABLE ==================== */}
        {selectedVillage ? (
          <div className="w-full">
            <VillageChildRosterTable
              villageName={selectedVillage}
              queryVillage={selectedVillageSummary?.villageName ?? selectedVillage}
              talukaName={selectedVillageSummary?.block ? `${selectedVillageSummary.block} Taluka` : talukaLabel}
              blockId={selectedVillageSummary?.blockId ?? selectedBlockId}
              allVillages={villageOptions}
              onSelectVillage={handleVillageSelect}
              onClearVillageFilter={handleClearVillageFilter}
            />
          </div>
        ) : (
          <div id="village-child-roster" className="bg-white border border-dashed border-slate-300 rounded-3xl p-6 text-center shadow-xs">
            <p className="text-sm text-slate-800 font-bold flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Child Clinical Table (Loaded On-Demand to Conserve API Calls)</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
              Select any village below or click a bar on the chart above to load its individual child growth registry and Z-score assessments:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-3xl mx-auto">
              {activeVillages.map((v) => (
                <button
                  key={v.village}
                  type="button"
                  onClick={() => handleVillageSelect(v.village)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{v.village}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-px rounded-md font-mono">
                    {v.totalChildren}
                  </span>
                  {v.samCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" title={`${v.samCount} SAM Hotspots`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
