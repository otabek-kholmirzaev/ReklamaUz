import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  Instagram,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Creator Studio — Reklama.uz" },
      {
        name: "description",
        content:
          "Set up your creator profile, services, availability and payouts on Reklama.uz.",
      },
    ],
  }),
  component: CreatorStudio,
});

const initialServices = [
  {
    id: "story",
    name: "Instagram Story",
    price: "350",
    capacity: "15",
    from: "10:00",
    to: "18:00",
  },
  {
    id: "feed-post",
    name: "Instagram Feed Post",
    price: "650",
    capacity: "8",
    from: "10:00",
    to: "18:00",
  },
];

function CreatorStudio() {
  const [imported, setImported] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [services, setServices] = useState(initialServices);
  const [photoName, setPhotoName] = useState("");

  const updateService = (
    index: number,
    field: keyof (typeof initialServices)[number],
    value: string,
  ) => {
    setServices((current) =>
      current.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [field]: value } : service,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl">
          <span className="ai-chip">
            <Sparkles className="h-3.5 w-3.5" /> Creator Studio
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">
            Turn your audience into bookable inventory.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Complete your public profile, import the Instagram insights you want
            to share, and set the services brands can request.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden rounded-3xl border border-border bg-surface p-4 lg:block lg:sticky lg:top-24 lg:h-fit">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Profile setup
            </p>
            <ol className="mt-3 space-y-1">
              {[
                ["1", "Account & contact"],
                ["2", "Instagram insights"],
                ["3", "Services & capacity"],
                ["4", "Agreement"],
              ].map(([number, label]) => (
                <li
                  key={number}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                    {number}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </aside>

          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (agreed) setSubmitted(true);
            }}
          >
            <SetupCard
              icon={UserRound}
              eyebrow="1. Account & contact"
              title="Tell brands who they’re booking"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Profile picture">
                  <label className="flex min-h-24 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-surface px-4 py-3 transition-colors hover:border-primary hover:bg-accent/30">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary shadow-soft">
                      <ImagePlus className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {photoName || "Upload a profile picture"}
                      </span>
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        JPG, PNG or WebP · 4:5 works best
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) =>
                        setPhotoName(event.target.files?.[0]?.name ?? "")
                      }
                    />
                  </label>
                </Field>
                <Field label="Full name">
                  <Input defaultValue="Nilufar Ahmedova" required />
                </Field>
                <Field label="Creator category">
                  <Input defaultValue="Fitness & Wellness" required />
                </Field>
                <Field label="Email address">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      defaultValue="nilufar@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </Field>
                <Field label="Phone number">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      defaultValue="+998 90 123 45 67"
                      className="pl-10"
                      required
                    />
                  </div>
                </Field>
                <Field label="City">
                  <Input defaultValue="Tashkent, Uzbekistan" required />
                </Field>
                <Field label="Public profile handle">
                  <Input defaultValue="@fitblogger" required />
                </Field>
              </div>
              <Field label="Short bio">
                <textarea
                  rows={3}
                  defaultValue="Coach and fitness creator. Programs, gym culture and honest gear reviews."
                  className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                />
              </Field>
            </SetupCard>

            <SetupCard
              icon={Instagram}
              eyebrow="2. Instagram insights"
              title="Import the audience data brands care about"
            >
              <div className="rounded-2xl border border-dashed border-primary/40 bg-accent/40 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      Connect an Instagram professional account
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Import followers, reach, impressions, engagement, profile
                      activity, audience demographics, and content performance.
                    </p>
                  </div>
                  <Button type="button" onClick={() => setImported(true)}>
                    {imported ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mock data
                        imported
                      </>
                    ) : (
                      <>
                        <Instagram className="mr-2 h-4 w-4" /> Import from
                        Instagram
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {imported && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["Followers", "620K"],
                    ["Reach", "348K"],
                    ["Impressions", "821K"],
                    ["Engagement", "7.1%"],
                    ["Profile activity", "12.8K"],
                  ].map(([label, value]) => (
                    <Metric key={label} label={label} value={value} />
                  ))}
                </div>
              )}
              {!imported && (
                <p className="mt-4 text-sm text-muted-foreground">
                  For now, use the import action to preview mock data. OAuth
                  connection and API permissions will be connected separately.
                </p>
              )}
            </SetupCard>

            <SetupCard
              icon={CalendarClock}
              eyebrow="3. Services, pricing & availability"
              title="Make your offers clear and bookable"
            >
              <p className="text-sm text-muted-foreground">
                Set a fixed price, monthly capacity and publishing window for
                each service. Brands will only see open capacity.
              </p>
              <div className="mt-5 space-y-4">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
                      <Field label="Service">
                        <Input
                          value={service.name}
                          placeholder="e.g. Instagram Reel"
                          onChange={(event) =>
                            updateService(index, "name", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="Price (USD)">
                        <Input
                          type="number"
                          min="0"
                          value={service.price}
                          onChange={(event) =>
                            updateService(index, "price", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="Monthly capacity">
                        <Input
                          type="number"
                          min="1"
                          value={service.capacity}
                          onChange={(event) =>
                            updateService(index, "capacity", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="From">
                        <Input
                          type="time"
                          value={service.from}
                          onChange={(event) =>
                            updateService(index, "from", event.target.value)
                          }
                        />
                      </Field>
                      <Field label="To">
                        <Input
                          type="time"
                          value={service.to}
                          onChange={(event) =>
                            updateService(index, "to", event.target.value)
                          }
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() =>
                  setServices((current) => [
                    ...current,
                    {
                      id: crypto.randomUUID(),
                      name: "",
                      price: "",
                      capacity: "",
                      from: "10:00",
                      to: "18:00",
                    },
                  ])
                }
              >
                Add another service
              </Button>
            </SetupCard>

            <SetupCard
              icon={ShieldCheck}
              eyebrow="4. Creator agreement"
              title="Confirm your listing is accurate"
            >
              <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(value) => setAgreed(value === true)}
                />
                <span className="leading-relaxed">
                  I confirm that my profile, audience metrics, package pricing
                  and availability are accurate. I agree to the{" "}
                  <a
                    href="#terms"
                    className="font-semibold text-accent-foreground hover:underline"
                  >
                    Creator Terms
                  </a>
                  , marketplace standards, and payment policy.
                </span>
              </label>
              {submitted && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    <strong className="block">Profile setup saved</strong>Your
                    creator profile is ready for review. You can edit services
                    and availability at any time.
                  </span>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button size="lg" type="submit" disabled={!agreed}>
                  Submit creator profile{" "}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" type="button" variant="outline" asChild>
                  <Link to="/">Save and finish later</Link>
                </Button>
              </div>
            </SetupCard>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SetupCard({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: typeof UserRound;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="mt-0.5 font-display text-xl font-bold">{title}</h2>
        </div>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </div>
  );
}
