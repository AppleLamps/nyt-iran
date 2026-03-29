import Image from "next/image";
import Link from "next/link";
import { NAV_ITEMS } from "@/app/lib/navigation";
import { buildSearchPresets, pickLeadStory, pickSupportingStories } from "@/app/lib/nyt-home.mjs";
import { pickNewswireHighlights } from "@/app/lib/homepage-curation.mjs";
import type { Article } from "@/components/ArticleCard";

export const revalidate = 300;

interface HomeData {
  topStories: Article[];
  mostPopular: Article[];
  newswire: Article[];
  error?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function loadHomeData(): Promise<HomeData> {
  const key = process.env.NYT_API_KEY;
  if (!key) {
    return {
      topStories: [],
      mostPopular: [],
      newswire: [],
      error: "Set NYT_API_KEY to unlock live front-page data. Search, archive, and RSS tools remain available.",
    };
  }

  try {
    const [topStoriesData, mostPopularData, newswireData] = await Promise.all([
      fetchJson<{ results?: Article[] }>(`https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${key}`),
      fetchJson<{ results?: Article[] }>(`https://api.nytimes.com/svc/mostpopular/v2/viewed/1.json?api-key=${key}`),
      fetchJson<{ results?: Article[] }>(`https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=${key}&limit=6`),
    ]);

    return {
      topStories: topStoriesData.results ?? [],
      mostPopular: mostPopularData.results ?? [],
      newswire: newswireData.results ?? [],
    };
  } catch {
    return {
      topStories: [],
      mostPopular: [],
      newswire: [],
      error: "Live NYT data is temporarily unavailable. Use the explorer pages below to keep working.",
    };
  }
}

function getImageUrl(article: Article): string | null {
  if (article.media?.length) {
    const meta = article.media[0]["media-metadata"];
    if (meta?.length) {
      return meta[meta.length - 1]?.url ?? null;
    }
  }

  if (article.thumbnail_standard) return article.thumbnail_standard;

  if (article.multimedia?.length) {
    const item = article.multimedia.find((entry) => entry.default?.url) ?? article.multimedia[0];
    const candidate = item?.default?.url ?? item?.url;
    if (!candidate) return null;
    return candidate.startsWith("http") ? candidate : `https://static01.nyt.com/${candidate}`;
  }

  return null;
}

function resolveTitle(article: Article): string {
  if (article.title) return article.title;
  if (typeof article.headline === "string") return article.headline;
  return article.headline?.main ?? "Untitled";
}

export default async function Root() {
  const { topStories, mostPopular, newswire, error } = await loadHomeData();
  const leadStory = pickLeadStory(topStories);
  const supportingStories: Article[] = pickSupportingStories(topStories, leadStory, 4);
  const popularStories: Article[] = pickSupportingStories(mostPopular, null, 4);
  const wireStories: Article[] = pickNewswireHighlights(newswire, 4);
  const presets = buildSearchPresets();
  const toolLinks = NAV_ITEMS.filter((item) => item.href !== "/");
  const leadImage = leadStory ? getImageUrl(leadStory) : null;

  return (
    <div className="page-frame">
      <section className="page-section pb-10 pt-8 sm:pb-14 sm:pt-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)] lg:items-end">
          <div className="rounded-[2rem] border border-black/10 bg-[#ede7dc] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-black/45">Front Page</p>
            <h1 className="mt-4 max-w-4xl font-serif text-[clamp(3.1rem,10vw,7rem)] leading-[0.88] text-[var(--color-ink-strong)]">
              Iran Desk
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/62 sm:text-lg">
              A live editorial surface for top stories, audience signals, and fast entry into the New York Times data tools.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/article-search?q=Iran&sort=newest"
                className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Search Iran coverage
              </Link>
              <Link
                href="/top-stories"
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink-strong)]"
              >
                Open Top Stories
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-[#111827] p-6 text-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] sm:p-7">
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-white/45">Desk Briefing</p>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/38">Live sections</p>
                <p className="mt-2 font-serif text-3xl">{toolLinks.length}</p>
              </div>
              <div className="border-t border-white/10 pt-5">
                <p className="text-sm uppercase tracking-[0.24em] text-white/38">Best first move</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Start on the front page, then jump into Article Search when you want to refine or export specific coverage.
                </p>
              </div>
              <div className="border-t border-white/10 pt-5">
                <p className="text-sm uppercase tracking-[0.24em] text-white/38">Quick access</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {toolLinks.slice(0, 4).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/72 transition-colors hover:bg-white/8"
                    >
                      {item.shortLabel}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <section className="page-section pb-4">
          <div className="rounded-[1.6rem] border border-amber-300/80 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {error}
          </div>
        </section>
      )}

      <section className="page-section pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-black/40">Top Stories</p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink-strong)]">The lead report</h2>
          </div>
          <Link href="/top-stories" className="text-sm font-semibold text-[var(--color-accent)]">
            View all sections
          </Link>
        </div>

        {leadStory ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
            <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              {leadImage && (
                <div className="relative h-[280px] w-full sm:h-[360px] lg:h-[430px]">
                  <Image src={leadImage} alt={resolveTitle(leadStory)} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="space-y-4 p-6 sm:p-8">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-black/42">
                  {leadStory.section ?? leadStory.section_name ?? "Top Story"}
                </p>
                <h3 className="max-w-4xl font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.94] text-[var(--color-ink-strong)]">
                  <a href={leadStory.url ?? leadStory.web_url ?? "#"} target="_blank" rel="noreferrer">
                    {resolveTitle(leadStory)}
                  </a>
                </h3>
                <p className="max-w-3xl text-base leading-7 text-black/65 sm:text-lg">
                  {leadStory.abstract ?? leadStory.snippet ?? "Open the story for the latest details."}
                </p>
              </div>
            </article>

            <div className="space-y-4">
              {supportingStories.length > 0 ? (
                supportingStories.map((story, index) => (
                  <article key={story.url ?? story.web_url ?? index} className="soft-panel rounded-[1.4rem] p-5">
                    <p className="text-[0.62rem] uppercase tracking-[0.24em] text-black/42">
                      {story.section ?? story.section_name ?? "Story"} • {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-ink-strong)]">
                      <a href={story.url ?? story.web_url ?? "#"} target="_blank" rel="noreferrer">
                        {resolveTitle(story)}
                      </a>
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-black/60">{story.abstract ?? story.snippet ?? ""}</p>
                  </article>
                ))
              ) : (
                <div className="soft-panel rounded-[1.4rem] p-5 text-sm leading-6 text-black/58">
                  Live Top Stories will appear here once the NYT API is available.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="soft-panel rounded-[1.6rem] p-6 text-sm leading-6 text-black/58">
            Live lead-story coverage is unavailable right now. Use the explorer links below to work directly with each API.
          </div>
        )}
      </section>

      <section className="page-section pb-12">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div>
            <div className="mb-5">
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-black/40">Quick Start</p>
              <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink-strong)]">Search presets</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {presets.map((preset) => (
                <Link
                  key={preset.label}
                  href={preset.href}
                  className="soft-panel rounded-[1.5rem] p-5 transition-transform hover:-translate-y-1"
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.24em] text-black/42">Preset</p>
                  <h3 className="mt-3 font-serif text-2xl text-[var(--color-ink-strong)]">{preset.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/60">{preset.description}</p>
                  <p className="mt-6 text-sm font-semibold text-[var(--color-accent)]">Open in Article Search</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.3em] text-black/40">Audience Signal</p>
                <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink-strong)]">Most viewed now</h2>
              </div>
              <Link href="/most-popular" className="text-sm font-semibold text-[var(--color-accent)]">
                Open Most Popular
              </Link>
            </div>
            <div className="space-y-4">
              {popularStories.length > 0 ? (
                popularStories.map((story, index) => (
                  <article key={story.url ?? story.web_url ?? index} className="soft-panel rounded-[1.4rem] p-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-black/42">Rank {index + 1}</p>
                      <p className="text-xs text-black/38">{story.section ?? story.section_name ?? "Popular"}</p>
                    </div>
                    <h3 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-ink-strong)]">
                      <a href={story.url ?? story.web_url ?? "#"} target="_blank" rel="noreferrer">
                        {resolveTitle(story)}
                      </a>
                    </h3>
                  </article>
                ))
              ) : (
                <div className="soft-panel rounded-[1.4rem] p-5 text-sm leading-6 text-black/58">
                  Most Popular data will appear here when the upstream feed responds.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-black/40">Live Wire</p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink-strong)]">Fresh from the newswire</h2>
          </div>
          <Link href="/newswire" className="text-sm font-semibold text-[var(--color-accent)]">
            Open Newswire
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {wireStories.length > 0 ? (
            wireStories.map((story, index) => (
              <article key={story.url ?? story.web_url ?? index} className="soft-panel rounded-[1.4rem] p-5">
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-black/42">
                  {story.section ?? story.section_name ?? "Newswire"}
                </p>
                <h3 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-ink-strong)]">
                  <a href={story.url ?? story.web_url ?? "#"} target="_blank" rel="noreferrer">
                    {resolveTitle(story)}
                  </a>
                </h3>
                <p className="mt-3 text-sm leading-6 text-black/60">
                  {story.abstract ?? story.snippet ?? "Open the wire item for details."}
                </p>
              </article>
            ))
          ) : (
            <div className="soft-panel rounded-[1.4rem] p-5 text-sm leading-6 text-black/58 md:col-span-2 xl:col-span-4">
              Live wire items will appear here when the upstream feed responds.
            </div>
          )}
        </div>
      </section>

      <section className="page-section pb-16">
        <div className="mb-5">
          <p className="text-[0.68rem] uppercase tracking-[0.3em] text-black/40">Explorer Tools</p>
          <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink-strong)]">Open a reporting surface</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {toolLinks.map((item) => (
            <Link key={item.href} href={item.href} className="soft-panel rounded-[1.5rem] p-5">
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-black/42">{item.eyebrow}</p>
              <h3 className="mt-3 font-serif text-2xl text-[var(--color-ink-strong)]">{item.label}</h3>
              <p className="mt-3 text-sm leading-6 text-black/60">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
