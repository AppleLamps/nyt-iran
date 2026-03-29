"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ArticleCard, { Article } from "@/components/ArticleCard";
import ExportButton from "@/components/ExportButton";

const TYPES = [
  { value: "viewed", label: "Most Viewed" },
  { value: "emailed", label: "Most Emailed" },
  { value: "shared", label: "Most Shared" },
];

const PERIODS = [
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

export default function MostPopularPage() {
  const [type, setType] = useState("viewed");
  const [period, setPeriod] = useState("1");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ type, period });
      if (type === "shared") params.set("share_type", "facebook");
      const res = await fetch(`/api/most-popular?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.fault?.faultstring ?? data.message ?? `Error ${res.status}`);
      setArticles(data.results ?? []);
      setFetched(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const activeType = TYPES.find((t) => t.value === type);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Most Popular"
        description="The most emailed, shared, and viewed articles on NYTimes.com"
      />

      {/* Controls */}
      <div className="bg-white border-b border-[#e2e2e2] px-8 py-4 flex items-end gap-4 flex-wrap">
        {/* Type tabs */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Type
          </label>
          <div className="flex rounded-lg border border-[#e2e2e2] overflow-hidden">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className="px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: type === t.value ? "#1a1a2e" : "white",
                  color: type === t.value ? "white" : "#4a4a4a",
                  borderRight: "1px solid #e2e2e2",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period */}
        <div>
          <label htmlFor="mp-period" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Period
          </label>
          <select
            id="mp-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="px-5 py-2 rounded-lg font-semibold text-sm text-white transition-all"
          style={{ backgroundColor: loading ? "#9a9a9a" : "#1a1a2e", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Loading…" : "Fetch"}
        </button>

        {fetched && !loading && (
          <>
            <span className="text-sm text-gray-400">{articles.length} articles</span>
            <ExportButton data={articles} filename={`nyt-most-${type}-${period}d`} />
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
            <p className="text-sm">No articles found.</p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <span
                className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: "#d0021b" }}
              >
                {activeType?.label} · {PERIODS.find((p) => p.value === period)?.label}
              </span>
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {articles.map((a, i) => (
                <ArticleCard key={(a as { id?: number }).id ?? i} article={a} />
              ))}
            </div>
          </>
        )}

        {!fetched && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-4xl mb-3">↑</div>
            <p className="text-sm">Select a type and time period, then click Fetch.</p>
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
