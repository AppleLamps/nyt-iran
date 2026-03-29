import test from "node:test";
import assert from "node:assert/strict";

import { pickNewswireHighlights } from "../app/lib/homepage-curation.mjs";

test("pickNewswireHighlights keeps only usable stories and respects the limit", () => {
  const stories = [
    { title: "", url: "https://example.com/skip-1" },
    { title: "Wire One", url: "https://example.com/1" },
    { title: "Wire Two", url: "https://example.com/2" },
    { title: "Wire Three", url: "https://example.com/3" },
    { title: "Wire Four", url: "https://example.com/4" },
    { title: "Wire Five", url: "https://example.com/5" },
  ];

  const picks = pickNewswireHighlights(stories, 3);

  assert.deepEqual(
    picks.map((story) => story.title),
    ["Wire One", "Wire Two", "Wire Three"],
  );
});
