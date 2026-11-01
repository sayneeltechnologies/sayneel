"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Home } from "lucide-react";
import { api } from "@/lib/api";

export interface VillageSearchResult {
  villageName: string;
  blockId: string;
  block: string;
}

interface Props {
  onSelectVillage: (village: VillageSearchResult) => void;
  placeholder?: string;
  variant?: "light" | "dark";
  className?: string;
}

// Nothing is listed or fetched until the user has typed this much, and then only once they pause.
const MIN_QUERY_LENGTH = 2;
const SEARCH_DELAY_MS = 500;

export default function VillagePicker({
  onSelectVillage,
  placeholder = "Search village...",
  variant = "light",
  className = "",
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Last non-empty results and the text that found them; kept on screen while the user keeps typing.
  const [results, setResults] = useState<VillageSearchResult[] | null>(null);
  const [resultsQuery, setResultsQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const isSearchable = trimmed.length >= MIN_QUERY_LENGTH;

  // Debounced search: waits for a pause in typing, and drops a request the user has typed past.
  useEffect(() => {
    if (!isSearchable) {
      // Below the minimum the list is hidden; the next search starts fresh.
      setResults(null);
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get<{ villages?: VillageSearchResult[] }>("/dashboard/villages/search", {
          query: { q: trimmed },
          signal: abortController.signal,
        });
        const villages = data?.villages || [];
        // No match: keep showing the previous results rather than an empty list.
        if (villages.length > 0) {
          setResults(villages);
          setResultsQuery(trimmed);
          setHighlight(0);
        } else {
          setResults((prev) => prev ?? []);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Village search failed:", err);
          setResults((prev) => prev ?? []);
        }
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [trimmed, isSearchable]);

  const items = results ?? [];

  // Village name with the text that found it in bold (case-insensitive; no bold if it matched another spelling).
  const renderName = (name: string) => {
    const start = resultsQuery ? name.toLowerCase().indexOf(resultsQuery.toLowerCase()) : -1;
    if (start < 0) return name;
    const end = start + resultsQuery.length;
    return (
      <>
        {name.slice(0, start)}
        <strong className="font-extrabold">{name.slice(start, end)}</strong>
        {name.slice(end)}
      </>
    );
  };

  // Close when clicking anywhere outside the picker.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keep the keyboard-highlighted row in view.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${highlight}"]`)?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const choose = (village: VillageSearchResult) => {
    onSelectVillage(village);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && items[highlight]) {
      e.preventDefault();
      choose(items[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && isSearchable && (loading || results !== null);
  const inputClass =
    variant === "dark"
      ? "bg-slate-900 text-white placeholder:text-slate-500 border-slate-700 focus:ring-amber-500"
      : "bg-white text-slate-800 placeholder:text-slate-400 border-slate-300 focus:ring-blue-600";

  return (
    <div ref={containerRef} className={`relative w-full text-left ${className}`}>
      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={showList}
        aria-controls="village-picker-list"
        className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border font-medium focus:outline-none focus:ring-2 shadow-xs ${inputClass}`}
      />

      {showList && (
        <div
          ref={listRef}
          id="village-picker-list"
          role="listbox"
          className="absolute z-20 mt-1.5 w-full min-w-64 max-h-80 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-lg"
        >
          {/* Previous results stay up while a new search runs; the spinner only fills an empty list. */}
          {loading && items.length === 0 ? (
            <div className="px-4 py-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              Searching&hellip;
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-5 text-center text-xs text-slate-500">
              No villages match &ldquo;{trimmed}&rdquo;
            </div>
          ) : (
            items.map((village, i) => (
              <button
                key={`${village.blockId}-${village.villageName}`}
                type="button"
                role="option"
                aria-selected={i === highlight}
                data-index={i}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(village)}
                className={`w-full px-4 py-2 flex items-center justify-between gap-2 text-xs cursor-pointer transition ${
                  i === highlight ? "bg-blue-50 text-blue-800" : "text-slate-700"
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Home className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{renderName(village.villageName)}</span>
                </span>
                {/* Taluka shown to tell apart villages with the same name. */}
                <span className="text-[11px] text-slate-400 shrink-0">{village.block}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
