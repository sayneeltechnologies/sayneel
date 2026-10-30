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

        // Default to first village if none selected
        if (data.villages && data.villages.length > 0) {
          setSelectedVillage((prev) =>
            prev && data.villages.some((v: any) => v.village === prev)
              ? prev
              : data.villages[0].village
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

  const handleVillageSelect = (villageName: string) => {
    setSelectedVillage(villageName);
    // Smooth scroll down to the child roster table
    const el = document.getElementById("village-child-roster");
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
        {/* ==================== TIER 1: HIGH-LEVEL VISUAL MASTER CHARTS ==================== */}
        {kpi && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 8 Cols: Master Donut with Dimension Toggle (Status, WAZ, WHZ, HAZ) */}
            <div className="lg:col-span-8">
              <MasterDonutChart
                totalChildren={kpi.totalChildren}
                dimensions={kpi.dimensions}
                activeDimension={activeDimension}
                onDimensionChange={(dim) => setActiveDimension(dim)}
                talukaName={activeBlockName}
              />
            </div>

            {/* Right 4 Cols: Vaccine Target Speedometer Gauge */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <ImmunisationGauge rate={kpi.vaccineRate} target={95.0} />
            </div>
          </div>
        )}

        {/* ==================== TIER 2: VILLAGE-WISE STACKED BAR CHART ==================== */}
        {villages.length > 0 && (
          <div className="w-full">
            <VillageStackedBarChart
              villages={villages}
              activeDimension={activeDimension}
              talukaName={activeBlockName}
              selectedVillage={selectedVillage}
              onSelectVillage={handleVillageSelect}
            />
          </div>
        )}

        {/* ==================== TIER 3: DIRECT VILLAGE CHILD CLINICAL TABLE ==================== */}
        {selectedVillage && (
          <div className="w-full">
            <VillageChildRosterTable
              villageName={selectedVillage}
              talukaName={activeBlockName}
              blockId={selectedBlockId}
              allVillages={villages.map((v) => ({ village: v.village, totalChildren: v.totalChildren }))}
              onSelectVillage={handleVillageSelect}
              onClearVillageFilter={() => {
                // Scroll back up to Tier 2
                window.scrollTo({ top: 350, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
