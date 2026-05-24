"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutGrid,
  MessageCircleQuestion,
  Network,
  BarChart3,
  FolderOpen,
  ShoppingBag,
  Users,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/classmap/auth";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const ITEMS: readonly NavItem[] = [
  { href: "/classmap/today", label: "Today", Icon: CalendarDays },
  { href: "/classmap/week", label: "Week", Icon: LayoutGrid },
  // Tutor links to /classmap/coach when there's no active task; the page
  // itself handles the redirect. We expose Tutor as a top-level entry here.
  { href: "/classmap/tutor", label: "Tutor", Icon: MessageCircleQuestion },
  { href: "/classmap/coach", label: "Coach", Icon: Network },
  { href: "/classmap/progress", label: "Progress", Icon: BarChart3 },
  { href: "/classmap/portfolio", label: "Portfolio", Icon: FolderOpen },
  { href: "/classmap/market", label: "Market", Icon: ShoppingBag },
  { href: "/classmap/connect", label: "Connect", Icon: Network },
  { href: "/classmap/family", label: "Family", Icon: Users },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  return pathname.startsWith(href + "/");
}

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    try {
      signOut();
    } finally {
      router.replace("/classmap/login");
    }
  };

  return (
    <nav
      data-slot="side-nav"
      aria-label="Primary"
      className="hidden md:flex flex-col gap-1 p-4 border-r border-[color:var(--rule)] bg-[color:var(--paper-deep)] sticky top-0 h-dvh overflow-y-auto"
    >
      {/* Brand kicker */}
      <div className="px-3 pt-2 pb-4">
        <p className="kicker kicker--accent">ClassMap · Vol. I</p>
      </div>

      <hr className="rule mx-3 mb-2 border-0 border-t border-[color:var(--rule)]" />

      <ul className="flex flex-col gap-0.5">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 h-11 px-3 rounded-[3px]",
                  "text-sm no-underline transition-colors",
                  active
                    ? "bg-[color:var(--paper)] text-[color:var(--accent-ink)] font-medium"
                    : "text-[color:var(--ink-soft)] hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]",
                ].join(" ")}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4">
        <hr className="rule mx-3 mb-2 border-0 border-t border-[color:var(--rule)]" />
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 h-11 px-3 rounded-[3px] text-sm text-[color:var(--ink-soft)] hover:bg-[color:var(--paper)] hover:text-[color:var(--accent-clay)] transition-colors"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
}
