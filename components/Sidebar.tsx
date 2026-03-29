"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/app/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: "292px", minWidth: "292px" }}
      className="sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-white/10 bg-[#111827] text-white"
    >
      <div className="border-b border-white/10 px-6 pb-6 pt-8">
        <p className="text-[0.62rem] uppercase tracking-[0.32em] text-white/45">The New York Times</p>
        <p className="mt-2 font-serif text-[1.85rem] leading-none text-white">API Explorer</p>
        <p className="mt-3 max-w-[18rem] text-sm leading-6 text-white/60">
          A newsroom-style console for live feeds, archives, and search-driven reporting.
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group block rounded-2xl border px-4 py-4 transition-all ${
                active
                  ? "border-white/18 bg-white/10 text-white shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
                  : "border-white/0 text-white/68 hover:border-white/10 hover:bg-white/[0.04] hover:text-white/92"
              }`}
            >
              <p className={`text-[0.62rem] uppercase tracking-[0.24em] ${active ? "text-[#f87171]" : "text-white/35"}`}>
                {item.eyebrow}
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <span className="font-serif text-[1.35rem] leading-none">{item.shortLabel}</span>
                <span className={`text-sm ${active ? "text-white/75" : "text-white/30 group-hover:text-white/55"}`}>
                  Open
                </span>
              </div>
              <p className="mt-2 text-sm leading-5 text-white/55">{item.description}</p>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.24em] text-white/25">Desk note</p>
        <p className="mt-2 text-sm leading-6 text-white/42">
          Live data depends on your `NYT_API_KEY`. RSS remains available without one.
        </p>
      </div>
    </aside>
  );
}
