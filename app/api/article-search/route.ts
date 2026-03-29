import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

export async function GET(req: NextRequest) {
  const key = process.env.NYT_API_KEY;
  if (!key) return NextResponse.json({ error: "NYT_API_KEY not set" }, { status: 500 });

  const params = new URLSearchParams();
  params.set("api-key", key);

  const forward = ["q", "fq", "page", "sort", "begin_date", "end_date"];
  for (const p of forward) {
    const v = req.nextUrl.searchParams.get(p);
    if (v) params.set(p, v);
  }

  try {
    const res = await fetch(`${BASE}?${params.toString()}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
