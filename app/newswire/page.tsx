"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import ArticleCard, { Article } from "@/components/ArticleCard";
import ExportButton from "@/components/ExportButton";

const SOURCES = [
  { value: "all", label: "All (NYT + INYT)" },
  { value: "nyt", label: "New York Times" },
  { value: "inyt", label: "International NYT" },
];

const LIMITS = [20, 40, 60, 80, 100];

export default function NewswirePage() {
  const [source, setSource] = useState("all");
  const [section, setSection] = useState("all");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [sections, setSections] = useState<Array<{ section: string; display_name: string }>>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  // Load section list on mount
  useEffect(() => {
    fetch("/api/newswire?section_list=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.results) setSections(d.results);
      })
      .catch(() => {});
  }, []);

  async function load(off: number = 0) {
    setLoading(true);
    setError("");
    setOffset(off);
    try {
      const params = new URLSearchParams({ source, section, limit: String(limit), offset: String(off) });
      const res = await fetch(`/api/newswire?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.fault?.faultstring ?? data.message ?? `Error ${res.status}`);
      setArticles(data.results ?? []);
      setTotal(data.num_results ?? 0);
      setFetched(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Times Newswire"
        description="Live stream of articles as they're published on NYTimes.com"
      />

      {/* Controls */}
      <div className="bg-white border-b border-[#e2e2e2] px-8 py-4 flex items-end gap-4 flex-wrap">
        <div>
          <label htmlFor="nw-source" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Source
          </label>
          <select
            id="nw-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="nw-section" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Section
          </label>
          <select
            id="nw-section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            style={{ minWidth: "160px" }}
          >
            <option value="all">All Sections</option>
            {sections.map((s) => (
              <option key={s.section} value={s.section}>{s.display_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="nw-limit" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Results
          </label>
          <select
            id="nw-limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
          >
            {LIMITS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => load(0)}
          disabled={loading}
          className="px-5 py-2 rounded-lg font-semibold text-sm text-white"
          style={{ backgroundColor: loading ? "#9a9a9a" : "#1a1a2e", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Loading…" : "Fetch Wire"}
        </button>

        {fetched && !loading && (
          <>
            <span className="text-sm text-gray-400">{total.toLocaleString()} total articles</span>
            <ExportButton data={articles} filename={`nyt-newswire-${source}-${section}`} />
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && <SkeletonGrid />}

        {!loading && fetched && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <p className="text-sm">No articles found for this filter.</p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <>
            <div className="grid gap-5 mb-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {articles.map((a, i) => (
                <ArticleCard key={(a as { uri?: string }).uri ?? i} article={a} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 py-4">
              <button
                onClick={() => load(offset - limit)}
                disabled={!canPrev || loading}
                className="px-4 py-2 rounded-lg border border-[#e2e2e2] text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">
                {offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()}
              </span>
              <button
                onClick={() => load(offset + limit)}
                disabled={!canNext || loading}
                className="px-4 py-2 rounded-lg border border-[#e2e2e2] text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {!fetched && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-4xl mb-3">⚡</div>
            <p className="text-sm">Select source and section, then click Fetch Wire.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden border border-[#e2e2e2]">
          <div className="skeleton" style={{ height: "160px" }} />
          <div className="p-4 space-y-2">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
