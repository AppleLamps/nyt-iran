import { NextRequest, NextResponse } from "next/server";
import {
  ARTICLE_SEARCH_PAGE_SIZE,
  getArticleSearchWindow,
  mergeArticleSearchDocs,
} from "@/app/lib/article-search-pagination.mjs";

const BASE = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

export async function GET(req: NextRequest) {
  const key = process.env.NYT_API_KEY;
  if (!key) return NextResponse.json({ error: "NYT_API_KEY not set" }, { status: 500 });

  const requestedPage = Number(req.nextUrl.searchParams.get("page") ?? "0");
  const pageWindow = getArticleSearchWindow(requestedPage);
  const forward = ["q", "fq", "sort", "begin_date", "end_date"];

  const buildParams = (upstreamPage: number) => {
    const params = new URLSearchParams();
    params.set("api-key", key);
    params.set("page", String(upstreamPage));

    for (const p of forward) {
      const v = req.nextUrl.searchParams.get(p);
      if (v) params.set(p, v);
    }

    return params;
  };

  try {
    const responses = await Promise.all(
      pageWindow.upstreamPages.map(async (upstreamPage) => {
        const res = await fetch(`${BASE}?${buildParams(upstreamPage).toString()}`);
        const data = await res.json();
        return { res, data };
      }),
    );

    const failed = responses.find(({ res }) => !res.ok);
    if (failed) {
      return NextResponse.json(failed.data, { status: failed.res.status });
    }

    const mergedDocs = responses.flatMap(({ data }) => data.response?.docs ?? []);
    const slicedDocs = mergeArticleSearchDocs(mergedDocs, pageWindow);
    const first = responses[0]?.data;

    return NextResponse.json(
      {
        ...first,
        response: {
          ...(first?.response ?? {}),
          docs: slicedDocs,
          metadata: {
            ...(first?.response?.metadata ?? first?.response?.meta ?? {}),
            page_size: ARTICLE_SEARCH_PAGE_SIZE,
          },
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
