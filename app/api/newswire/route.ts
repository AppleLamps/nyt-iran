import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.nytimes.com/svc/news/v3";

export async function GET(req: NextRequest) {
  const key = process.env.NYT_API_KEY;
  if (!key) return NextResponse.json({ error: "NYT_API_KEY not set" }, { status: 500 });

  const source = req.nextUrl.searchParams.get("source") || "all";
  const section = req.nextUrl.searchParams.get("section") || "all";
  const limit = req.nextUrl.searchParams.get("limit") || "20";
  const offset = req.nextUrl.searchParams.get("offset") || "0";
  const isSectionList = req.nextUrl.searchParams.get("section_list") === "1";

  try {
    let url: string;
    if (isSectionList) {
      url = `${BASE}/content/section-list.json?api-key=${key}`;
    } else {
      url = `${BASE}/content/${source}/${section}.json?api-key=${key}&limit=${limit}&offset=${offset}`;
    }
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
