import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CreatorCard } from "@/components/creator-card";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { categories, creators } from "@/lib/data";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Creators — ReklamaBazar" },
      {
        name: "description",
        content:
          "Browse verified creators by category, platform, audience, price and availability, then book advertising directly.",
      },
      { property: "og:title", content: "Discover Creators — ReklamaBazar" },
      {
        property: "og:description",
        content: "Filter creators by audience, price and availability and book in minutes.",
      },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const results = useMemo(
    () =>
      creators.filter((c) => {
        const from = Math.min(...c.services.map((s) => s.price));
        const q = query.trim().toLowerCase();
        return (
          (!q ||
            c.username.includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)) &&
          (!cat || c.category === cat) &&
          from <= maxPrice &&
          (!verifiedOnly || c.verified)
        );
      }),
    [query, cat, maxPrice, verifiedOnly],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl font-extrabold">Discover Creators</h1>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators, categories, or audiences…"
              className="h-12 rounded-xl pl-10"
            />
          </div>
          <Button size="lg" variant="outline" asChild>
            <Link to="/copilot">
              <Sparkles className="mr-1 h-4 w-4" /> Try describing your campaign instead
            </Link>
          </Button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <FilterChip active={!cat} onClick={() => setCat(null)} label="All" />
          {categories.map((c) => (
            <FilterChip key={c} active={cat === c} onClick={() => setCat(c)} label={c} />
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-soft lg:sticky lg:top-24 lg:h-fit">
            <div>
              <Label className="text-sm font-semibold">Starting price</Label>
              <Slider
                className="mt-4"
                value={[maxPrice]}
                min={100}
                max={1000}
                step={50}
                onValueChange={(v) => setMaxPrice(v[0])}
              />
              <p className="mt-2 text-sm text-muted-foreground">Up to ${maxPrice}</p>
            </div>
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">Platform</Label>
              {["Instagram", "Telegram", "TikTok", "YouTube"].map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox /> {p}
                </label>
              ))}
            </div>
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">Followers</Label>
              {["100K – 500K", "500K – 1M", "1M+"].map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox /> {p}
                </label>
              ))}
            </div>
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">Availability</Label>
              <Input type="date" defaultValue="2026-10-05" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={verifiedOnly}
                onCheckedChange={(v) => setVerifiedOnly(Boolean(v))}
              />
              Verified only
            </label>
          </aside>

          <section>
            <p className="text-sm text-muted-foreground">{results.length} creators available</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((c) => (
                <CreatorCard key={c.username} creator={c} />
              ))}
            </div>
            {results.length === 0 && (
              <p className="mt-16 text-center text-muted-foreground">
                No creators match these filters yet.
              </p>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}
