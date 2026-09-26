import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Banknote,
  CalendarDays,
  ClipboardList,
  CreditCard,
  PackageCheck,
  Search,
  Sparkles,
  Star,
  UserPlus,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it Works — Reklama.uz" },
      {
        name: "description",
        content:
          "How businesses book creator advertising and how creators get booked on Reklama.uz — from discovery to payment.",
      },
      { property: "og:title", content: "How it Works — Reklama.uz" },
      {
        property: "og:description",
        content:
          "The step-by-step process for booking and getting booked on Reklama.uz.",
      },
    ],
  }),
  component: HowItWorks,
});

const brandSteps = [
  {
    icon: Search,
    t: "Discover",
    d: "Filter by category, audience, platform and budget, or describe your campaign in plain language and let AI shortlist creators for you.",
  },
  {
    icon: Sparkles,
    t: "Match with AI",
    d: "Get ranked recommendations scored against your budget, audience overlap, and campaign dates.",
  },
  {
    icon: CalendarDays,
    t: "Pick a date",
    d: "See each creator's real availability and package limits before you commit — no back-and-forth in DMs.",
  },
  {
    icon: CreditCard,
    t: "Pay & track",
    d: "Secure checkout, then follow delivery status from confirmation through to publish.",
  },
];

const creatorSteps = [
  {
    icon: UserPlus,
    t: "Create your profile",
    d: "Showcase your platforms, audience insights, and past campaigns in a few minutes.",
  },
  {
    icon: PackageCheck,
    t: "Set your packages",
    d: "List formats — Stories, Posts, Reels — with pricing and monthly limits per format.",
  },
  {
    icon: ClipboardList,
    t: "Get booked",
    d: "Businesses choose an available date and a listed service straight from your calendar. You simply confirm the request.",
  },
  {
    icon: Banknote,
    t: "Get paid",
    d: "Payment is secured up front and released to you once the campaign is delivered and confirmed.",
  },
];

const faqs = [
  {
    q: "How much does it cost to join as a creator?",
    a: "Creating a profile is free. Reklama.uz only takes a small service fee once you complete a paid campaign.",
  },
  {
    q: "How do payments work?",
    a: "Businesses pay upfront when they book. Funds are held securely and released to the creator once delivery is confirmed.",
  },
  {
    q: "What can a business book?",
    a: "Every creator lists clear, fixed services such as Stories, Posts and Reels. Each service shows its price, monthly capacity and open publishing dates before a request is sent.",
  },
  {
    q: "What if a creator is fully booked?",
    a: "Each package shows real-time availability and monthly limits, so you'll only ever see formats and dates that are actually open.",
  },
  {
    q: "Is there a fee for businesses?",
    a: "The price shown on a package is what you pay — no hidden markups at checkout.",
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="ai-chip">
            <Sparkles className="h-3.5 w-3.5" /> How it works
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold sm:text-5xl">
            Book creator advertising like a professional service
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            No DMs, no guesswork. Compare offers, check real availability, and
            pay securely — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/discover">Find a Creator</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/studio">Become a Creator</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold">For brands</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          From brief to booked in four steps.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {brandSteps.map((s, i) => (
            <div
              key={s.t}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-xs font-semibold text-muted-foreground">
                STEP {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold">For creators</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Turn your following into bookable advertising inventory.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {creatorSteps.map((s, i) => (
              <div
                key={s.t}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-4 text-xs font-semibold text-muted-foreground">
                  STEP {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-border bg-foreground px-8 py-14 text-center text-background">
          <p className="inline-flex items-center gap-1.5 text-sm opacity-80">
            <Star className="h-4 w-4" /> 4.9 average creator rating
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-75">
            Whether you're booking your first campaign or listing your first
            package, it takes minutes to get moving.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/discover">Find a Creator</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
              asChild
            >
              <Link to="/studio">Become a Creator</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
