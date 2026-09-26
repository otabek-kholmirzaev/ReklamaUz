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
import { howItWorks as t } from "@/lib/i18n/howItWorks";

export const Route = createFileRoute("/how-it-works")({
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
  component: HowItWorks,
});

const brandSteps = [
  { icon: Search, ...t.brandSteps[0] },
  { icon: Sparkles, ...t.brandSteps[1] },
  { icon: CalendarDays, ...t.brandSteps[2] },
  { icon: CreditCard, ...t.brandSteps[3] },
];

const creatorSteps = [
  { icon: UserPlus, ...t.creatorSteps[0] },
  { icon: PackageCheck, ...t.creatorSteps[1] },
  { icon: ClipboardList, ...t.creatorSteps[2] },
  { icon: Banknote, ...t.creatorSteps[3] },
];

const faqs = t.faqs;

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="ai-chip">
            <Sparkles className="h-3.5 w-3.5" /> {t.badge}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold sm:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/discover">{t.findCreator}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/studio">{t.becomeCreator}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold">
          {t.forBrands.heading}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {t.forBrands.subheading}
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {brandSteps.map((s, i) => (
            <div
              key={s.t}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-xs font-semibold text-muted-foreground">
                {t.stepLabel} {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold">
            {t.forCreators.heading}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t.forCreators.subheading}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {creatorSteps.map((s, i) => (
              <div
                key={s.t}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-4 text-xs font-semibold text-muted-foreground">
                  {t.stepLabel} {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold">{t.faqHeading}</h2>
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
            <Star className="h-4 w-4" /> {t.ratingBadge}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            {t.ctaHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-75">{t.ctaSubtitle}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/discover">{t.findCreator}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
              asChild
            >
              <Link to="/studio">{t.becomeCreator}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
