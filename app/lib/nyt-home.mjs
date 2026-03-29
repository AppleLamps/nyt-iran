export function pickLeadStory(articles) {
  return articles.find((article) => {
    const title = article?.title ?? article?.headline?.main;
    return typeof title === "string" && title.trim().length > 0;
  }) ?? null;
}

export function pickSupportingStories(articles, leadStory, limit = 4) {
  return articles
    .filter((article) => article && article !== leadStory)
    .slice(0, limit);
}

export function buildSearchPresets() {
  return [
    {
      label: "Iran coverage",
      description: "Jump into recent NYT reporting on Iran with live search controls.",
      href: "/article-search?q=Iran&sort=newest",
    },
    {
      label: "Nuclear program",
      description: "Focus on diplomatic and security coverage tied to Iran’s nuclear program.",
      href: "/article-search?q=Iran&fq=subject.contains:%22nuclear%20weapons%22&sort=newest",
    },
    {
      label: "Foreign desk",
      description: "Start with an NYT foreign-desk filter and refine from there.",
      href: "/article-search?fq=news_desk:%28%22Foreign%22%29&sort=newest",
    },
  ];
}
