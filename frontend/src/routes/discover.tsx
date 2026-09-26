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
import { discover as t } from "@/lib/i18n/discover";
import { CATEGORY_LABELS, translateEnum } from "@/lib/i18n/enums";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: t.pageTitle },
      {
        name: "description",
        content: t.pageDescription,
      },
      { property: "og:title", content: t.pageTitle },
      {
        property: "og:description",
        content: t.ogDescription,
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
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [followerBands, setFollowerBands] = useState<string[]>([]);
  const [availableOn, setAvailableOn] = useState("");

  const toggle = (
    value: string,
    values: string[],
    setValues: (values: string[]) => void,
  ) => {
    setValues(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  };

  const results = useMemo(
    () =>
      creators.filter((c) => {
        const from = Math.min(...c.services.map((s) => s.price));
        const q = query.trim().toLowerCase();
        const matchesFollowerBand =
          followerBands.length === 0 ||
          followerBands.some((band) =>
            band === "100K – 500K"
              ? c.followersNum >= 100000 && c.followersNum < 500000
              : band === "500K – 1M"
                ? c.followersNum >= 500000 && c.followersNum < 1000000
                : c.followersNum >= 1000000,
          );
        const hasAvailableService = c.services.some(
          (service) =>
            (!service.limit || service.limit.used < service.limit.max) &&
            !c.unavailableDates.includes(availableOn) &&
            !(service.bookedDates ?? []).includes(availableOn),
        );

        return (
          (!q ||
            c.username.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.tags.some((tag) => tag.toLowerCase().includes(q)) ||
            c.platforms.some((platform) =>
              platform.toLowerCase().includes(q),
            ) ||
            c.audience.country.toLowerCase().includes(q)) &&
          (!cat || c.category === cat) &&
          from <= maxPrice &&
          (!verifiedOnly || c.verified) &&
          (platforms.length === 0 ||
            platforms.some((platform) => c.platforms.includes(platform))) &&
          matchesFollowerBand &&
          (!availableOn || hasAvailableService)
        );
      }),
    [query, cat, maxPrice, verifiedOnly, platforms, followerBands, availableOn],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl font-extrabold">{t.heading}</h1>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-12 rounded-xl pl-10"
            />
          </div>
          <Button size="lg" variant="outline" asChild>
            <Link to="/copilot">
              <Sparkles className="mr-1 h-4 w-4" /> {t.tryCopilot}
            </Link>
          </Button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <FilterChip
            active={!cat}
            onClick={() => setCat(null)}
            label={t.all}
          />
          {categories.map((c) => (
            <FilterChip
              key={c}
              active={cat === c}
              onClick={() => setCat(c)}
              label={translateEnum(CATEGORY_LABELS, c)}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-soft lg:sticky lg:top-24 lg:h-fit">
            <div>
              <Label className="text-sm font-semibold">{t.startingPrice}</Label>
              <Slider
                className="mt-4"
                value={[maxPrice]}
                min={100}
                max={1000}
                step={50}
                onValueChange={(v) => setMaxPrice(v[0])}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {t.upTo(maxPrice)}
              </p>
            </div>
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">{t.platform}</Label>
              {["Instagram", "Telegram", "TikTok", "YouTube"].map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Checkbox
                    checked={platforms.includes(p)}
                    onCheckedChange={() => toggle(p, platforms, setPlatforms)}
                  />{" "}
                  {p}
                </label>
              ))}
            </div>
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">{t.followers}</Label>
              {["100K – 500K", "500K – 1M", "1M+"].map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Checkbox
                    checked={followerBands.includes(p)}
                    onCheckedChange={() =>
                      toggle(p, followerBands, setFollowerBands)
                    }
                  />{" "}
                  {p}
                </label>
              ))}
            </div>
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">{t.availability}</Label>
              <Input
                type="date"
                value={availableOn}
                onChange={(event) => setAvailableOn(event.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={verifiedOnly}
                onCheckedChange={(v) => setVerifiedOnly(Boolean(v))}
              />
              {t.verifiedOnly}
            </label>
          </aside>

          <section>
            <p className="text-sm text-muted-foreground">
              {t.creatorsAvailable(results.length)}
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((c) => (
                <CreatorCard key={c.username} creator={c} />
              ))}
            </div>
            {results.length === 0 && (
              <p className="mt-16 text-center text-muted-foreground">
                {t.noResults}
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
