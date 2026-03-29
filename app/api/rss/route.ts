import { NextRequest, NextResponse } from "next/server";

const RSS_BASE = "https://rss.nytimes.com/services/xml/rss/nyt";

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section") || "HomePage";

  try {
    const res = await fetch(`${RSS_BASE}/${section}.xml`, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "NYT-Explorer/1.0" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `RSS returned ${res.status}` }, { status: res.status });
    }

    const xml = await res.text();

    // Parse XML to JSON on the server
    const items = parseRSS(xml);
    return NextResponse.json({ section, items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch RSS" }, { status: 502 });
  }
}

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

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      description: extractTag(block, "description"),
      pubDate: extractTag(block, "pubDate"),
      creator: extractTag(block, "dc:creator"),
      category: extractAllTags(block, "category"),
      mediaUrl: extractAttr(block, "media:content", "url"),
      mediaCredit: extractTag(block, "media:credit"),
    });
  }
  return items;
}

function extractTag(xml: string, tag: string): string {
  const escaped = tag.replace(":", "\\:");
  const re = new RegExp(`<${escaped}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${escaped}>|<${escaped}>([\\s\\S]*?)<\/${escaped}>`);
  const m = re.exec(xml);
  return m ? (m[1] ?? m[2] ?? "").trim() : "";
}

function extractAllTags(xml: string, tag: string): string[] {
  const escaped = tag.replace(":", "\\:");
  const re = new RegExp(`<${escaped}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${escaped}>|<${escaped}>([\\s\\S]*?)<\/${escaped}>`, "g");
  const results: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push((m[1] ?? m[2] ?? "").trim());
  }
  return results;
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const escaped = tag.replace(":", "\\:");
  const re = new RegExp(`<${escaped}[^>]*${attr}="([^"]*)"`, "i");
  const m = re.exec(xml);
  return m ? m[1] : "";
}
