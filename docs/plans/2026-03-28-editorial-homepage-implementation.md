# Editorial Homepage And Responsive Shell Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an editorial homepage and responsive navigation shell while keeping all explorer pages usable for manual searches and exports.

**Architecture:** Keep the App Router root layout as the shared shell, move navigation metadata into a shared module, and fetch homepage data on the server in `app/page.tsx`. Existing client pages stay mostly intact, but they inherit a responsive content container and updated shell framing.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4

---

### Task 1: Shared navigation model

**Files:**
- Create: `app/lib/navigation.ts`
- Modify: `components/Sidebar.tsx`

**Step 1:** Add a shared navigation config that includes labels, descriptions, hrefs, and editorial badges.

**Step 2:** Refactor the sidebar to consume the shared config instead of duplicating route metadata inline.

**Step 3:** Keep desktop navigation visually stable while preparing it for a mobile wrapper.

### Task 2: Responsive app shell

**Files:**
- Create: `components/AppShell.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Step 1:** Introduce a client shell component with desktop sidebar, mobile top bar, and mobile navigation drawer state.

**Step 2:** Move route-aware shell logic into the new component so the root layout can remain a server layout.

**Step 3:** Add global styles and variables for the stronger editorial surface and responsive spacing.

### Task 3: Homepage data helpers

**Files:**
- Create: `app/lib/nyt-home.ts`
- Create: `tests/nyt-home.test.mjs`

**Step 1:** Extract small pure helpers for picking a lead story, slicing supporting stories, and defining search presets.

**Step 2:** Write a lightweight Node test that proves those helpers behave correctly.

**Step 3:** Run the test red, implement the helper, and run it green.

### Task 4: Editorial homepage

**Files:**
- Modify: `app/page.tsx`

**Step 1:** Replace the redirect with a server-rendered homepage that fetches curated Top Stories and Most Popular data.

**Step 2:** Build the lead story, secondary grid, search preset cards, and quick-link sections.

**Step 3:** Add graceful fallback UI for missing API keys or fetch failures.

### Task 5: Adapt existing pages to the new shell

**Files:**
- Modify: `components/PageHeader.tsx`
- Modify: `components/ArticleCard.tsx`
- Modify: `app/top-stories/page.tsx`
- Modify: `app/article-search/page.tsx`
- Modify: `app/most-popular/page.tsx`
- Modify: `app/newswire/page.tsx`
- Modify: `app/archive/page.tsx`
- Modify: `app/rss/page.tsx`

**Step 1:** Standardize page gutters and header spacing.

**Step 2:** Improve card responsiveness and metadata wrapping.

**Step 3:** Fix any rigid grid/control layouts that break on mobile.

### Task 6: Verification

**Files:**
- Modify: `package.json`

**Step 1:** Add a lightweight test script for the Node helper test.

**Step 2:** Run `npm run test`, `npm run lint`, and `npm run build`.

**Step 3:** Fix any verification failures before reporting completion.
