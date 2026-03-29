"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ArticleCard, { Article } from "@/components/ArticleCard";
import ExportButton, { downloadJson } from "@/components/ExportButton";

const SORT_OPTIONS = [
  { value: "best", label: "Best Match" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "relevance", label: "Relevance" },
];

interface SearchMeta {
  hits: number;
  offset: number;
}

/** NYT caps pagination at 100 pages × 10 docs */
const NYT_SEARCH_MAX_PAGES = 100;

export default function ArticleSearchPage() {
  const [q, setQ] = useState("");
  const [fq, setFq] = useState("");
  const [sort, setSort] = useState("best");
  const [beginDate, setBeginDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);

  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const [exportAllBusy, setExportAllBusy] = useState(false);
  const [exportAllStatus, setExportAllStatus] = useState("");

  const toNYTDate = (d: string) => d.replace(/-/g, "");

  function buildSearchParams(pageNum: number) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (fq.trim()) params.set("fq", fq.trim());
    params.set("sort", sort);
    params.set("page", String(pageNum));
    if (beginDate) params.set("begin_date", toNYTDate(beginDate));
    if (endDate) params.set("end_date", toNYTDate(endDate));
    return params;
  }

  async function search(p: number = 0) {
    if (!q.trim() && !fq.trim()) {
      setError("Enter a keyword or filter query.");
      return;
    }
    setLoading(true);
    setError("");
    setPage(p);

    try {
      const res = await fetch(`/api/article-search?${buildSearchParams(p).toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.fault?.faultstring ?? data.errors?.[0] ?? `Error ${res.status}`);
      setArticles(data.response?.docs ?? []);
      // NYT renamed response.meta → response.metadata (Article Search API change, Apr 2025)
      const searchMeta =
        data.response?.metadata ?? data.response?.meta ?? null;
      setMeta(searchMeta);
      setFetched(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = meta ? Math.min(Math.ceil(meta.hits / 10), NYT_SEARCH_MAX_PAGES) : 0;
  const exportableCap = meta ? Math.min(meta.hits, NYT_SEARCH_MAX_PAGES * 10) : 0;

  async function exportAllPages() {
    if (!meta || totalPages < 1) return;
    if (!q.trim() && !fq.trim()) return;
    setExportAllBusy(true);
    setExportAllStatus("");
    setError("");
    const allDocs: Article[] = [];
    try {
      for (let p = 0; p < totalPages; p++) {
        setExportAllStatus(`Fetching page ${p + 1} of ${totalPages}…`);
        const res = await fetch(`/api/article-search?${buildSearchParams(p).toString()}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.fault?.faultstring ?? data.errors?.[0] ?? `Error ${res.status}`);
        }
        const docs = (data.response?.docs ?? []) as Article[];
        if (docs.length === 0) break;
        allDocs.push(...docs);
      }
      const truncatedByApi = meta.hits > NYT_SEARCH_MAX_PAGES * 10;
      downloadJson(
        {
          exportedAt: new Date().toISOString(),
          query: {
            q: q.trim() || undefined,
            fq: fq.trim() || undefined,
            sort,
            begin_date: beginDate ? toNYTDate(beginDate) : undefined,
            end_date: endDate ? toNYTDate(endDate) : undefined,
          },
          totalHitsReportedByApi: meta.hits,
          articlesInThisFile: allDocs.length,
          note: truncatedByApi
            ? `The NYT Article Search API returns at most ${NYT_SEARCH_MAX_PAGES} pages (up to ${NYT_SEARCH_MAX_PAGES * 10} articles). Total hits (${meta.hits.toLocaleString()}) exceed that cap; this file contains every article available through pagination.`
            : undefined,
          docs: allDocs,
        },
        `nyt-search-all-${q || "results"}-${exportableCap}articles`
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExportAllBusy(false);
      setExportAllStatus("");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Article Search"
        description="Search NYT articles back to 1851 using keywords and filters"
      />

      {/* Controls */}
      <div className="bg-white border-b border-[#e2e2e2] px-8 py-5">
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Keyword */}
          <div>
            <label htmlFor="as-keyword" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Keyword (q)
            </label>
            <input
              id="as-keyword"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search(0)}
              placeholder='e.g. "climate change" OR Iran'
              className="w-full border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            />
          </div>

          {/* Filter query */}
          <div>
            <label htmlFor="as-filter" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Filter Query (fq)
            </label>
            <input
              id="as-filter"
              type="text"
              value={fq}
              onChange={(e) => setFq(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search(0)}
              placeholder='e.g. desk:"Foreign" AND section.name:"World"'
              className="w-full border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            />
          </div>

          {/* Date range */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="as-from" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                From
              </label>
              <input
                id="as-from"
                type="date"
                value={beginDate}
                onChange={(e) => setBeginDate(e.target.value)}
                className="w-full border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="as-to" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                To
              </label>
              <input
                id="as-to"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
              />
            </div>
          </div>

          {/* Sort + Submit */}
          <div className="flex items-end gap-3">
            <div>
              <label htmlFor="as-sort" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Sort
              </label>
              <select
                id="as-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => search(0)}
              disabled={loading}
              className="px-5 py-2 rounded-lg font-semibold text-sm text-white transition-all"
              style={{ backgroundColor: loading ? "#9a9a9a" : "#1a1a2e", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {meta && (
          <div className="mt-3 text-xs text-gray-400">
            {meta.hits.toLocaleString()} {meta.hits === 10000 ? "+" : ""} results — page {page + 1} of {totalPages}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && <SkeletonList />}

        {!loading && fetched && articles.length === 0 && (
          <Empty message="No articles matched your search." />
        )}

        {!loading && articles.length > 0 && (
          <>
            <div className="mb-5 rounded-xl border border-[#e2e2e2] bg-white px-5 py-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-[#1a1a2e]">{articles.length}</span>
                  {" "}articles on this page
                  {meta != null && (
                    <span className="text-gray-500">
                      {" "}
                      · {meta.hits.toLocaleString()}
                      {meta.hits === 10000 ? "+" : ""} total matches
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <ExportButton
                    data={articles}
                    filename={`nyt-search-${q || "results"}-p${page + 1}`}
                    label="This page"
                  />
                  {meta != null && totalPages > 0 && (
                    <button
                      type="button"
                      onClick={exportAllPages}
                      disabled={exportAllBusy || loading}
                      className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1a1a2e] text-white hover:bg-[#2d2d44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
                      title={`Fetch up to ${exportableCap.toLocaleString()} articles (${totalPages} API pages) and download as one JSON file`}
                    >
                      {exportAllBusy ? "Fetching…" : `All results (up to ${exportableCap.toLocaleString()})`}
                    </button>
                  )}
                </div>
              </div>
              {meta != null && meta.hits > NYT_SEARCH_MAX_PAGES * 10 && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  NYT limits search to {NYT_SEARCH_MAX_PAGES} pages ({NYT_SEARCH_MAX_PAGES * 10} articles). Your query has more hits than that; “All results” downloads the maximum the API allows.
                </p>
              )}
              {exportAllStatus && (
                <p className="text-xs text-gray-500" aria-live="polite">
                  {exportAllStatus}
                </p>
              )}
            </div>
            <div className="space-y-4 mb-6">
              {articles.map((a, i) => (
                <ArticleCard key={(a as { _id?: string })._id ?? i} article={a} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => search(page - 1)}
                disabled={page === 0 || loading}
                className="px-4 py-2 rounded-lg border border-[#e2e2e2] text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => search(page + 1)}
                disabled={page >= totalPages - 1 || loading}
                className="px-4 py-2 rounded-lg border border-[#e2e2e2] text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {!fetched && !loading && !error && (
          <Prompt />
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-[#e2e2e2] flex gap-4">
          <div className="skeleton flex-shrink-0" style={{ width: "120px", height: "80px", borderRadius: "8px" }} />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Prompt() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <div className="text-4xl mb-3">⌕</div>
      <p className="text-sm">Enter a keyword or filter query to search articles.</p>
      <p className="text-xs mt-2 text-gray-300">
        Tip: use fq= for advanced filters like <code>desk:&quot;Foreign&quot;</code>
      </p>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}
