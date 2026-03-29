import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.nytimes.com/svc/mostpopular/v2";

export async function GET(req: NextRequest) {
  const key = process.env.NYT_API_KEY;
  if (!key) return NextResponse.json({ error: "NYT_API_KEY not set" }, { status: 500 });

  const type = req.nextUrl.searchParams.get("type") || "viewed";
  const period = req.nextUrl.searchParams.get("period") || "1";
  const shareType = req.nextUrl.searchParams.get("share_type");

  let path = `/${type}/${period}`;
  if (type === "shared" && shareType) {
    path = `/shared/${period}/${shareType}`;
  }

  try {
    const res = await fetch(`${BASE}${path}.json?api-key=${key}`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
