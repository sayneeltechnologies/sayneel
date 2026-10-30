"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Scale,
  Ruler,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart,
  Download,
  Calendar,
} from "lucide-react";
import WhoGrowthReportModal from "./WhoGrowthReportModal";

export interface ChildRecord {
  id: string;
  name: string;
  motherName?: string;
  gender: string;
  genderCode: number;
  dob: string;
  ageText: string;
  ageInDays: number;
  awcName: string;
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

interface Props {
  villageName: string;
  talukaName: string;
  blockId: string;
  allVillages?: string[];
  onSelectVillage?: (villageName: string) => void;
  onClearVillageFilter?: () => void;
}

export default function VillageChildRosterTable({
  villageName,
  talukaName,
  blockId,
  allVillages = [],
  onSelectVillage,
  onClearVillageFilter,
}: Props) {
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SAM" | "MAM" | "NORMAL">("ALL");
  const [search, setSearch] = useState("");
  const [reportModalChild, setReportModalChild] = useState<any | null>(null);

  useEffect(() => {
    if (!villageName || !blockId) return;

    const fetchChildren = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/dashboard/bdo/children?village=${encodeURIComponent(villageName)}&block_id=${blockId}`
        );
        const data = await res.json();
        setChildren(data.children || []);
      } catch (err) {
        console.error("Failed to fetch village children:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [villageName, blockId]);

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
      (c.motherName && c.motherName.toLowerCase().includes(search.toLowerCase())) ||
      c.awcName.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const exportVillageCsv = () => {
    const headers =
      "Child Name,Gender,Age,Mother Name,Weight (kg),Height (cm),WAZ Z-Score,WHZ Z-Score,HAZ Z-Score,WHO Status,AWC Center,Measured Date\n";
    const rows = filteredChildren
      .map(
        (c) =>
          `"${c.name}","${c.gender}","${c.ageText}","${c.motherName || ""}","${c.weight || ""}","${c.height || ""}","${c.wfaZScore ?? ""}","${c.wfhZScore ?? ""}","${c.lhfaZScore ?? ""}","${c.statusLabel}","${c.awcName}","${c.measuredDate?.slice(0, 10) || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${villageName}_Village_Child_Growth_Roster_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="village-child-roster" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-6">
      {/* ==================== SECTION HEADER & BREADCRUMB ==================== */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>{talukaName} Taluka</span>
            <span>&gt;</span>
            <span className="text-amber-400 font-bold">{villageName} Village</span>
            <span>&gt;</span>
            <span className="text-white">Child Clinical Registry</span>
          </div>

          <h3 className="text-xl font-black mt-1 text-white tracking-tight flex items-center gap-3">
            <span>{villageName} Village &mdash; Child Growth &amp; Z-Scores</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {children.length} Children Enrolled
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual child measurements &amp; clinical WHO standard deviation indicators
          </p>

          {/* Quick Village Switcher Pills */}
          {allVillages && allVillages.length > 1 && onSelectVillage && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Villages:
              </span>
              {allVillages.map((v) => {
                const isActive = v === villageName;
                return (
                  <button
                    key={v}
                    onClick={() => onSelectVillage(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Direct Dropdown Selector */}
          {allVillages && allVillages.length > 1 && onSelectVillage && (
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-300">Village:</span>
              <select
                value={villageName}
                onChange={(e) => onSelectVillage(e.target.value)}
                className="bg-slate-900 text-amber-400 font-bold text-xs rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {allVillages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={exportVillageCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {/* ==================== CONTROLS & STATUS FILTER PILLS ==================== */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl border transition ${
              filter === "ALL"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            All Children ({children.length})
          </button>

          <button
            onClick={() => setFilter("SAM")}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
              filter === "SAM"
                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            SAM Red ({samCount})
          </button>

          <button
            onClick={() => setFilter("MAM")}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
              filter === "MAM"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            MAM Warning ({mamCount})
          </button>

          <button
            onClick={() => setFilter("NORMAL")}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
              filter === "NORMAL"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Healthy ({normalCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search child, mother, AWC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* ==================== CHILDREN TABULAR ROSTER ==================== */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Loading child growth profiles for {villageName}...</span>
          </div>
        ) : filteredChildren.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span>No children match the active search or filter in {villageName}.</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Child Name &amp; Mother</th>
                <th className="py-3.5 px-3 text-center">Gender / Age</th>
                <th className="py-3.5 px-3 text-center">Weight</th>
                <th className="py-3.5 px-3 text-center">Height</th>
                <th className="py-3.5 px-3 text-center text-blue-700" title="Weight for Age Z-Score">
                  WAZ (Underweight)
                </th>
                <th className="py-3.5 px-3 text-center text-purple-700" title="Weight for Height Z-Score">
                  WHZ (Wasting)
                </th>
                <th className="py-3.5 px-3 text-center text-teal-700" title="Height for Age Z-Score">
                  HAZ (Stunting)
                </th>
                <th className="py-3.5 px-3 text-center">WHO Status</th>
                <th className="py-3.5 px-3 text-center">Trajectory</th>
                <th className="py-3.5 px-4 text-center">Clinical Curve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredChildren.map((child) => (
                <tr
                  key={child.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    child.status === 3
                      ? "bg-rose-50/20"
                      : child.status === 2
                      ? "bg-amber-50/20"
                      : ""
                  }`}
                >
                  {/* Name & Mother */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{child.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Mother: <strong className="text-slate-700">{child.motherName || "—"}</strong> &bull; Center: {child.awcName}
                    </div>
                  </td>

                  {/* Gender / Age */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        child.genderCode === 1
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-pink-50 text-pink-700 border border-pink-200"
                      }`}
                    >
                      {child.gender} ({child.ageText})
                    </span>
                  </td>

                  {/* Weight */}
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {child.weight ? `${child.weight} kg` : "—"}
                  </td>

                  {/* Height */}
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {child.height ? `${child.height} cm` : "—"}
                  </td>

                  {/* WAZ */}
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    <span
                      className={
                        child.wfaZScore && child.wfaZScore < -3
                          ? "text-rose-600 font-black"
                          : child.wfaZScore && child.wfaZScore < -2
                          ? "text-amber-600"
                          : "text-slate-700"
                      }
                    >
                      {child.wfaZScore !== null ? `${child.wfaZScore} SD` : "—"}
                    </span>
                  </td>

                  {/* WHZ */}
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    <span
                      className={
                        child.wfhZScore && child.wfhZScore < -3
                          ? "text-rose-600 font-black"
                          : child.wfhZScore && child.wfhZScore < -2
                          ? "text-amber-600"
                          : "text-slate-700"
                      }
                    >
                      {child.wfhZScore !== null ? `${child.wfhZScore} SD` : "—"}
                    </span>
                  </td>

                  {/* HAZ */}
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    <span
                      className={
                        child.lhfaZScore && child.lhfaZScore < -3
                          ? "text-rose-600 font-black"
                          : child.lhfaZScore && child.lhfaZScore < -2
                          ? "text-amber-600"
                          : "text-slate-700"
                      }
                    >
                      {child.lhfaZScore !== null ? `${child.lhfaZScore} SD` : "—"}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    {child.status === 3 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> SAM Red
                      </span>
                    ) : child.status === 2 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> MAM
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Healthy
                      </span>
                    )}
                  </td>

                  {/* Trajectory */}
                  <td className="py-3 px-3 text-center">
                    {child.trend === 1 ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 text-[11px] font-bold">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Improving
                      </span>
                    ) : child.trend === 2 ? (
                      <span className="inline-flex items-center gap-0.5 text-rose-700 text-[11px] font-bold">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                        Declining
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-slate-500 text-[11px] font-medium">
                        <Minus className="w-3.5 h-3.5" />
                        Stable
                      </span>
                    )}
                  </td>

                  {/* Clinical Curve Button */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        setReportModalChild({
                          ...child,
                          villageName,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                      <span>View Curve</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ==================== WHO CLINICAL GROWTH MODAL ==================== */}
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
