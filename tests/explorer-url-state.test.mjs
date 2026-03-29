import test from "node:test";
import assert from "node:assert/strict";

import {
  parseMostPopularState,
  parseNewswireState,
  parseRssState,
  parseTopStoriesState,
  toMostPopularQuery,
  toNewswireQuery,
  toRssQuery,
  toTopStoriesQuery,
} from "../app/lib/explorer-url-state.mjs";

test("top stories query round-trips section", () => {
  assert.deepEqual(parseTopStoriesState("?section=world"), { section: "world" });
  assert.equal(toTopStoriesQuery({ section: "world" }), "?section=world");
});

test("most popular query round-trips type and period", () => {
  assert.deepEqual(parseMostPopularState("?type=shared&period=7"), { type: "shared", period: "7" });
  assert.equal(toMostPopularQuery({ type: "shared", period: "7" }), "?type=shared&period=7");
});

test("newswire query round-trips source section limit and offset", () => {
  assert.deepEqual(parseNewswireState("?source=nyt&section=world&limit=40&offset=80"), {
    source: "nyt",
    section: "world",
    limit: 40,
    offset: 80,
  });
  assert.equal(
    toNewswireQuery({ source: "nyt", section: "world", limit: 40, offset: 80 }),
    "?source=nyt&section=world&limit=40&offset=80",
  );
});

test("rss query round-trips section", () => {
  assert.deepEqual(parseRssState("?section=World"), { section: "World" });
  assert.equal(toRssQuery({ section: "World" }), "?section=World");
});
