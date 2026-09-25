import { Link } from "@tanstack/react-router";
import { Bell, Menu, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link to="/discover">
              <Search className="h-4.5 w-4.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative hidden sm:inline-flex"
            asChild
          >
            <Link to="/dashboard">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Link>
          </Button>
          <Button variant="ghost" className="hidden lg:inline-flex" asChild>
            <Link to="/studio">Become a Creator</Link>
          </Button>
          <Button variant="outline" className="hidden sm:inline-flex" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
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
