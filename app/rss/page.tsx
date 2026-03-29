"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ExportButton from "@/components/ExportButton";
import { parseRssState, toRssQuery } from "@/app/lib/explorer-url-state.mjs";

const RSS_SECTIONS = [
  "HomePage", "Africa", "Americas", "ArtandDesign", "Arts", "AsiaPacific",
  "Automobiles", "Baseball", "Books/Review", "Business", "Climate",
  "CollegeBasketball", "CollegeFootball", "Dance", "Dealbook", "DiningandWine",
  "Economy", "Education", "EnergyEnvironment", "Europe", "FashionandStyle",
  "Golf", "Health", "Hockey", "Jobs", "Lens", "MediaandAdvertising",
  "MiddleEast", "MostEmailed", "MostShared", "MostViewed", "Movies",
  "Music", "NYRegion", "Obituaries", "PersonalTech", "Politics",
  "ProBasketball", "ProFootball", "RealEstate", "Science", "SmallBusiness",
  "Soccer", "Space", "Sports", "SundayBookReview", "Sunday-Review",
  "Technology", "Television", "Tennis", "Theater", "TMagazine", "Travel",
  "Upshot", "US", "Weddings", "Well", "World",
];

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  creator: string;
  category: string[];
  mediaUrl: string;
  mediaCredit: string;
}

function formatDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return raw;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

export default function RSSPage() {
  const [section, setSection] = useState(() =>
    typeof window === "undefined" ? "HomePage" : parseRssState(window.location.search).section,
  );
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const autoLoaded = useRef(false);

  const load = useCallback(async () => {
    window.history.replaceState(null, "", `/rss${toRssQuery({ section })}`);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rss?section=${encodeURIComponent(section)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setItems(data.items ?? []);
      setFetched(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    void load();
  }, [load]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="RSS Feeds"
        description="NYTimes.com section feeds — no API key required"
      />

      {/* Controls */}
      <div className="page-frame page-controls flex flex-wrap items-end gap-4 border-b border-black/10 bg-white/65 py-4">
        <div className="min-w-[13rem]">
          <label htmlFor="rss-section" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Section
          </label>
          <select
            id="rss-section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
            style={{ minWidth: "200px" }}
          >
            {RSS_SECTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="px-5 py-2 rounded-lg font-semibold text-sm text-white"
          style={{ backgroundColor: loading ? "#9a9a9a" : "#1a1a2e", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Loading…" : "Fetch Feed"}
        </button>

        {fetched && !loading && (
          <>
            <span className="text-sm text-gray-400">{items.length} items</span>
            <ExportButton data={items} filename={`nyt-rss-${section}`} />
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

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="soft-panel flex gap-4 rounded-[1.4rem] p-4">
                <div className="skeleton flex-shrink-0" style={{ width: "100px", height: "70px", borderRadius: "8px" }} />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && fetched && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <p className="text-sm">No items found in this feed.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item, i) => (
              <article
                key={item.link || i}
                className="article-card soft-panel flex flex-col overflow-hidden rounded-[1.4rem] sm:flex-row"
              >
                {item.mediaUrl && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden sm:w-[140px] sm:flex-shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="h-[210px] w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-full"
                    />
                  </a>
                )}
                <div className="p-4 flex-1 min-w-0">
                  {item.category.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.category.slice(0, 3).map((c, ci) => (
                        <span
                          key={ci}
                          className="inline-block px-2 py-0.5 rounded text-white font-semibold"
                          style={{ backgroundColor: "#1a1a2e", fontSize: "10px", letterSpacing: "0.08em" }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3
                    className="font-bold leading-snug mb-1"
                    style={{ fontFamily: "Georgia, serif", fontSize: "15px" }}
                  >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-red-700 transition-colors"
                    >
                      {stripHtml(item.title)}
                    </a>
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 leading-snug mb-2 line-clamp-2" style={{ fontSize: "13px" }}>
                      {stripHtml(item.description)}
                    </p>
                  )}
                  <div className="flex items-center gap-3" style={{ fontSize: "11px", color: "#9a9a9a" }}>
                    {item.creator && <span>{item.creator}</span>}
                    {item.pubDate && <span>{formatDate(item.pubDate)}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!fetched && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-4xl mb-3">⊕</div>
            <p className="text-sm">Select a section and click Fetch Feed.</p>
            <p className="text-xs mt-2 text-gray-300">No API key required for RSS feeds.</p>
          </div>
        )}
      </div>
    </div>
  );
}
