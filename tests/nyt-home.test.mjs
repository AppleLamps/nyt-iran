import test from "node:test";
import assert from "node:assert/strict";

import { buildSearchPresets, pickLeadStory, pickSupportingStories } from "../app/lib/nyt-home.mjs";

const articles = [
  { title: "Lead", section: "World", abstract: "Lead summary", url: "https://example.com/lead" },
  { title: "Second", section: "U.S.", abstract: "Second summary", url: "https://example.com/second" },
  { title: "Third", section: "Business", abstract: "Third summary", url: "https://example.com/third" },
  { title: "Fourth", section: "Tech", abstract: "Fourth summary", url: "https://example.com/fourth" },
];

test("pickLeadStory returns the first article with a usable title", () => {
  assert.equal(pickLeadStory(articles)?.title, "Lead");
});

test("pickSupportingStories excludes the lead story and respects the limit", () => {
  const lead = pickLeadStory(articles);
  const supporting = pickSupportingStories(articles, lead, 2);

  assert.deepEqual(
    supporting.map((article) => article.title),
    ["Second", "Third"],
  );
});

test("buildSearchPresets includes guided Iran-focused presets", () => {
  const presets = buildSearchPresets();

  assert.ok(presets.some((preset) => preset.label === "Iran coverage"));
  assert.ok(presets.some((preset) => preset.href.includes("/article-search")));
});
