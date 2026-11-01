"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  MapPin,
  RefreshCw,
} from "lucide-react";

import MasterDonutChart, { GrowthDimension } from "@/components/dashboard/MasterDonutChart";
import VillageStackedBarChart from "@/components/dashboard/VillageStackedBarChart";
import ImmunisationGauge from "@/components/dashboard/ImmunisationGauge";
import VillagePicker, { VillageSearchResult } from "@/components/dashboard/VillagePicker";
import VillageChildRosterTable, { clearVillageChildrenCache } from "@/components/dashboard/VillageChildRosterTable";
import { api, ApiError } from "@/lib/api";
import { Officer, clearSession, getSession } from "@/lib/auth";

interface BlockOption {
  id: string;
  name: string;
}

// block_id for the "All talukas" view (every taluka the user may see, combined).
const ALL_TALUKAS = "all";

// The village whose children are shown; carries its own taluka since search can reach beyond the current view.
interface SelectedVillage {
  // Display label, matching the village chart's (e.g. "Kadgaon (Bhudargad)" in the All Talukas view).
  label: string;
  villageName: string;
  blockId: string;
  block: string;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [activeBlockName, setActiveBlockName] = useState<string>("");
  const [kpi, setKpi] = useState<any | null>(null);
  const [villages, setVillages] = useState<VillageSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Progressive Drill-down state
  // No donut is selected on load; the village breakdown only appears once the user picks one.
  const [activeDimension, setActiveDimension] = useState<GrowthDimension | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<SelectedVillage | null>(null);

  // Signing out is done from the navbar; this is only used when the API rejects the token.
  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const fetchDashboardData = async (blockId?: string) => {
    setLoading(true);
    try {
      const data = await api.get<any>("/dashboard", { query: { block_id: blockId } });

      if (data) {
        setBlocks(data.blocks || []);
        setActiveBlockName(data.activeBlock?.name || "Taluka");
        setSelectedBlockId(data.activeBlock?.id || "");
        setKpi(data.kpi);
        setVillages(data.villages || []);
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

  const isAllTalukas = selectedBlockId === ALL_TALUKAS;
  // Empty until the first load says which taluka (or All Talukas) is active.
  const talukaLabel = isAllTalukas ? "All Talukas" : activeBlockName ? `${activeBlockName} Taluka` : "";

  const handleDimensionChange = (dim: GrowthDimension) => {
    setActiveDimension(dim);
    // Smooth scroll down to village distribution section
    setTimeout(() => {
      const el = document.getElementById("village-distribution-tier");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const openVillage = (village: SelectedVillage) => {
    setSelectedVillage(village);
    // Smooth scroll down to the child roster table
    setTimeout(() => {
      const el = document.getElementById("village-child-roster");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // From the village chart, which identifies villages by their label.
  const handleChartVillageSelect = (label: string) => {
    const v = villages.find((item) => item.village === label);
    if (v) openVillage({ label: v.village, villageName: v.villageName, blockId: v.blockId, block: v.block });
  };

  // From the search box; the village may be in a taluka other than the one on screen.
  const handleSearchVillageSelect = (v: VillageSearchResult) => {
    // Matches the chart's labels: the taluka is added in the All Talukas view or when it differs from the view.
    const label = isAllTalukas || v.blockId !== selectedBlockId ? `${v.villageName} (${v.block})` : v.villageName;
    openVillage({ label, villageName: v.villageName, blockId: v.blockId, block: v.block });
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
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ==================== TIER 1: ALL 4 PIE CHARTS SIDE BY SIDE (ZERO CARDS) ==================== */}
        {kpi && (
          <div className="w-full space-y-4">
            {/* Vaccination coverage is cohort-wide, so it sits with the donuts rather than the per-dimension drilldown. */}
            <ImmunisationGauge rate={kpi.vaccineRate} target={95.0} />
            <MasterDonutChart
              totalChildren={kpi.totalChildren}
              dimensions={kpi.dimensions}
              activeDimension={activeDimension}
              onDimensionChange={handleDimensionChange}
              talukaName={talukaLabel}
            />
          </div>
        )}

        {/* ==================== TIER 2: VILLAGE STACKED BAR CHART ==================== */}
        {/* Only shown once a donut above is selected; Hide clears the selection. */}
        {activeDimension && villages.length > 0 && (
          <div id="village-distribution-tier" className="scroll-mt-6">
            <VillageStackedBarChart
              villages={villages}
              activeDimension={activeDimension}
              talukaName={talukaLabel}
              selectedVillage={selectedVillage?.label ?? null}
              onSelectVillage={handleChartVillageSelect}
              isCollapsed={false}
              onToggleCollapse={() => setActiveDimension(null)}
            />
          </div>
        )}

        {/* ==================== TIER 3: ON-DEMAND VILLAGE CHILD CLINICAL TABLE ==================== */}
        {selectedVillage ? (
          <div className="w-full">
            <VillageChildRosterTable
              // A new village starts from page 1 with no filter or search.
              key={`${selectedVillage.blockId}_${selectedVillage.villageName}`}
              villageName={selectedVillage.label}
              queryVillage={selectedVillage.villageName}
              talukaName={`${selectedVillage.block} Taluka`}
              blockId={selectedVillage.blockId}
              onSelectVillage={handleSearchVillageSelect}
              onClearVillageFilter={handleClearVillageFilter}
            />
          </div>
        ) : (
          <div id="village-child-roster" className="bg-white border border-dashed border-slate-300 rounded-3xl p-6 text-center shadow-xs">
            <p className="text-sm text-slate-800 font-bold flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Child Clinical Table</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
              Search for a village, or click a bar on the chart above, to view children&apos;s growth and Z-score assessments.
            </p>

            <div className="mt-4 max-w-md mx-auto">
              <VillagePicker onSelectVillage={handleSearchVillageSelect} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
