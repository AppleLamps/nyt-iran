import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.nytimes.com/svc/topstories/v2";

export async function GET(req: NextRequest) {
  const key = process.env.NYT_API_KEY;
  if (!key) return NextResponse.json({ error: "NYT_API_KEY not set" }, { status: 500 });

  const section = req.nextUrl.searchParams.get("section") || "home";

  try {
    const res = await fetch(`${BASE}/${section}.json?api-key=${key}`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
