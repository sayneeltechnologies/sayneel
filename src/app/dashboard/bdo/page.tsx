"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  AlertTriangle,
  HeartPulse,
  Download,
  Search,
  LogOut,
  CheckCircle,
  TrendingDown,
  MapPin,
  Database,
  RefreshCw,
} from "lucide-react";

interface BlockOption {
  id: string;
  name: string;
}

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

interface DashboardKpi {
  totalAwcs: number;
  totalChildren: number;
  normalCount: number;
  normalPercent: string;
  mamCount: number;
  mamPercent: string;
  samCount: number;
  samPercent: string;
  vaccineRate: string;
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
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [anganwadis, setAnganwadis] = useState<VillageData[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");

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

  // Fetch real data from PostgreSQL API
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
        setSectors(data.sectors || []);
        setAnganwadis(data.anganwadis || []);
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
    fetchDashboardData(newBlockId);
  };

  const handleLogout = () => {
    localStorage.removeItem("balsaathi_user");
    router.push("/login");
  };

  // Filtered reports
  const filteredReports = anganwadis.filter((item) => {
    const matchesSearch =
      item.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.awcName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.workerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" ? true : item.status === filterStatus;

    const matchesSector =
      sectorFilter === "ALL" ? true : item.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const exportToCsv = () => {
    const headers = "Center ID,Sector,Village,Anganwadi Center,Sevika,Total Kids,Healthy,MAM,SAM,Vaccine %\n";
    const rows = filteredReports
      .map(
        (r) =>
          `"${r.id}","${r.sector}","${r.village}","${r.awcName}","${r.workerName}",${r.totalChildren},${r.normalCount},${r.mamCount},${r.samCount},${r.vaccineRate}%`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `BDO_${activeBlockName}_Taluka_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
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
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
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
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                title="Refresh from Database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={exportToCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ==================== KPI SUMMARY CARDS ==================== */}
        {kpi && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Centers</span>
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{kpi.totalAwcs} AWCs</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> 100% Reporting
              </span>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Monitored Children</span>
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {kpi.totalChildren}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">In {activeBlockName}</span>
            </div>

            {/* Card 3 (SAM) */}
            <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm bg-rose-50/30">
              <div className="flex items-center justify-between text-rose-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">SAM (Severe Red)</span>
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-2xl font-extrabold text-rose-600">{kpi.samCount}</div>
              <span className="text-xs text-rose-700 font-semibold mt-1 block">
                {kpi.samPercent}% of children
              </span>
            </div>

            {/* Card 4 (MAM) */}
            <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm bg-amber-50/30">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">MAM (Moderate)</span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600">{kpi.mamCount}</div>
              <span className="text-xs text-amber-800 mt-1 block">
                {kpi.mamPercent}% of children
              </span>
            </div>

            {/* Card 5 (Vaccines) */}
            <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm bg-emerald-50/30">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Immunisation Rate</span>
                <HeartPulse className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700">{kpi.vaccineRate}%</div>
              <span className="text-xs text-emerald-800 font-medium mt-1 block">Target: 95.0%</span>
            </div>
          </div>
        )}

        {/* ==================== MALNUTRITION DISTRIBUTION BAR ==================== */}
        {kpi && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {activeBlockName} WHO Growth Distribution &amp; Classification
                </h2>
                <p className="text-xs text-slate-500">
                  Computed via WHO Z-score reference tables for weight &amp; height
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Healthy ({kpi.normalCount} / {kpi.normalPercent}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span> MAM ({kpi.mamCount} / {kpi.mamPercent}%)
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span> SAM ({kpi.samCount} / {kpi.samPercent}%)
                </span>
              </div>
            </div>

            {/* Progress Stack Bar */}
            <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              <div
                style={{ width: `${kpi.normalPercent}%` }}
                className="bg-emerald-500 hover:opacity-90 transition-all"
                title={`Healthy: ${kpi.normalCount} children (${kpi.normalPercent}%)`}
              ></div>
              <div
                style={{ width: `${kpi.mamPercent}%` }}
                className="bg-amber-500 hover:opacity-90 transition-all"
                title={`MAM: ${kpi.mamCount} children (${kpi.mamPercent}%)`}
              ></div>
              <div
                style={{ width: `${kpi.samPercent}%` }}
                className="bg-rose-500 hover:opacity-90 transition-all"
                title={`SAM: ${kpi.samCount} children (${kpi.samPercent}%)`}
              ></div>
            </div>
          </div>
        )}

        {/* ==================== REPORTS & VILLAGE PERFORMANCE TABLE ==================== */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header & Controls */}
          <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Anganwadi Center Child Growth Records
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filteredReports.length} of {anganwadis.length} active centers in {activeBlockName} Taluka
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search village, Sevika, AWC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              {/* Sector Dropdown */}
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Status Dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="Normal">Normal</option>
                <option value="Attention">Attention (MAM)</option>
                <option value="Critical">Critical (SAM Alert)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Center ID</th>
                  <th className="py-3.5 px-4">Sector</th>
                  <th className="py-3.5 px-4">Village / Area</th>
                  <th className="py-3.5 px-4">Anganwadi Center</th>
                  <th className="py-3.5 px-4">Sevika Name</th>
                  <th className="py-3.5 px-4 text-center">Enrolled</th>
                  <th className="py-3.5 px-4 text-center text-emerald-700">Healthy</th>
                  <th className="py-3.5 px-4 text-center text-amber-700">MAM</th>
                  <th className="py-3.5 px-4 text-center text-rose-700">SAM</th>
                  <th className="py-3.5 px-4 text-center">Vaccine %</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{item.id}</td>
                    <td className="py-3 px-4 font-medium">{item.sector}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.village}</td>
                    <td className="py-3 px-4 font-medium">{item.awcName}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{item.workerName}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{item.totalChildren}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700 bg-emerald-50/40">
                      {item.normalCount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-amber-700 bg-amber-50/40">
                      {item.mamCount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-rose-700 bg-rose-50/40">
                      {item.samCount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-700">
                        {item.vaccineRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.status === "Normal" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          On Track
                        </span>
                      )}
                      {item.status === "Attention" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Monitor MAM
                        </span>
                      )}
                      {item.status === "Critical" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                          SAM Alert
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
