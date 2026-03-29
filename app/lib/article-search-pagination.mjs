export const NYT_ARTICLES_PER_PAGE = 10;
export const ARTICLE_SEARCH_PAGE_SIZE = 25;
export const NYT_SEARCH_MAX_PAGES = 100;
export const NYT_SEARCH_MAX_ARTICLES = NYT_SEARCH_MAX_PAGES * NYT_ARTICLES_PER_PAGE;

export function getArticleSearchWindow(requestedPage, pageSize = ARTICLE_SEARCH_PAGE_SIZE) {
  const safePage = Math.max(0, Number(requestedPage) || 0);
  const startOffset = safePage * pageSize;
  const startUpstreamPage = Math.floor(startOffset / NYT_ARTICLES_PER_PAGE);
  const endUpstreamPage = Math.min(
    NYT_SEARCH_MAX_PAGES - 1,
    Math.ceil((startOffset + pageSize) / NYT_ARTICLES_PER_PAGE) - 1,
  );
  const upstreamPages = [];

  for (let page = startUpstreamPage; page <= endUpstreamPage; page += 1) {
    upstreamPages.push(page);
  }

  return {
    requestedPage: safePage,
    pageSize,
    startOffset,
    startUpstreamPage,
    endUpstreamPage,
    upstreamPages,
    sliceStart: startOffset - startUpstreamPage * NYT_ARTICLES_PER_PAGE,
    sliceEnd: startOffset - startUpstreamPage * NYT_ARTICLES_PER_PAGE + pageSize,
  };
}

export function mergeArticleSearchDocs(docs, windowSpec) {
  return docs.slice(windowSpec.sliceStart, windowSpec.sliceEnd);
}
