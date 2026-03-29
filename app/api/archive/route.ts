import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.nytimes.com/svc/archive/v1";

export async function GET(req: NextRequest) {
  const key = process.env.NYT_API_KEY;
  if (!key) return NextResponse.json({ error: "NYT_API_KEY not set" }, { status: 500 });

  const year = req.nextUrl.searchParams.get("year");
  const month = req.nextUrl.searchParams.get("month");
  const section = req.nextUrl.searchParams.get("section") || "";
  const keyword = req.nextUrl.searchParams.get("keyword") || "";

  if (!year || !month) {
    return NextResponse.json({ error: "year and month are required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE}/${year}/${month}.json?api-key=${key}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();

    // Server-side filter to reduce payload before sending to browser
    let docs: unknown[] = data?.response?.docs ?? [];
    if (section) {
      docs = (docs as Array<{ section_name?: string }>).filter(
        (d) => d.section_name?.toLowerCase() === section.toLowerCase()
      );
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      docs = (docs as Array<{ headline?: { main?: string }; snippet?: string }>).filter(
        (d) =>
          d.headline?.main?.toLowerCase().includes(kw) ||
          d.snippet?.toLowerCase().includes(kw)
      );
    }

    return NextResponse.json({
      status: data.status,
      total: data?.response?.docs?.length ?? 0,
      filtered: docs.length,
      docs: docs.slice(0, 50),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
