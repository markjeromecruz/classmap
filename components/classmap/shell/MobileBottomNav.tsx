"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutGrid,
  MessageCircleQuestion,
  BarChart3,
  Menu,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const ITEMS: readonly NavItem[] = [
  { href: "/classmap/today", label: "Today", Icon: CalendarDays },
  { href: "/classmap/week", label: "Week", Icon: LayoutGrid },
  { href: "/classmap/tutor", label: "Tutor", Icon: MessageCircleQuestion },
  { href: "/classmap/progress", label: "Progress", Icon: BarChart3 },
  { href: "/classmap/family", label: "More", Icon: Menu },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  return pathname.startsWith(href + "/");
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      data-slot="mobile-bottom-nav"
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 md:hidden bg-[color:var(--paper)] border-t border-[color:var(--rule)] z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center justify-center gap-1",
                  "flex-1 min-h-[56px] px-2 py-2",
                  "no-underline transition-colors",
                  active
                    ? "text-[color:var(--accent-ink)]"
                    : "text-[color:var(--ink-faded)] hover:text-[color:var(--ink-soft)]",
                ].join(" ")}
              >
                <Icon size={24} strokeWidth={active ? 2 : 1.5} />
                <span
                  className="font-sans"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
