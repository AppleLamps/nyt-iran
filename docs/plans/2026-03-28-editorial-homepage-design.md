# Editorial Homepage Design

**Date:** 2026-03-28

**Goal:** Replace the redirecting root route with a real editorial homepage and overhaul navigation for mobile without removing any existing explorer workflows.

## Summary

The app currently behaves like a set of disconnected form screens behind a fixed desktop sidebar. The new design turns the root route into a front page that surfaces live NYT data and guided entry points into the explorer. Existing product pages remain interactive and retain manual search, filtering, and export behavior.

## Product Direction

- Keep `Top Stories`, `Article Search`, `Most Popular`, `Newswire`, `Archive`, and `RSS` as dedicated working surfaces.
- Make `/` a newsroom-style entry page with curated live content and direct launch points.
- Replace the fixed sidebar with a responsive shell:
  - Desktop: persistent left rail.
  - Mobile: top bar plus drawer navigation.

## Homepage Structure

- Lead story block from Top Stories
- Secondary Top Stories grid
- Most Popular rail
- Search presets with Iran-focused entry points
- Quick links for explorer tools
- Short editorial copy that explains what each surface is for

## Data Strategy

- Fetch live homepage data on the server.
- Reuse the same NYT upstream APIs already used by route handlers.
- Keep the homepage curated and shallow to avoid a brittle dashboard feel.
- Fail gracefully when `NYT_API_KEY` is missing or upstream responses fail.

## UI Strategy

- Preserve the NYT-inspired editorial tone.
- Strengthen hierarchy with a clear top bar, stronger lead-story composition, and tighter section framing.
- Improve responsiveness with fluid spacing, breakpoint-aware grids, and touch-friendly controls.
- Reduce decorative symbols that do not improve comprehension.

## Risks

- Overloading the homepage with too many panels could make it feel like a control room instead of a front page.
- Reusing the existing shell naively would preserve current mobile layout problems.
- Server rendering live data requires graceful fallback messaging for missing keys or upstream failures.
