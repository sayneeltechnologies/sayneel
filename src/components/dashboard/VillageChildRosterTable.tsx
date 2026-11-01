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
import TablePagination, { DEFAULT_PAGE_SIZE } from "./TablePagination";
import VillagePicker, { VillageSearchResult } from "./VillagePicker";
import { api } from "@/lib/api";

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
  // Shown in the header and village picker (e.g. "Kadgaon (Bhudargad)" in the All talukas view).
  villageName: string;
  // Village name sent to the API; defaults to villageName.
  queryVillage?: string;
  // Full label, e.g. "Bhudargad Taluka".
  talukaName: string;
  blockId: string;
  // Switch to another village found through the header's search box.
  onSelectVillage?: (village: VillageSearchResult) => void;
  onClearVillageFilter?: () => void;
}

type StatusFilter = "ALL" | "SAM" | "MAM" | "NORMAL";

interface ChildrenPage {
  children: ChildRecord[];
  // Children matching the status and search, across all pages.
  totalCount: number;
}

interface StatusCounts {
  total: number;
  normal: number;
  mam: number;
  sam: number;
}

// The API's status filter value for each pill.
const STATUS_PARAM: Record<StatusFilter, string | undefined> = { ALL: undefined, SAM: "sam", MAM: "mam", NORMAL: "normal" };

// The search box waits for a pause in typing before asking the server.
const SEARCH_DELAY_MS = 500;
// Rows per request when exporting every matching child to CSV.
const EXPORT_PAGE_SIZE = 100;

// Module-level caches across component unmounts: pages already fetched, and each village's status totals
// (fetched once per village). The dashboard's Refresh clears both.
export const villageChildrenCache = new Map<string, ChildrenPage>();
const villageCountsCache = new Map<string, StatusCounts>();
export const clearVillageChildrenCache = () => {
  villageChildrenCache.clear();
  villageCountsCache.clear();
};

// Mount with a key per village (blockId + village), so switching villages starts from page 1 with no filter.
export default function VillageChildRosterTable({
  villageName,
  queryVillage = villageName,
  talukaName,
  blockId,
  onSelectVillage,
  onClearVillageFilter,
}: Props) {
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  // Null until the village's totals arrive; the pills show only their names meanwhile.
  const [counts, setCounts] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [reportModalChild, setReportModalChild] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const villageKey = `${blockId}_${queryVillage}`;

  // Status totals for the pills: one request per village.
  useEffect(() => {
    if (!queryVillage || !blockId) return;

    const cached = villageCountsCache.get(villageKey);
    if (cached) {
      setCounts(cached);
      return;
    }

    const abortController = new AbortController();
    setCounts(null);
    api
      .get<StatusCounts>("/dashboard/children/counts", {
        query: { village: queryVillage, block_id: blockId },
        signal: abortController.signal,
      })
      .then((data) => {
        if (!data) return;
        villageCountsCache.set(villageKey, data);
        setCounts(data);
      })
      .catch((err: any) => {
        if (err.name !== "AbortError") console.error("Failed to fetch village child counts:", err);
      });

    return () => abortController.abort();
  }, [queryVillage, blockId, villageKey]);

  // Apply the search after a pause in typing, from the first page.
  useEffect(() => {
    const next = search.trim();
    if (next === appliedSearch) return;
    const timer = setTimeout(() => {
      setAppliedSearch(next);
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search, appliedSearch]);

  // The current page of children, from the server.
  useEffect(() => {
    if (!queryVillage || !blockId) return;

    const pageKey = `${villageKey}_${filter}_${appliedSearch}_${pageSize}_${page}`;
    const cached = villageChildrenCache.get(pageKey);
    if (cached) {
      setChildren(cached.children);
      setTotalCount(cached.totalCount);
      setLoading(false);
      setHasLoaded(true);
      return;
    }

    const abortController = new AbortController();

    const fetchPage = async () => {
      setLoading(true);
      try {
        const data = await api.get<{ children?: ChildRecord[]; totalCount?: number }>("/dashboard/children", {
          query: {
            village: queryVillage,
            block_id: blockId,
            page,
            page_size: pageSize,
            status: STATUS_PARAM[filter],
            search: appliedSearch || undefined,
          },
          signal: abortController.signal,
        });
        const result = { children: data?.children || [], totalCount: data?.totalCount ?? 0 };

        // The page can fall past the end if children were removed since the last request.
        if (result.children.length === 0 && page > 1) {
          setPage(1);
          return;
        }

        villageChildrenCache.set(pageKey, result);
        setChildren(result.children);
        setTotalCount(result.totalCount);
        setHasLoaded(true);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch village children:", err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      abortController.abort();
    };
  }, [queryVillage, blockId, villageKey, filter, appliedSearch, page, pageSize]);

  const handleFilterChange = (next: StatusFilter) => {
    setFilter(next);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const isUnfiltered = filter === "ALL" && !appliedSearch;

  // Pill label: the name alone until the village's totals arrive.
  const pillLabel = (name: string, count: number | undefined) => (count === undefined ? name : `${name} (${count})`);

  // Every child matching the status and search, fetched in batches only when exporting.
  const fetchAllMatching = async (): Promise<ChildRecord[]> => {
    const all: ChildRecord[] = [];
    for (let exportPage = 1; ; exportPage++) {
      const data = await api.get<{ children?: ChildRecord[]; totalCount?: number }>("/dashboard/children", {
        query: {
          village: queryVillage,
          block_id: blockId,
          page: exportPage,
          page_size: EXPORT_PAGE_SIZE,
          status: STATUS_PARAM[filter],
          search: appliedSearch || undefined,
        },
      });
      const batch = data?.children || [];
      all.push(...batch);
      if (batch.length < EXPORT_PAGE_SIZE || all.length >= (data?.totalCount ?? 0)) return all;
    }
  };

  // CSV export covers every child matching the status and search, not just the current page.
  const exportVillageCsv = async () => {
    setExporting(true);
    let exportChildren: ChildRecord[];
    try {
      exportChildren = await fetchAllMatching();
    } catch (err) {
      console.error("Failed to export village children:", err);
      return;
    } finally {
      setExporting(false);
    }

    const headers =
      "Child Name,Gender,Age,Mother Name,Weight (kg),Height (cm),WAZ Z-Score,WHZ Z-Score,HAZ Z-Score,WHO Status,AWC Center,Measured Date\n";
    const rows = exportChildren
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
    URL.revokeObjectURL(url); // Clean up memory leak
  };

  return (
    // No overflow-hidden on the outer box, so the village search results can drop out of the header.
    <div id="village-child-roster" className="bg-white rounded-3xl border border-slate-200 shadow-sm scroll-mt-6">
      {/* ==================== SECTION HEADER & BREADCRUMB ==================== */}
      <div className="relative z-10 p-6 bg-slate-900 text-white rounded-t-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>{talukaName}</span>
            <span>&gt;</span>
            <span className="text-amber-400 font-bold">{villageName} Village</span>
            <span>&gt;</span>
            <span className="text-white">Child Clinical Registry</span>
          </div>

          <h3 className="text-xl font-black mt-1 text-white tracking-tight flex items-center gap-3">
            <span>{villageName} Village &mdash; Child Growth &amp; Z-Scores</span>
            {counts && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {counts.total} Children Enrolled
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual child measurements &amp; clinical WHO standard deviation indicators
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Switch village by searching */}
          {onSelectVillage && (
            <VillagePicker
              onSelectVillage={onSelectVillage}
              placeholder="Switch village..."
              variant="dark"
              className="w-56"
            />
          )}

          <button
            onClick={exportVillageCsv}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {exporting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{exporting ? "Exporting…" : "Export Roster CSV"}</span>
          </button>

          {onClearVillageFilter && (
            <button
              onClick={onClearVillageFilter}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
              title="Close Child Roster"
            >
              <span>✕ Close Table</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-b-3xl overflow-hidden">
      {/* ==================== CONTROLS & STATUS FILTER PILLS ==================== */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => handleFilterChange("ALL")}
            className={`px-3 py-1.5 rounded-xl border transition ${
              filter === "ALL"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            {pillLabel("All Children", counts?.total)}
          </button>

          <button
            onClick={() => handleFilterChange("SAM")}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
              filter === "SAM"
                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {pillLabel("SAM Red", counts?.sam)}
          </button>

          <button
            onClick={() => handleFilterChange("MAM")}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
              filter === "MAM"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {pillLabel("MAM Warning", counts?.mam)}
          </button>

          <button
            onClick={() => handleFilterChange("NORMAL")}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
              filter === "NORMAL"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {pillLabel("Healthy", counts?.normal)}
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
      {/* Later page loads keep the current rows, dimmed under a spinner. */}
      <div className="relative overflow-x-auto" aria-busy={loading}>
        {loading && hasLoaded && (
          <div className="absolute inset-0 z-10 bg-white/60 flex items-start justify-center pt-16">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow border border-slate-200 text-xs font-semibold text-slate-500">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              Loading&hellip;
            </div>
          </div>
        )}
        {!hasLoaded ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Loading child growth profiles for {villageName}...</span>
          </div>
        ) : children.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-1" />
            <span className="font-bold text-slate-700 text-sm">
              {isUnfiltered
                ? `No children currently registered in ${villageName}`
                : `No children match the active search or filter in ${villageName}`}
            </span>
            {isUnfiltered && (
              <p className="text-slate-400 max-w-md">
                This village currently has 0 registered child growth profiles in the active cohort. You can select another village from the dropdown above to inspect child records.
              </p>
            )}
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
              {children.map((child) => (
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

      {/* Stays up while a page loads, so the user can see where they are. */}
      {hasLoaded && totalCount > 0 && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
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
