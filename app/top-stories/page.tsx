"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import ArticleCard, { Article } from "@/components/ArticleCard";
import ExportButton from "@/components/ExportButton";
import { parseTopStoriesState, toTopStoriesQuery } from "@/app/lib/explorer-url-state.mjs";

const SECTIONS = [
  "home", "arts", "automobiles", "books/review", "business", "fashion",
  "food", "health", "insider", "magazine", "movies", "nyregion",
  "obituaries", "opinion", "politics", "realestate", "science",
  "sports", "sundayreview", "technology", "theater", "t-magazine",
  "travel", "upshot", "us", "world",
];

export default function TopStoriesPage() {
  const [section, setSection] = useState(() =>
    typeof window === "undefined" ? "home" : parseTopStoriesState(window.location.search).section,
  );
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const autoLoaded = useRef(false);

  const load = useCallback(async (sec: string) => {
    window.history.replaceState(null, "", `/top-stories${toTopStoriesQuery({ section: sec })}`);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/top-stories?section=${sec}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.fault?.faultstring ?? data.error ?? `Error ${res.status}`);
      setArticles(data.results ?? []);
      setFetched(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    void load(section);
  }, [load, section]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Top Stories"
        description="Articles currently on the section fronts of NYTimes.com"
      />

      {/* Controls */}
      <div className="page-frame page-controls flex flex-wrap items-end gap-4 border-b border-black/10 bg-white/65 py-4">
        <div className="min-w-[11rem]">
          <label htmlFor="ts-section" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Section
          </label>
          <select
            id="ts-section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1).replace("/", " / ")}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => load(section)}
          disabled={loading}
          className="px-5 py-2 rounded-lg font-semibold text-sm text-white transition-all"
          style={{
            backgroundColor: loading ? "#9a9a9a" : "#1a1a2e",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading…" : "Fetch Stories"}
        </button>
        {fetched && !loading && (
          <>
            <span className="text-sm text-gray-400">{articles.length} stories</span>
            <ExportButton data={articles} filename={`nyt-top-stories-${section}`} />
          </>
        )}
      </div>

      {/* Content */}
      <div className="page-frame page-content flex-1 overflow-y-auto">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && <SkeletonGrid />}

        {!loading && fetched && articles.length === 0 && (
          <Empty message="No stories found for this section." />
        )}

        {!loading && articles.length > 0 && (
          <div className="results-grid">
            {articles.map((a, i) => (
              <ArticleCard key={a.url ?? i} article={a} />
            ))}
          </div>
        )}

        {!fetched && !loading && !error && (
          <Prompt message="Select a section and click Fetch Stories." />
        )}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="results-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="soft-panel overflow-hidden rounded-[1.4rem]">
          <div className="skeleton" style={{ height: "160px" }} />
          <div className="p-4 space-y-2">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Prompt({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <div className="text-4xl mb-3">◈</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <div className="text-4xl mb-3">○</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
