import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { CreatorCard } from "@/components/creator-card";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { creators, categories } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reklama.uz — Book influencer advertising in minutes" },
      {
        name: "description",
        content:
          "Discover creators, compare advertising offers, choose a date, and book campaigns in minutes on Reklama.uz.",
      },
      { property: "og:title", content: "Reklama.uz — Find. Book. Promote." },
      {
        property: "og:description",
        content: "The marketplace where businesses book advertising from creators like a service.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [brief, setBrief] = useState("");

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
              <Sparkles className="h-3.5 w-3.5" /> AI Campaign Copilot
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Book the perfect influencer for your next campaign.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Discover creators, compare advertising offers, choose a date, and book campaigns in
              minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/discover">
                  Find a Creator <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/studio">Become a Creator</Link>
              </Button>
            </div>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
              {[
                ["10K+", "Creators"],
                ["50K+", "Campaigns"],
                ["95%", "Successful deliveries"],
              ].map(([v, l]) => (
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
                <Sparkles className="h-3.5 w-3.5" /> AI Campaign Copilot
              </span>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={3}
                placeholder="Tell us what you want to advertise…"
                className="mt-4 w-full resize-none rounded-2xl border border-input bg-background p-4 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Example: “Promote my sportswear brand to men aged 18–30 in Uzbekistan with a $1,500
                budget.”
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => navigate({ to: "/matches" })}>
                  <Sparkles className="mr-1 h-4 w-4" /> Find Matches
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/copilot">Open full copilot</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Example recommendation
              </p>
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
                    @{creators[0].username} <BadgeCheck className="h-4 w-4 text-primary" />
                  </p>
                  <p className="text-sm text-muted-foreground">Football • Lifestyle</p>
                </div>
                <span className="ml-auto rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  96% match
                </span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li>1.2M followers • 6.4% engagement</li>
                <li>82% audience in Uzbekistan</li>
                <li>Instagram Story — $400</li>
              </ul>
              <Button variant="outline" className="mt-5 w-full" asChild>
                <Link to="/creator/$username" params={{ username: "footballstar" }}>
                  View Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">Featured creators</h2>
            <p className="mt-2 text-muted-foreground">
              Verified public figures with bookable advertising inventory.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/discover">Browse all</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {creators.slice(0, 4).map((c) => (
            <CreatorCard key={c.username} creator={c} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold">Browse by category</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c}
                to="/discover"
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-accent-foreground"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            { icon: Search, t: "Discover", d: "Filter by category, audience, platform and budget." },
            { icon: Sparkles, t: "Match with AI", d: "Describe your campaign and get ranked creators." },
            { icon: CalendarDays, t: "Pick a date", d: "See real availability before you commit." },
            { icon: CreditCard, t: "Pay & track", d: "Secure checkout, then follow delivery status." },
          ].map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-xs font-semibold text-muted-foreground">STEP {i + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-border bg-foreground px-8 py-14 text-center text-background">
          <p className="inline-flex items-center gap-1.5 text-sm opacity-80">
            <Star className="h-4 w-4" /> 4.9 average creator rating
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Find. Book. Promote.</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-75">
            Stop negotiating in DMs. Buy advertising like a professional service.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/copilot">
                <Sparkles className="mr-1 h-4 w-4" /> Start with AI
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
              asChild
            >
              <Link to="/discover">Browse creators</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
