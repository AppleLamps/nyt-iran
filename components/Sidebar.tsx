"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    href: "/top-stories",
    label: "Top Stories",
    icon: "◈",
    desc: "Current section fronts",
  },
  {
    href: "/article-search",
    label: "Article Search",
    icon: "⌕",
    desc: "Search by keyword & filters",
  },
  {
    href: "/most-popular",
    label: "Most Popular",
    icon: "↑",
    desc: "Emailed, shared & viewed",
  },
  {
    href: "/newswire",
    label: "Newswire",
    icon: "⚡",
    desc: "Live wire feed",
  },
  {
    href: "/archive",
    label: "Archive",
    icon: "◻",
    desc: "Articles back to 1851",
  },
  {
    href: "/rss",
    label: "RSS Feeds",
    icon: "⊕",
    desc: "Section XML feeds",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: "220px", minWidth: "220px" }}
      className="flex flex-col bg-[#1a1a2e] text-white h-full overflow-y-auto"
    >
      {/* Masthead */}
      <div className="px-5 pt-7 pb-6 border-b border-white/10">
        <div
          className="text-white font-bold tracking-tight leading-none"
          style={{ fontFamily: "Georgia, serif", fontSize: "13px", letterSpacing: "0.12em" }}
        >
          THE NEW YORK TIMES
        </div>
        <div
          className="mt-1 text-white/40"
          style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          API Explorer
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon, desc }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <span
                className={`text-lg leading-none mt-0.5 flex-shrink-0 ${
                  active ? "text-red-400" : "text-white/30 group-hover:text-white/50"
                }`}
              >
                {icon}
              </span>
              <div>
                <div
                  className="font-semibold leading-none"
                  style={{ fontSize: "13px" }}
                >
                  {label}
                </div>
                <div
                  className="mt-1 leading-none text-white/40"
                  style={{ fontSize: "11px" }}
                >
                  {desc}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="text-white/25" style={{ fontSize: "10px", lineHeight: "1.4" }}>
          Data via NYT APIs
          <br />
          © The New York Times
        </div>
      </div>
    </aside>
  );
}
