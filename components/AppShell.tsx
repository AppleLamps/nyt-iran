"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/app/lib/navigation";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeItem = NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`),
  );

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] lg:flex">
      <div className="hidden lg:block lg:shrink-0">
        <Sidebar />
      </div>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-black/10 bg-[rgba(247,244,237,0.92)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-black/45">NYT API Explorer</p>
              <p className="font-serif text-lg text-[var(--color-ink-strong)]">
                {activeItem?.label ?? "Front Page"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-site-nav"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-sm"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
          {menuOpen && (
            <nav
              id="mobile-site-nav"
              className="border-t border-black/10 bg-[#111827] px-4 py-4 text-white sm:px-6"
            >
              <div className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-2xl border px-4 py-3 transition-colors ${
                        active
                          ? "border-white/20 bg-white/10"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">{item.eyebrow}</p>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <span className="font-serif text-lg">{item.label}</span>
                        <span className="text-sm text-white/45">Open</span>
                      </div>
                      <p className="mt-1 text-sm text-white/65">{item.description}</p>
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
