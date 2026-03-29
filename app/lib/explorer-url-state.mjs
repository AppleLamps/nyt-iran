function normalizeSearch(search) {
  if (!search) return new URLSearchParams();
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

function toQuery(params) {
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function parseTopStoriesState(search) {
  const params = normalizeSearch(search);
  return {
    section: params.get("section") || "home",
  };
}

export function toTopStoriesQuery(state) {
  const params = new URLSearchParams();
  if (state.section && state.section !== "home") params.set("section", state.section);
  return toQuery(params);
}

export function parseMostPopularState(search) {
  const params = normalizeSearch(search);
  return {
    type: params.get("type") || "viewed",
    period: params.get("period") || "1",
  };
}

export function toMostPopularQuery(state) {
  const params = new URLSearchParams();
  if (state.type && state.type !== "viewed") params.set("type", state.type);
  if (state.period && state.period !== "1") params.set("period", state.period);
  return toQuery(params);
}

export function parseNewswireState(search) {
  const params = normalizeSearch(search);
  return {
    source: params.get("source") || "all",
    section: params.get("section") || "all",
    limit: Number(params.get("limit") || "20"),
    offset: Number(params.get("offset") || "0"),
  };
}

export function toNewswireQuery(state) {
  const params = new URLSearchParams();
  if (state.source && state.source !== "all") params.set("source", state.source);
  if (state.section && state.section !== "all") params.set("section", state.section);
  if (state.limit && state.limit !== 20) params.set("limit", String(state.limit));
  if (state.offset) params.set("offset", String(state.offset));
  return toQuery(params);
}

export function parseRssState(search) {
  const params = normalizeSearch(search);
  return {
    section: params.get("section") || "HomePage",
  };
}

export function toRssQuery(state) {
  const params = new URLSearchParams();
  if (state.section && state.section !== "HomePage") params.set("section", state.section);
  return toQuery(params);
}
