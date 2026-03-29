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
    <article className="article-card bg-white rounded-xl overflow-hidden border border-[#e2e2e2]">
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
      <div className="p-4">
        {section && (
          <span
            className="inline-block mb-2 px-2 py-0.5 rounded text-white font-semibold"
            style={{
              backgroundColor: "#1a1a2e",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {section}
          </span>
        )}
        <h3 className="font-bold leading-snug mb-2" style={{ fontFamily: "Georgia, serif", fontSize: "16px" }}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="hover:text-red-700 transition-colors"
          >
            {title}
          </a>
        </h3>
        {summary && (
          <p className="text-gray-600 leading-snug mb-3" style={{ fontSize: "13px" }}>
            {summary}
          </p>
        )}
        <div className="flex items-center justify-between" style={{ fontSize: "11px", color: "#9a9a9a" }}>
          {byline && <span>{byline}</span>}
          {date && <span>{formatDate(date)}</span>}
        </div>
      </div>
    </article>
  );
}
