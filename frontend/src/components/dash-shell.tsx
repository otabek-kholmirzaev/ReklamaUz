import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/site-nav";
import { dashboard as t } from "@/lib/i18n/dashboard";

export type NavItem = { label: string; to: string; active?: boolean };

export function DashShell({
  items,
  children,
}: {
  items: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex">
          <Logo />
          <nav className="mt-8 flex flex-col gap-0.5">
            {items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                  (item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/"
            className="mt-auto rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← {t.backToSite}
          </Link>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-10">
          <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
            <Logo />
          </div>
          <div className="px-4 py-6 sm:px-8 sm:py-10">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background lg:hidden">
        {items.slice(0, 4).map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={
              "flex-1 truncate px-2 py-3 text-center text-xs font-medium " +
              (item.active ? "text-primary" : "text-muted-foreground")
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
