import test from "node:test";
import assert from "node:assert/strict";

import {
  ARTICLE_SEARCH_PAGE_SIZE,
  NYT_ARTICLES_PER_PAGE,
  getArticleSearchWindow,
  mergeArticleSearchDocs,
} from "../app/lib/article-search-pagination.mjs";

test("page size is 25 while NYT upstream stays at 10", () => {
  assert.equal(ARTICLE_SEARCH_PAGE_SIZE, 25);
  assert.equal(NYT_ARTICLES_PER_PAGE, 10);
});

test("first virtual page fetches enough upstream pages", () => {
  assert.deepEqual(getArticleSearchWindow(0), {
    requestedPage: 0,
    pageSize: 25,
    startOffset: 0,
    startUpstreamPage: 0,
    endUpstreamPage: 2,
    upstreamPages: [0, 1, 2],
    sliceStart: 0,
    sliceEnd: 25,
  });
});

test("second virtual page carries the partial overlap correctly", () => {
  assert.deepEqual(getArticleSearchWindow(1), {
    requestedPage: 1,
    pageSize: 25,
    startOffset: 25,
    startUpstreamPage: 2,
    endUpstreamPage: 4,
    upstreamPages: [2, 3, 4],
    sliceStart: 5,
    sliceEnd: 30,
  });
});

test("mergeArticleSearchDocs slices merged upstream docs down to one 25-item page", () => {
  const docs = Array.from({ length: 30 }, (_, index) => ({ id: index + 1 }));

  const merged = mergeArticleSearchDocs(docs, getArticleSearchWindow(1));

  assert.equal(merged.length, 25);
  assert.equal(merged[0].id, 6);
  assert.equal(merged.at(-1).id, 30);
});
