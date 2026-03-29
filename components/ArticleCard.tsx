import Image from "next/image";

export interface Article {
  title?: string;
  headline?: string | { main?: string; kicker?: string; print_headline?: string };
  abstract?: string;
  snippet?: string;
  byline?: string | { original?: string };
  section?: string;
  section_name?: string;
  pub_date?: string;
  published_date?: string;
  updated_date?: string;
  url?: string;
  web_url?: string;
  multimedia?: Array<{
    url?: string;
    format?: string;
    default?: { url?: string };
    thumbnail?: { url?: string };
  }>;
  media?: Array<{
    type?: string;
    "media-metadata"?: Array<{ url?: string; format?: string }>;
  }>;
  thumbnail_standard?: string;
}

function getImageUrl(article: Article): string | null {
  // Most Popular / Newswire: media array with media-metadata
  if (article.media?.length) {
    const meta = article.media[0]["media-metadata"];
    if (meta?.length) {
      const large = meta.find((m) => m.format === "mediumThreeByTwo440") ?? meta[meta.length - 1];
      if (large?.url) return large.url;
    }
  }
  // Newswire / Top Stories: thumbnail_standard
  if (article.thumbnail_standard) return article.thumbnail_standard;
  // Article Search: multimedia array
  if (article.multimedia?.length) {
    const img = article.multimedia.find((m) => m.default?.url) ?? article.multimedia[0];
    if (img?.default?.url) {
      const url = img.default.url;
      return url.startsWith("http") ? url : `https://static01.nyt.com/${url}`;
    }
    if (typeof img?.url === "string") {
      const url = img.url;
      return url.startsWith("http") ? url : `https://static01.nyt.com/${url}`;
    }
  }
  return null;
}

function formatDate(raw?: string): string {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

function resolveHeadline(h: Article["headline"]): string {
  if (!h) return "";
  if (typeof h === "string") return h;
  return h.main ?? "";
}

function resolveByline(b: Article["byline"]): string {
  if (!b) return "";
  if (typeof b === "string") return b;
  return b.original ?? "";
}

export default function ArticleCard({ article }: { article: Article }) {
  const title = article.title || resolveHeadline(article.headline) || "Untitled";
  const summary = article.abstract ?? article.snippet ?? "";
  const byline = resolveByline(article.byline);
  const section = article.section ?? article.section_name ?? "";
  const date = article.published_date ?? article.pub_date ?? article.updated_date ?? "";
  const href = article.url ?? article.web_url ?? "#";
  const imgSrc = getImageUrl(article);

  return (
    <article className="article-card soft-panel overflow-hidden rounded-[1.4rem]">
      {imgSrc && (
        <a href={href} target="_blank" rel="noreferrer" className="block overflow-hidden">
          <div className="relative w-full" style={{ paddingTop: "52%" }}>
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>
        </a>
      )}
      <div className="p-4 sm:p-5">
        {section && (
          <span
            className="mb-3 inline-block rounded-full px-3 py-1 font-semibold text-white"
            style={{
              backgroundColor: "#111827",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {section}
          </span>
        )}
        <h3 className="mb-2 font-bold leading-snug text-[var(--color-ink-strong)]" style={{ fontFamily: "Georgia, serif", fontSize: "18px" }}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-[var(--color-accent)]"
          >
            {title}
          </a>
        </h3>
        {summary && (
          <p className="mb-4 text-[13px] leading-6 text-black/62 sm:text-sm">
            {summary}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-black/42">
          {byline && <span className="max-w-full">{byline}</span>}
          {date && <span>{formatDate(date)}</span>}
        </div>
      </div>
    </article>
  );
}
