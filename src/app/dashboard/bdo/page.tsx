"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  LogOut,
  MapPin,
  Database,
  RefreshCw,
  LineChart,
} from "lucide-react";

import MasterDonutChart, { GrowthDimension } from "@/components/dashboard/MasterDonutChart";
import VillageStackedBarChart from "@/components/dashboard/VillageStackedBarChart";
import ImmunisationGauge from "@/components/dashboard/ImmunisationGauge";
import VillageChildRosterTable from "@/components/dashboard/VillageChildRosterTable";

interface BlockOption {
  id: string;
  name: string;
}

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

const DEFAULT_OFFICER = {
  name: "Dr. R. K. Patil",
  role: "BDO",
  roleLabel: "Block Development Officer (गट विकास अधिकारी)",
  jurisdiction: "Bhudargad Taluka, District Kolhapur",
};

export default function BdoDashboardPage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<any>(DEFAULT_OFFICER);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [activeBlockName, setActiveBlockName] = useState<string>("Bhudargad");
  const [kpi, setKpi] = useState<any | null>(null);
  const [villages, setVillages] = useState<VillageSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Progressive Drill-down state
  const [activeDimension, setActiveDimension] = useState<GrowthDimension>("status");
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [showVillageBreakdown, setShowVillageBreakdown] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("balsaathi_user");
    if (savedUser) {
      try {
        setOfficer(JSON.parse(savedUser));
      } catch {
        setOfficer(DEFAULT_OFFICER);
      }
    } else {
      localStorage.setItem("balsaathi_user", JSON.stringify(DEFAULT_OFFICER));
      setOfficer(DEFAULT_OFFICER);
    }
  }, []);

  const fetchDashboardData = async (blockId?: string) => {
    setLoading(true);
    try {
      const url = blockId
        ? `/api/dashboard/bdo?block_id=${blockId}`
        : `/api/dashboard/bdo`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && !data.error) {
        setBlocks(data.blocks || []);
        setActiveBlockName(data.activeBlock?.name || "Taluka");
        setSelectedBlockId(data.activeBlock?.id || "");
        setKpi(data.kpi);
        setVillages(data.villages || []);

        // Default to the first active village with children (e.g. Akurde with 46 children)
        if (data.villages && data.villages.length > 0) {
          const firstActive = data.villages.find((v: any) => v.totalChildren > 0) || data.villages[0];
          setSelectedVillage((prev) =>
            prev && data.villages.some((v: any) => v.village === prev)
              ? prev
              : firstActive.village
          );
        } else {
          setSelectedVillage(null);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data from PostgreSQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBlockChange = (newBlockId: string) => {
    setSelectedBlockId(newBlockId);
    setSelectedVillage(null);
    fetchDashboardData(newBlockId);
  };

  const handleLogout = () => {
    localStorage.removeItem("balsaathi_user");
    router.push("/login");
  };

  const handleDimensionChange = (dim: GrowthDimension) => {
    setActiveDimension(dim);
    setShowVillageBreakdown(true);
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
      {/* ==================== BDO GOVERNANCE HEADER ==================== */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider">
                  BDO PORTAL
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <Database className="w-3.5 h-3.5" />
                  Live PostgreSQL DB
                </span>
              </div>
              <h1 className="text-2xl font-bold mt-1 text-white tracking-tight flex items-center gap-2">
                {activeBlockName} Taluka &mdash; Child Growth &amp; Immunisation
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as: <strong className="text-white">{officer?.name || "Dr. R. K. Patil"}</strong> ({officer?.roleLabel || "Block Development Officer"})
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
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => fetchDashboardData(selectedBlockId)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Refresh from Database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
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
              talukaName={activeBlockName}
            />
          </div>
        )}

        {/* ==================== TIER 2: VILLAGE STACKED BAR CHART + VACCINATION METER ==================== */}
        {villages.length > 0 && kpi && (
          <div id="village-distribution-tier" className="space-y-4 scroll-mt-6">
            <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">
                    Tier 2 &mdash; Village-Wise Stacked Distribution &amp; Immunisation Coverage
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing distribution for <strong>{activeDimension.toUpperCase()}</strong> across {villages.filter((v) => v.totalChildren > 0).length} active villages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVillageBreakdown(!showVillageBreakdown)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition cursor-pointer"
              >
                {showVillageBreakdown ? "Collapse Breakdown ▲" : "Expand Breakdown ▼"}
              </button>
            </div>

            {showVillageBreakdown && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Village-Wise Stacked Bar Chart (8 cols) */}
                <div className="lg:col-span-8">
                  <VillageStackedBarChart
                    villages={villages}
                    activeDimension={activeDimension}
                    talukaName={activeBlockName}
                    selectedVillage={selectedVillage}
                    onSelectVillage={handleVillageSelect}
                  />
                </div>

                {/* Vaccination Meter (4 cols) */}
                <div className="lg:col-span-4 flex flex-col justify-between">
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
              talukaName={activeBlockName}
              blockId={selectedBlockId}
              allVillages={villages.map((v) => ({ village: v.village, totalChildren: v.totalChildren }))}
              onSelectVillage={handleVillageSelect}
              onClearVillageFilter={handleClearVillageFilter}
            />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/60 border border-dashed border-blue-200 rounded-3xl p-6 text-center shadow-xs">
            <p className="text-sm text-slate-700 font-bold">
              Village Child Roster is Lazy-Loaded (On-Demand)
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
              To minimize unnecessary API requests and reduce bandwidth, individual child records are fetched only when you click on a specific village bar or village selector above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
