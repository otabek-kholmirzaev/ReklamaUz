import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Sparkles, Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { CreatorCard } from "@/components/creator-card";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { home as t } from "@/lib/i18n/home";
import { creators } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: t.meta.title },
      {
        name: "description",
        content: t.meta.description,
      },
      { property: "og:title", content: t.meta.ogTitle },
      {
        property: "og:description",
        content: t.meta.ogDescription,
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroBg}
          alt=""
          width={1920}
          height={1088}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <span className="ai-chip">
              <Sparkles className="h-3.5 w-3.5" /> {t.aiCopilotBadge}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/discover">
                  {t.findCreator} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/studio">{t.becomeCreator}</Link>
              </Button>
            </div>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
              {t.stats.map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-bold">{v}</dt>
                  <dd className="text-sm text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-lift">
              <span className="ai-chip">
                <Sparkles className="h-3.5 w-3.5" /> {t.aiCopilotBadge}
              </span>
              <div className="mt-4 w-full rounded-2xl border border-input bg-background p-4 text-base text-muted-foreground">
                {t.copilotExamplePrompt}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/copilot">
                    <Sparkles className="mr-1 h-4 w-4" /> {t.openFullCopilot}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.exampleRecommendation}
              </p>
              <Link
                to="/creator/$username"
                params={{ username: "footballstar" }}
                className="block rounded-2xl outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t.viewSardorProfile}
              >
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={creators[0].photo}
                    alt={creators[0].name}
                    loading="lazy"
                    width={768}
                    height={960}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="flex items-center gap-1.5 font-semibold">
                      @{creators[0].username}{" "}
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.footballLifestyle}
                    </p>
                  </div>
                  <span className="ml-auto rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t.matchPercent}
                  </span>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <li>{t.followersEngagement}</li>
                  <li>{t.audienceUzbekistan}</li>
                  <li>{t.instagramStoryPrice}</li>
                </ul>
              </Link>
              <Button variant="outline" className="mt-5 w-full" asChild>
                <Link
                  to="/creator/$username"
                  params={{ username: "footballstar" }}
                >
                  {t.viewProfile}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">
              {t.featuredCreators.heading}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t.featuredCreators.subheading}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/discover">{t.browseAll}</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {creators.slice(0, 4).map((c) => (
            <CreatorCard key={c.username} creator={c} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-border bg-foreground px-8 py-14 text-center text-background">
          <p className="inline-flex items-center gap-1.5 text-sm opacity-80">
            <Star className="h-4 w-4" /> {t.ratingBadge}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            {t.ctaHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-75">{t.ctaSubtitle}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/copilot">
                <Sparkles className="mr-1 h-4 w-4" /> {t.startWithAI}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
              asChild
            >
              <Link to="/discover">{t.browseCreators}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
