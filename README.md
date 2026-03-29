# NYT API Explorer

A small [Next.js](https://nextjs.org) app that wraps **The New York Times** public APIs behind server-side proxies and presents a simple UI for browsing Top Stories, Article Search, Most Popular, Times Newswire, Archive, and RSS feeds.

OpenAPI specs used as reference live in [`docs/`](docs/) (Swagger 2.0 YAML files from NYT).

## Requirements

- Node.js 20+ (for local dev; `npm run dev` loads `.env.local` automatically)
- A NYT Developer [API key](https://developer.nytimes.com/) with access to the products you use (Archive and Article Search require the right products enabled on the key)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root:

   ```bash
   NYT_API_KEY=your_key_here
   ```

   RSS feeds do not need a key for the upstream host, but JSON APIs are called from Route Handlers with this key.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) (root redirects to **Top Stories**).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build` | Production build        |
| `npm run start` | Start production server |
| `npm run lint`  | ESLint                   |

## Features

- **Top Stories** — Section fronts (`/svc/topstories/v2`).
- **Article Search** — Keyword, filter query (`fq`), date range, sort, pagination. The dashboard aggregates NYT’s 10-doc upstream pages into **25 results per page**. Export **this page** or **all paginated results** (up to NYT’s cap of 100 pages × 10 articles). Response totals use `response.metadata` (API change ~Apr 2025; `meta` is supported as a fallback).
- **Most Popular** — Viewed / emailed / shared (`/svc/mostpopular/v2`).
- **Newswire** — Live wire with section list (`/svc/news/v3`).
- **Archive** — Month archive with server-side filtering and a 50-article preview payload so the browser is not given multi‑megabyte responses raw.
- **RSS** — Fetches XML from `rss.nytimes.com`, parses on the server, returns JSON to the client.

JSON downloads use the **Download JSON** / **This page** / **All results** controls where applicable.

## Architecture

- `app/api/*/route.ts` — Proxies to NYT (or RSS). The browser never sees `NYT_API_KEY`; it only calls same-origin `/api/...` routes.
- `app/*/page.tsx` — Client pages with forms and results.
- `components/` — Shared UI (`ArticleCard`, `ExportButton`, sidebar, etc.).

## Deploy (e.g. Vercel)

Set the environment variable `NYT_API_KEY` in the hosting dashboard. Do not commit real keys; keep `.env.local` and any `keys.txt` out of version control (`.gitignore` should cover `.env*`).

## API limits and behavior

- Article Search returns **25 results per page in this UI**, aggregated from NYT’s upstream **10-hit pages**. Pagination is still limited by NYT (**at most 100 upstream pages**, i.e. 1,000 articles per query). “Export all” respects that cap and adds a note in the JSON when total reported hits exceed it.
- Archive month files can be very large; this app fetches them on the server and returns a trimmed list for the UI.

## License / usage

Data and trademarks belong to **The New York Times**. Use their APIs according to [NYT API Terms](https://developer.nytimes.com/terms/) and attribution/copyright notices in API responses.
