export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  eyebrow: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Front Page",
    shortLabel: "Home",
    description: "Live briefing and guided entry points",
    eyebrow: "Editor’s desk",
  },
  {
    href: "/top-stories",
    label: "Top Stories",
    shortLabel: "Top Stories",
    description: "Current section fronts",
    eyebrow: "Live report",
  },
  {
    href: "/article-search",
    label: "Article Search",
    shortLabel: "Search",
    description: "Search by keyword, filters, and dates",
    eyebrow: "Research",
  },
  {
    href: "/most-popular",
    label: "Most Popular",
    shortLabel: "Popular",
    description: "Viewed, shared, and emailed articles",
    eyebrow: "Audience signal",
  },
  {
    href: "/newswire",
    label: "Newswire",
    shortLabel: "Wire",
    description: "Live publishing feed",
    eyebrow: "Live wire",
  },
  {
    href: "/archive",
    label: "Archive",
    shortLabel: "Archive",
    description: "Monthly article history back to 1851",
    eyebrow: "Deep archive",
  },
  {
    href: "/rss",
    label: "RSS Feeds",
    shortLabel: "RSS",
    description: "Section feeds with no API key required",
    eyebrow: "Open feed",
  },
];
