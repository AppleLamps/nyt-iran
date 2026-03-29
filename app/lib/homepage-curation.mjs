export function pickNewswireHighlights(stories, limit = 4) {
  return stories
    .filter((story) => typeof story?.title === "string" && story.title.trim().length > 0)
    .slice(0, limit);
}
