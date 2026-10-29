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
  Filter,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";

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

const mockVillageReports: VillageData[] = [
  {
    id: "HVL-01",
    sector: "Uruli Kanchan",
    village: "Uruli Kanchan",
    awcName: "Uruli AWC-1 (Gavthan)",
    workerName: "Sunita Shinde",
    totalChildren: 86,
    normalCount: 81,
    mamCount: 4,
    samCount: 1,
    vaccineRate: 96.5,
    status: "Normal",
  },
  {
    id: "HVL-02",
    sector: "Uruli Kanchan",
    village: "Uruli Kanchan",
    awcName: "Uruli AWC-2 (Wadi)",
    workerName: "Mangal Pawar",
    totalChildren: 74,
    normalCount: 68,
    mamCount: 4,
    samCount: 2,
    vaccineRate: 91.8,
    status: "Attention",
  },
  {
    id: "HVL-03",
    sector: "Loni Kalbhor",
    village: "Loni Kalbhor",
    awcName: "Loni Gaonthan AWC",
    workerName: "Kavita Gaikwad",
    totalChildren: 112,
    normalCount: 104,
    mamCount: 6,
    samCount: 2,
    vaccineRate: 95.0,
    status: "Normal",
  },
  {
    id: "HVL-04",
    sector: "Loni Kalbhor",
    village: "Kadamwak Wasti",
    awcName: "Kadamwak AWC-1",
    workerName: "Rekha Kamble",
    totalChildren: 68,
    normalCount: 57,
    mamCount: 7,
    samCount: 4,
    vaccineRate: 85.2,
    status: "Critical",
  },
  {
    id: "HVL-05",
    sector: "Wagholi",
    village: "Wagholi Rural",
    awcName: "Wagholi Talav AWC",
    workerName: "Anita Jadhav",
    totalChildren: 95,
    normalCount: 88,
    mamCount: 5,
    samCount: 2,
    vaccineRate: 94.7,
    status: "Normal",
  },
  {
    id: "HVL-06",
    sector: "Wagholi",
    village: "Bakori",
    awcName: "Bakori Wasti AWC",
    workerName: "Pooja Bhosle",
    totalChildren: 54,
    normalCount: 46,
    mamCount: 5,
    samCount: 3,
    vaccineRate: 88.8,
    status: "Critical",
  },
  {
    id: "HVL-07",
    sector: "Khadakwasla",
    village: "Donje",
    awcName: "Donje Fort Base AWC",
    workerName: "Rukmini More",
    totalChildren: 48,
    normalCount: 45,
    mamCount: 2,
    samCount: 1,
    vaccineRate: 97.9,
    status: "Normal",
  },
  {
    id: "HVL-08",
    sector: "Khadakwasla",
    village: "Khadakwasla",
    awcName: "Dam Colony AWC",
    workerName: "Sangita Salunkhe",
    totalChildren: 82,
    normalCount: 76,
    mamCount: 5,
    samCount: 1,
    vaccineRate: 93.9,
    status: "Normal",
  },
];

export default function BdoDashboardPage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");

  useEffect(() => {
    // Check session
    const savedUser = localStorage.getItem("balsaathi_user");
    if (!savedUser) {
      router.push("/login");
    } else {
      try {
        setOfficer(JSON.parse(savedUser));
      } catch {
        router.push("/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("balsaathi_user");
    router.push("/login");
  };

  // Filtered reports
  const filteredReports = mockVillageReports.filter((item) => {
    const matchesSearch =
      item.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.awcName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" ? true : item.status === filterStatus;

    const matchesSector =
      sectorFilter === "ALL" ? true : item.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const exportToCsv = () => {
    const headers = "ID,Sector,Village,AWC Name,Sevika,Total Kids,Healthy,MAM,SAM,Vaccine %\n";
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
    link.setAttribute("download", `BDO_Haveli_Taluka_Growth_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!officer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Authenticating officer session...
      </div>
    );
  }

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
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {officer.jurisdiction}
                </span>
              </div>
              <h1 className="text-2xl font-bold mt-1 text-white tracking-tight flex items-center gap-2">
                Taluka Child Growth &amp; Immunisation Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as: <strong className="text-white">{officer.name}</strong> ({officer.roleLabel})
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={exportToCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Report (CSV)</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Anganwadis</span>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{officer.totalAwcs}</div>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> 100% Reporting
            </span>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Enrolled Kids</span>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {officer.totalChildren.toLocaleString()}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Age 0 to 6 years</span>
          </div>

          {/* Card 3 (SAM) */}
          <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm bg-rose-50/30">
            <div className="flex items-center justify-between text-rose-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">SAM (Severe Red)</span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-rose-600">112</div>
            <span className="text-xs text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> -0.4% from last month
            </span>
          </div>

          {/* Card 4 (MAM) */}
          <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm bg-amber-50/30">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">MAM (Moderate)</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">428</div>
            <span className="text-xs text-amber-800 mt-1 block">5.1% of Taluka</span>
          </div>

          {/* Card 5 (Vaccines) */}
          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm bg-emerald-50/30">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Immunisation</span>
              <HeartPulse className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">94.2%</div>
            <span className="text-xs text-emerald-800 font-medium mt-1 block">Target: 95.0%</span>
          </div>
        </div>

        {/* ==================== MALNUTRITION DISTRIBUTION BAR ==================== */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Taluka WHO Growth Distribution &amp; Classification
              </h2>
              <p className="text-xs text-slate-500">
                Based on latest weight-for-age (WFA) &amp; height-for-age (LHFA) measurements
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Healthy (93.6%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span> MAM (5.1%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span> SAM (1.3%)
              </span>
            </div>
          </div>

          {/* Progress Stack Bar */}
          <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            <div
              style={{ width: "93.6%" }}
              className="bg-emerald-500 hover:opacity-90 transition-all"
              title="Healthy: 7,880 children (93.6%)"
            ></div>
            <div
              style={{ width: "5.1%" }}
              className="bg-amber-500 hover:opacity-90 transition-all"
              title="MAM: 428 children (5.1%)"
            ></div>
            <div
              style={{ width: "1.3%" }}
              className="bg-rose-500 hover:opacity-90 transition-all"
              title="SAM: 112 children (1.3%)"
            ></div>
          </div>
        </div>

        {/* ==================== REPORTS & VILLAGE PERFORMANCE TABLE ==================== */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header & Controls */}
          <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Village &amp; Anganwadi Growth Performance
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filteredReports.length} of {mockVillageReports.length} centers in Haveli Taluka
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search village or AWC..."
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
                <option value="Uruli Kanchan">Uruli Kanchan</option>
                <option value="Loni Kalbhor">Loni Kalbhor</option>
                <option value="Wagholi">Wagholi</option>
                <option value="Khadakwasla">Khadakwasla</option>
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
                <option value="Critical">Critical (High SAM)</option>
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
                  <th className="py-3.5 px-4">Village / Gram Panchayat</th>
                  <th className="py-3.5 px-4">Anganwadi Center</th>
                  <th className="py-3.5 px-4">Sevika</th>
                  <th className="py-3.5 px-4 text-center">Enrolled</th>
                  <th className="py-3.5 px-4 text-center text-emerald-700">Healthy</th>
                  <th className="py-3.5 px-4 text-center text-amber-700">MAM</th>
                  <th className="py-3.5 px-4 text-center text-rose-700">SAM</th>
                  <th className="py-3.5 px-4 text-center">Vaccine %</th>
                  <th className="py-3.5 px-4 text-center">Action Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{item.id}</td>
                    <td className="py-3 px-4 font-medium">{item.sector}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.village}</td>
                    <td className="py-3 px-4">{item.awcName}</td>
                    <td className="py-3 px-4 text-slate-600">{item.workerName}</td>
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
                      <span
                        className={`font-bold ${
                          item.vaccineRate >= 95
                            ? "text-emerald-700"
                            : item.vaccineRate >= 90
                            ? "text-amber-700"
                            : "text-rose-700"
                        }`}
                      >
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
                          SAM Intervention
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
