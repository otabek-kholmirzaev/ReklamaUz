import { Link } from "@tanstack/react-router";
import { Bell, BellDot, CalendarClock, Menu, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  type AppNotification,
  getNotifications,
  NOTIFICATIONS_EVENT,
  saveNotifications,
} from "@/lib/notifications";

const links = [
  { to: "/", label: "Homepage" },
  { to: "/discover", label: "Creators" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground">
        R
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Reklama.uz
      </span>
    </Link>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="mt-10 flex flex-col gap-1">
                {links.map((l, i) => (
                  <Link
                    key={i}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/copilot"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-muted"
                >
                  AI Campaign Copilot
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Dashboard
                </Link>
                <Link
                  to="/studio"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Creator Studio
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l, i) => (
            <Link
              key={i}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/copilot"
            className="ml-1 rounded-lg px-3 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI Copilot
            </span>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
          <Button variant="ghost" className="hidden lg:inline-flex" asChild>
            <Link to="/studio">Become a Creator</Link>
          </Button>
          <Button variant="outline" className="hidden sm:inline-flex" asChild>
            <Link to="/auth" search={{ mode: "login" }}>
              Log in
            </Link>
          </Button>
          <Button asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Sign up
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function formatNotifDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = () => setNotifications(getNotifications());
    load();
    window.addEventListener(NOTIFICATIONS_EVENT, load);
    return () => window.removeEventListener(NOTIFICATIONS_EVENT, load);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unreadCount > 0) {
      const updated = notifications.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      setNotifications(updated);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative hidden sm:inline-flex"
        >
          {unreadCount > 0 ? (
            <BellDot className="h-4.5 w-4.5" />
          ) : (
            <Bell className="h-4.5 w-4.5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="font-display font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">Upcoming booking reminders</p>
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
            <Bell className="h-7 w-7 opacity-30" />
            <p>No notifications yet.</p>
            <p className="text-xs">Reminders appear here after you book an ad.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li key={n.id} className="flex gap-3 px-4 py-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <CalendarClock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">
                    {n.reminderDaysBefore === 3
                      ? "3-day reminder"
                      : "1-day reminder"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    @{n.creatorUsername} · {n.serviceName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ad on{" "}
                    <span className="font-medium text-foreground">
                      {formatNotifDate(n.bookingDate)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reminder fires:{" "}
                    <span className="font-medium text-foreground">
                      {formatNotifDate(n.scheduledFor)}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">Find. Book. Promote.</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <Link to="/discover" className="hover:text-foreground">
            Discover creators
          </Link>
          <Link to="/copilot" className="hover:text-foreground">
            AI Campaign Copilot
          </Link>
          <Link to="/how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link to="/studio" className="hover:text-foreground">
            For creators
          </Link>
        </div>
      </div>
    </footer>
  );
}
