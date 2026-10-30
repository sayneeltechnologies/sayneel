"use client";

import React, { useState, useEffect } from "react";
import WhoGrowthReportModal from "./WhoGrowthReportModal";
import {
  X,
  User,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  Search,
  Scale,
  Ruler,
  ChevronDown,
  ChevronUp,
  LineChart,
} from "lucide-react";

interface ChildRecord {
  id: string;
  name: string;
  motherName?: string;
  gender: string;
  genderCode: number;
  dob: string;
  ageText: string;
  weight: number | null;
  height: number | null;
  headCircumference: number | null;
  armCircumference: number | null;
  status: number;
  statusLabel: string;
  trend: number;
  wfaZScore: number | null;
  lhfaZScore: number | null;
  wfhZScore: number | null;
  measuredDate: string | null;
}

interface HistoryItem {
  id: string;
  weight: number | null;
  height: number | null;
  status: number;
  trend: number;
  wfaZScore: number | null;
  lhfaZScore: number | null;
  wfhZScore: number | null;
  month: number;
  year: number;
  measuredDate: string;
}

interface AnganwadiOption {
  id: string;
  awcId?: string;
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
  isOpen: boolean;
  onClose: () => void;
  awcId: string;
  awcName: string;
  villageName: string;
  sectorName: string;
  workerName: string;
  allAnganwadis?: AnganwadiOption[];
  onSelectAwc?: (awc: AnganwadiOption) => void;
}

export default function ChildGrowthDrawer({
  isOpen,
  onClose,
  awcId,
  awcName,
  villageName,
  sectorName,
  workerName,
  allAnganwadis = [],
  onSelectAwc,
}: Props) {
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SAM" | "MAM" | "NORMAL">("ALL");
  const [search, setSearch] = useState("");
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [childHistory, setChildHistory] = useState<HistoryItem[]>([]);
  const [reportModalChild, setReportModalChild] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen || !awcId) return;

    const fetchChildren = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/bdo/children?awc_id=${awcId}`);
        const data = await res.json();
        setChildren(data.children || []);
      } catch (err) {
        console.error("Failed to load children:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [isOpen, awcId]);

  // Load history when a child card is expanded
  const toggleExpand = async (childId: string) => {
    if (expandedChildId === childId) {
      setExpandedChildId(null);
      setChildHistory([]);
      return;
    }

    setExpandedChildId(childId);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/dashboard/bdo/children?child_id=${childId}`);
      const data = await res.json();
      setChildHistory(data.history || []);
    } catch (err) {
      console.error("Failed to load child history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!isOpen) return null;

  const samCount = children.filter((c) => c.status === 3).length;
  const mamCount = children.filter((c) => c.status === 2).length;
  const normalCount = children.filter((c) => c.status === 1).length;

  const filteredChildren = children.filter((c) => {
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "SAM"
        ? c.status === 3
        : filter === "MAM"
        ? c.status === 2
        : c.status === 1;

    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.motherName && c.motherName.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
        {/* ==================== DRAWER HEADER ==================== */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Anganwadi Center Registry
              </span>
              <span className="text-xs text-slate-400">Sector: {sectorName}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {allAnganwadis && allAnganwadis.length > 0 && onSelectAwc ? (
                <div className="relative">
                  <select
                    value={awcId}
                    onChange={(e) => {
                      const found = allAnganwadis.find((a: any) => (a.awcId || a.id) === e.target.value);
                      if (found) onSelectAwc(found);
                    }}
                    className="bg-slate-800 text-white font-bold text-base sm:text-lg rounded-xl px-3 py-1.5 border border-slate-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm transition"
                  >
                    {allAnganwadis.map((a: any) => {
                      const idVal = a.awcId || a.id;
                      return (
                        <option key={idVal} value={idVal} className="bg-slate-900 text-white py-1">
                          {a.awcName} &mdash; {a.village} ({a.totalChildren} kids)
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {awcName} &mdash; {villageName}
                </h2>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Sevika (Worker): <strong className="text-white">{workerName}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================== SUMMARY PILLS ==================== */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg border transition ${
                filter === "ALL"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              All ({children.length})
            </button>
            <button
              onClick={() => setFilter("SAM")}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                filter === "SAM"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              SAM Red ({samCount})
            </button>
            <button
              onClick={() => setFilter("MAM")}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                filter === "MAM"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              MAM ({mamCount})
            </button>
            <button
              onClick={() => setFilter("NORMAL")}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                filter === "NORMAL"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Healthy ({normalCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search child..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ==================== CHILDREN LIST ==================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold">Loading child growth profiles from database...</span>
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
              <User className="w-8 h-8 text-slate-300 mb-2" />
              <span>No children match the selected filter.</span>
            </div>
          ) : (
            filteredChildren.map((child) => {
              const isExpanded = expandedChildId === child.id;

              return (
                <div
                  key={child.id}
                  className={`rounded-2xl border transition shadow-sm ${
                    child.status === 3
                      ? "border-rose-200 bg-rose-50/20"
                      : child.status === 2
                      ? "border-amber-200 bg-amber-50/20"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* Main Child Card Summary */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Name & Basic Info */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                            child.genderCode === 1
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {child.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{child.name}</h4>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                child.genderCode === 1
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-pink-50 text-pink-700"
                              }`}
                            >
                              {child.gender} ({child.ageText})
                            </span>
                          </div>
                          {child.motherName && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Mother: <strong className="text-slate-700">{child.motherName}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status & Trend Badges */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {child.status === 3 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            SAM (Severe)
                          </span>
                        ) : child.status === 2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            MAM (Moderate)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Healthy
                          </span>
                        )}

                        {/* Trend */}
                        {child.trend === 1 ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold"
                            title="Z-Score Improving"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Improving</span>
                          </span>
                        ) : child.trend === 2 ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold"
                            title="Z-Score Worsening"
                          >
                            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                            <span>Declining</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold"
                            title="Z-Score Stable"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span>Stable</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Measurements Matrix (Mirroring Mobile App) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                          <Scale className="w-3 h-3 text-blue-600" /> Weight
                        </span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {child.weight ? `${child.weight} kg` : "N/A"}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-indigo-600" /> Height
                        </span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {child.height ? `${child.height} cm` : "N/A"}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                          <Activity className="w-3 h-3 text-emerald-600" /> WFH Z-Score
                        </span>
                        <span
                          className={`text-sm font-extrabold ${
                            child.wfhZScore && child.wfhZScore < -3
                              ? "text-rose-600"
                              : child.wfhZScore && child.wfhZScore < -2
                              ? "text-amber-600"
                              : "text-slate-800"
                          }`}
                        >
                          {child.wfhZScore !== null ? child.wfhZScore.toFixed(2) : "N/A"}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-600" /> Measured On
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {child.measuredDate
                            ? new Date(child.measuredDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Recent"}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar: WHO Growth Report + Quick Log */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setReportModalChild({ ...child, awcName, villageName })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                        <span>Open WHO Growth Report (4 Charts)</span>
                      </button>

                      <button
                        onClick={() => toggleExpand(child.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                      >
                        <span>{isExpanded ? "Hide Log" : "Quick Log"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ==================== EXPANDED WHO GROWTH TIMELINE ==================== */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-900 text-white rounded-b-2xl border-t border-slate-800 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                        <span className="font-bold text-sm text-slate-200">
                          Monthly Growth Measurements Log
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">
                          WHO Longitudinal History
                        </span>
                      </div>

                      {historyLoading ? (
                        <div className="py-6 text-center text-slate-400">
                          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <span>Fetching timeline...</span>
                        </div>
                      ) : childHistory.length === 0 ? (
                        <p className="text-slate-400 py-2">No historical records recorded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-5 text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-800">
                            <span>Reading Date</span>
                            <span>Weight</span>
                            <span>Height</span>
                            <span>WHO Status</span>
                            <span>Z-Score</span>
                          </div>
                          {childHistory.map((h) => (
                            <div
                              key={h.id}
                              className="grid grid-cols-5 py-1.5 border-b border-slate-800/60 text-slate-300 font-medium"
                            >
                              <span>
                                {new Date(h.measuredDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-white font-bold">{h.weight} kg</span>
                              <span>{h.height} cm</span>
                              <span>
                                {h.status === 3 ? (
                                  <span className="text-rose-400 font-bold">SAM Red</span>
                                ) : h.status === 2 ? (
                                  <span className="text-amber-400 font-bold">MAM</span>
                                ) : (
                                  <span className="text-emerald-400 font-bold">Normal</span>
                                )}
                              </span>
                              <span className="font-mono text-slate-300">
                                {h.wfhZScore !== null
                                  ? `WHZ: ${h.wfhZScore}`
                                  : h.wfaZScore !== null
                                  ? `WAZ: ${h.wfaZScore}`
                                  : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Synced with Field Anganwadi Worker entries</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            Close Registry
          </button>
        </div>
      </div>

      {/* ==================== WHO GROWTH REPORT MODAL (FROM APP) ==================== */}
      {reportModalChild && (
        <WhoGrowthReportModal
          isOpen={!!reportModalChild}
          onClose={() => setReportModalChild(null)}
          child={reportModalChild}
        />
      )}
    </div>
  );
}
