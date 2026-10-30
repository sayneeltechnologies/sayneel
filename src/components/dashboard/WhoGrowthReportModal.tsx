"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Scale,
  Ruler,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

export type GrowthReportTab = "zscore" | "wfa" | "wfh" | "lhfa";

interface HistoryPoint {
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  child: {
    id: string;
    name: string;
    motherName?: string;
    gender: string;
    genderCode: number;
    dob: string;
    ageText: string;
    weight: number | null;
    height: number | null;
    status: number;
    statusLabel: string;
    trend: number;
    wfaZScore: number | null;
    lhfaZScore: number | null;
    wfhZScore: number | null;
    measuredDate: string | null;
    awcName?: string;
    villageName?: string;
  };
}

export default function WhoGrowthReportModal({ isOpen, onClose, child }: Props) {
  const [activeTab, setActiveTab] = useState<GrowthReportTab>("zscore");
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !child?.id) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/bdo/children?child_id=${child.id}`);
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error("Failed to load child history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, child?.id]);

  if (!isOpen) return null;

  // Prepare Chart Data
  const chartData = history.map((pt) => {
    const d = new Date(pt.measuredDate);
    const monthLabel = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    return {
      date: monthLabel,
      weight: pt.weight,
      height: pt.height,
      wfaZScore: pt.wfaZScore,
      wfhZScore: pt.wfhZScore,
      lhfaZScore: pt.lhfaZScore,
      status: pt.status,
    };
  });

  // Calculate Z-Score Delta if >= 2 points exist
  let zScoreDelta: number | null = null;
  if (history.length >= 2) {
    const latestZ = history[history.length - 1].wfhZScore ?? history[history.length - 1].wfaZScore;
    const prevZ = history[history.length - 2].wfhZScore ?? history[history.length - 2].wfaZScore;
    if (latestZ !== null && prevZ !== null) {
      zScoreDelta = parseFloat((latestZ - prevZ).toFixed(2));
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* ==================== MODAL HEADER ==================== */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30">
                WHO Clinical Growth Report
              </span>
              <span className="text-xs text-slate-400">
                Center: {child.awcName || "Anganwadi Center"}
              </span>
            </div>
            <h2 className="text-xl font-black mt-1 text-white tracking-tight flex items-center gap-2">
              {child.name}
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  child.genderCode === 1
                    ? "bg-blue-900/60 text-blue-300 border border-blue-700"
                    : "bg-pink-900/60 text-pink-300 border border-pink-700"
                }`}
              >
                {child.gender} &bull; {child.ageText}
              </span>
            </h2>
            {child.motherName && (
              <p className="text-xs text-slate-400 mt-0.5">
                Mother: <strong className="text-slate-200">{child.motherName}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {child.status === 3 ? (
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                SAM (Severe Red)
              </span>
            ) : child.status === 2 ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                MAM (Moderate)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Healthy (Standard)
              </span>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              title="Close Growth Report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================== TAB NAVIGATION (4 WHO CLINICAL TABS) ==================== */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("zscore")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "zscore"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Z-Score Multi-Curve</span>
            </button>

            <button
              onClick={() => setActiveTab("wfa")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "wfa"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Weight for Age (WFA)</span>
            </button>

            <button
              onClick={() => setActiveTab("wfh")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "wfh"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Weight for Height (Wasting)</span>
            </button>

            <button
              onClick={() => setActiveTab("lhfa")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "lhfa"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Height for Age (Stunting)</span>
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>Latest Weight: <strong className="text-slate-900">{child.weight ? `${child.weight} kg` : "N/A"}</strong></span>
            <span>Latest Height: <strong className="text-slate-900">{child.height ? `${child.height} cm` : "N/A"}</strong></span>
          </div>
        </div>

        {/* ==================== BODY & CHART CANVAS ==================== */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="h-72 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold">Generating WHO Spline Curves from database...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Info className="w-8 h-8 text-slate-300 mb-2" />
              <span>No growth history readings recorded for this child yet.</span>
            </div>
          ) : (
            <>
              {/* TAB 1: Z-SCORE MULTI-INDICATOR (WHO ZONES) */}
              {activeTab === "zscore" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Longitudinal WHO Z-Score Progression
                      </h4>
                      <p className="text-xs text-slate-500">
                        Plotted across standard deviation reference zones (Normal &gt; -2 SD, MAM -2 to -3 SD, SAM &lt; -3 SD)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <span className="w-3 h-0.5 bg-blue-600"></span> WFA (Underweight)
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-600">
                        <span className="w-3 h-0.5 bg-purple-600"></span> WFH (Wasting)
                      </span>
                      <span className="flex items-center gap-1.5 text-teal-600">
                        <span className="w-3 h-0.5 bg-teal-600"></span> LHFA (Stunting)
                      </span>
                    </div>
                  </div>

                  <div className="h-80 w-full bg-white rounded-2xl p-2 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: -15, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                        <YAxis
                          domain={[-4, 3]}
                          ticks={[-4, -3, -2, -1, 0, 1, 2, 3]}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          stroke="#CBD5E1"
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                  <div className="font-bold border-b border-slate-800 pb-1">
                                    Date: {label}
                                  </div>
                                  {payload.map((p: any) => (
                                    <div key={p.dataKey} className="flex justify-between gap-4" style={{ color: p.color }}>
                                      <span>{p.name}:</span>
                                      <strong className="font-mono">{p.value !== null ? p.value : "N/A"} SD</strong>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        {/* WHO Standard Zones (plotBands) */}
                        <ReferenceArea y1={-2} y2={3} fill="#10B981" fillOpacity={0.08} label={{ value: "Healthy Zone (> -2 SD)", position: "insideTopRight", fill: "#059669", fontSize: 10 }} />
                        <ReferenceArea y1={-3} y2={-2} fill="#F59E0B" fillOpacity={0.12} label={{ value: "MAM Warning (-2 to -3 SD)", position: "insideRight", fill: "#D97706", fontSize: 10 }} />
                        <ReferenceArea y1={-4} y2={-3} fill="#EF4444" fillOpacity={0.15} label={{ value: "SAM Danger (< -3 SD)", position: "insideBottomRight", fill: "#DC2626", fontSize: 10 }} />

                        {/* Median zero line */}
                        <ReferenceLine y={0} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1.5} />
                        <ReferenceLine y={-2} stroke="#F59E0B" strokeDasharray="3 3" />
                        <ReferenceLine y={-3} stroke="#EF4444" strokeWidth={1.5} />

                        {/* Child's Trajectory Lines */}
                        <Line type="monotone" dataKey="wfaZScore" name="WFA (Underweight)" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                        <Line type="monotone" dataKey="wfhZScore" name="WFH (Wasting)" stroke="#9333EA" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                        <Line type="monotone" dataKey="lhfaZScore" name="LHFA (Stunting)" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* TAB 2: WEIGHT FOR AGE (WFA) */}
              {activeTab === "wfa" && (
                <div>
                  <div className="mb-3">
                    <h4 className="font-bold text-slate-900 text-sm">Weight Progression Curve (WFA)</h4>
                    <p className="text-xs text-slate-500">Monthly recorded weight (kg) over time</p>
                  </div>
                  <div className="h-80 w-full bg-white rounded-2xl p-2 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 20, left: -15, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                        <YAxis unit="kg" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                        <Tooltip />
                        <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#2563EB" strokeWidth={3} dot={{ r: 5, fill: "#2563EB" }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* TAB 3: WEIGHT FOR HEIGHT (WFH) */}
              {activeTab === "wfh" && (
                <div>
                  <div className="mb-3">
                    <h4 className="font-bold text-slate-900 text-sm">Weight for Height Curve (Acute Wasting)</h4>
                    <p className="text-xs text-slate-500">Compares weight proportional to child height (cm)</p>
                  </div>
                  <div className="h-80 w-full bg-white rounded-2xl p-2 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 20, left: -15, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                        <Tooltip />
                        <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#9333EA" strokeWidth={3} dot={{ r: 5, fill: "#9333EA" }} />
                        <Line type="monotone" dataKey="height" name="Height (cm)" stroke="#0D9488" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* TAB 4: LENGTH / HEIGHT FOR AGE (LHFA) */}
              {activeTab === "lhfa" && (
                <div>
                  <div className="mb-3">
                    <h4 className="font-bold text-slate-900 text-sm">Height Progression Curve (Chronic Stunting)</h4>
                    <p className="text-xs text-slate-500">Monthly recorded stature (cm) over child age</p>
                  </div>
                  <div className="h-80 w-full bg-white rounded-2xl p-2 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 20, left: -15, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                        <YAxis unit="cm" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                        <Tooltip />
                        <Line type="monotone" dataKey="height" name="Height (cm)" stroke="#0D9488" strokeWidth={3} dot={{ r: 5, fill: "#0D9488" }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ==================== GROWTH ANALYSIS CARD (FROM MOBILE APP) ==================== */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  child.status === 3
                    ? "bg-rose-50/50 border-rose-200 text-rose-950"
                    : child.status === 2
                    ? "bg-amber-50/50 border-amber-200 text-amber-950"
                    : "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      child.status === 3
                        ? "bg-rose-100 text-rose-600"
                        : child.status === 2
                        ? "bg-amber-100 text-amber-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {child.status === 3 ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : child.status === 2 ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm flex items-center gap-2">
                      {child.status === 3
                        ? "Critical Clinical Alert: Severe Acute Malnutrition (SAM)"
                        : child.status === 2
                        ? "Attention Required: Moderate Acute Malnutrition (MAM)"
                        : "Healthy Child Growth: Normal Standard Met"}
                    </h5>
                    <p className="text-xs text-slate-600 mt-1">
                      {child.status === 3
                        ? "Immediate clinical referral required to the nearest Nutrition Rehabilitation Centre (NRC) or Taluka Sub-District Hospital."
                        : child.status === 2
                        ? "Prescribed Take-Home Rations (THR) energy-dense supplementary feeding and weekly Anganwadi check-ins."
                        : "Standard monthly growth monitoring and routine immunization on track."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Trajectory</span>
                    <span
                      className={`text-xs font-bold inline-flex items-center gap-1 ${
                        child.trend === 1
                          ? "text-emerald-700"
                          : child.trend === 2
                          ? "text-rose-700"
                          : "text-slate-700"
                      }`}
                    >
                      {child.trend === 1 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          Improving
                        </>
                      ) : child.trend === 2 ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-rose-600" />
                          Declining
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4" />
                          Stable
                        </>
                      )}
                    </span>
                  </div>

                  {zScoreDelta !== null && (
                    <div className="text-right pl-3 border-l border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Z-Score Delta</span>
                      <span className="font-mono text-xs font-black text-slate-900">
                        {zScoreDelta > 0 ? `+${zScoreDelta}` : `${zScoreDelta}`} SD
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>WHO Anthro Child Growth Standards Reference Data (0–5 Years)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
