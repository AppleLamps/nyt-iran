"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ArticleCard, { Article } from "@/components/ArticleCard";
import ExportButton from "@/components/ExportButton";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1851 + 1 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface ArchiveResult {
  status: string;
  total: number;
  filtered: number;
  docs: Article[];
}

export default function ArchivePage() {
  const [year, setYear] = useState(String(CURRENT_YEAR - 1));
  const [month, setMonth] = useState("1");
  const [section, setSection] = useState("");
  const [keyword, setKeyword] = useState("");

  const [result, setResult] = useState<ArchiveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams({ year, month });
      if (section.trim()) params.set("section", section.trim());
      if (keyword.trim()) params.set("keyword", keyword.trim());

      const res = await fetch(`/api/archive?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.fault?.faultstring ?? data.error ?? `Error ${res.status}`);
      setResult(data);
      setFetched(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Archive"
        description="Browse every NYT article published in a given month — back to 1851"
      />

      {/* Warning banner */}
      <div
        className="page-frame page-controls flex items-center gap-2 py-2 text-xs"
        style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", color: "#92400e" }}
      >
        <span>⚠</span>
        <span>
          Archive responses are large (~20 MB). Results are filtered and capped to 50 articles server-side.
        </span>
      </div>

      {/* Controls */}
      <div className="page-frame page-controls flex flex-wrap items-end gap-4 border-b border-black/10 bg-white/65 py-4">
        <div className="min-w-[8rem]">
          <label htmlFor="archive-year" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Year
          </label>
          <select
            id="archive-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            style={{ minWidth: "100px" }}
          >
            {YEARS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[10rem]">
          <label htmlFor="archive-month" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Month
          </label>
          <select
            id="archive-month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            style={{ minWidth: "130px" }}
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={String(i + 1)}>{m}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[11rem]">
          <label htmlFor="archive-section" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Section filter
          </label>
          <input
            id="archive-section"
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g. U.S., World, Sports"
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            style={{ width: "180px" }}
          />
        </div>

        <div className="min-w-[11rem]">
          <label htmlFor="archive-keyword" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Keyword filter
          </label>
          <input
            id="archive-keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="e.g. Iran"
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            style={{ width: "160px" }}
          />
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="px-5 py-2 rounded-lg font-semibold text-sm text-white"
          style={{ backgroundColor: loading ? "#9a9a9a" : "#1a1a2e", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Fetching…" : "Fetch Archive"}
        </button>

        {result && result.docs.length > 0 && !loading && (
          <ExportButton data={result.docs} filename={`nyt-archive-${year}-${month}`} />
        )}
      </div>

      {/* Content */}
      <div className="page-frame page-content flex-1 overflow-y-auto">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">◻</div>
            <p className="text-sm">Fetching archive data — this may take a moment…</p>
          </div>
        )}

        {!loading && result && (
          <>
            <div className="mb-5 flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">
                {MONTHS[Number(month) - 1]} {year}
              </span>
              <span className="text-sm text-gray-400">
                {result.total.toLocaleString()} total articles in archive
              </span>
              {result.filtered !== result.total && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                  style={{ backgroundColor: "#d0021b" }}
                >
                  {result.filtered} matched filters (showing first 50)
                </span>
              )}
            </div>

            {result.docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <p className="text-sm">No articles matched your filters.</p>
              </div>
            ) : (
              <div className="results-grid">
                {result.docs.map((a, i) => (
                  <ArticleCard key={(a as { _id?: string })._id ?? i} article={a} />
                ))}
              </div>
            )}
          </>
        )}

        {!fetched && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-4xl mb-3">◻</div>
            <p className="text-sm">Pick a year, month, and optional filters, then click Fetch Archive.</p>
            <p className="text-xs mt-2 text-gray-300">Data goes back to January 1851.</p>
          </div>
        )}
      </div>
    </div>
  );
}
