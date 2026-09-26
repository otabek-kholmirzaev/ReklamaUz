import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronDown, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { creators, type Creator } from "@/lib/data";
import { matches as t } from "@/lib/i18n/matches";
import { CATEGORY_LABELS, translateEnum } from "@/lib/i18n/enums";

export const Route = createFileRoute("/matches")({
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
  component: Matches,
});

function Matches() {
  const ranked = [...creators].sort((a, b) => b.matchScore - a.matchScore);
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <span className="ai-chip">
          <Sparkles className="h-3.5 w-3.5" /> {t.aiMatch}
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold">
          {t.heading}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.intro}</p>

        <div className="mt-8 space-y-5">
          {ranked.map((c) => (
            <MatchRow key={c.username} creator={c} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function MatchRow({ creator }: { creator: Creator }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        <img
          src={creator.photo}
          alt={creator.name}
          loading="lazy"
          width={768}
          height={960}
          className="h-40 w-full rounded-2xl object-cover sm:h-36 sm:w-32"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold">
              @{creator.username}
            </h2>
            {creator.verified && (
              <BadgeCheck className="h-5 w-5 text-primary" />
            )}
            <span className="text-muted-foreground">{creator.name}</span>
            <span className="ml-auto rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
              {t.aiMatchBadge(creator.matchScore)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {creator.tags
              .map((tag) => translateEnum(CATEGORY_LABELS, tag))
              .join(" • ")}
          </p>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
            <Stat label={t.followers} value={creator.followers} />
            <Stat label={t.avgViews} value={creator.avgViews} />
            <Stat label={t.engagement} value={creator.engagement} />
            <Stat
              label={t.audience}
              value={`${creator.audience.age} • ${creator.audience.gender}`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {creator.services.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-border px-3 py-1 text-sm"
              >
                {s.name} — <strong>${s.price}</strong>
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link
                to="/creator/$username"
                params={{ username: creator.username }}
              >
                {t.viewProfile}
              </Link>
            </Button>
            <Button variant="outline">{t.compare}</Button>
            <span className="text-sm text-muted-foreground">
              {creator.availability}
            </span>
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-accent-foreground"
            >
              <Sparkles className="h-4 w-4" /> {t.whyMatches}
              <ChevronDown
                className={
                  "h-4 w-4 transition-transform " + (open ? "rotate-180" : "")
                }
              />
            </button>
          </div>

          {open && (
            <ul className="mt-4 space-y-2 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
              {creator.matchReasons.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
