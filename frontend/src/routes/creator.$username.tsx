import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Instagram,
  MapPin,
  MessageSquare,
  Music2,
  Plus,
  Send,
  Star,
  TrendingUp,
  Users,
  Youtube,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { CreatorCard } from "@/components/creator-card";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  creators,
  getCreator,
  reviews,
  type Creator,
  type Service,
} from "@/lib/data";

export const Route = createFileRoute("/creator/$username")({
  head: ({ params }) => {
    const creator = getCreator(params.username);
    const title = creator
      ? `${creator.name} (@${creator.username}) — Reklama.uz`
      : "Creator not found — Reklama.uz";
    const description = creator
      ? `Book advertising with ${creator.name} — ${creator.followers} followers and ${creator.engagement} engagement on ${creator.platforms.join(", ")}.`
      : "This creator profile could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CreatorProfileRoute,
});

const PLATFORM_ICON: Record<string, LucideIcon> = {
  Instagram,
  Telegram: Send,
  YouTube: Youtube,
  TikTok: Music2,
};

function CreatorProfileRoute() {
  const { username } = Route.useParams();
  const creator = getCreator(username);

  if (!creator) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-3xl font-bold">Creator not found</h1>
          <p className="mt-3 text-muted-foreground">
            We couldn't find a profile for "{username}". They may have changed
            their username, or the link is incorrect.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/discover">Browse creators</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <CreatorProfile creator={creator} />;
}

function CreatorProfile({ creator }: { creator: Creator }) {
  const [fav, setFav] = useState(false);
  const platforms = Array.from(
    new Set(creator.services.map((s) => s.platform)),
  );
  const [activePlatform, setActivePlatform] = useState(platforms[0] ?? "");
  const [selectedId, setSelectedId] = useState(() =>
    firstAvailableId(creator, platforms[0]),
  );
  const selected = creator.services.find((s) => s.id === selectedId);
  const [mode, setMode] = useState<"package" | "negotiate">("package");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [negotiateBudget, setNegotiateBudget] = useState("");
  const [negotiateMessage, setNegotiateMessage] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const others = creators.filter((c) => c.username !== creator.username);
  const sameCategory = others.filter((c) => c.category === creator.category);
  const similar = (sameCategory.length > 0 ? sameCategory : others).slice(0, 3);
  const similarHeading =
    sameCategory.length > 0
      ? `More in ${creator.category}`
      : "More creators to explore";

  const unavailableDates = creator.unavailableDates.map(
    (d) => new Date(`${d}T00:00:00`),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleAccordionChange = (platform: string) => {
    setActivePlatform(platform);
    if (platform) {
      setSelectedId(firstAvailableId(creator, platform));
      setMode("package");
    }
  };

  const openBooking = () => {
    setConfirmed(false);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    if (confirmed) {
      setMode("package");
      setNegotiateBudget("");
      setNegotiateMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/discover">Discover</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/discover">{creator.category}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>@{creator.username}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <img
              src={creator.photo}
              alt={creator.name}
              width={768}
              height={960}
              className="h-40 w-40 shrink-0 rounded-3xl object-cover shadow-lift sm:h-48 sm:w-48"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {creator.name}
                </h1>
                {creator.verified && (
                  <BadgeCheck className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="mt-1 text-muted-foreground">
                @{creator.username} • {creator.category}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Star className="h-4 w-4 fill-warning text-warning" />{" "}
                  {creator.rating}
                  <span className="text-muted-foreground">
                    ({creator.reviews} reviews)
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {creator.location}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {creator.availability}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-muted-foreground">
                {creator.bio}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {creator.platforms.map((p) => {
                  const Icon = PLATFORM_ICON[p] ?? Instagram;
                  return (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"
                    >
                      <Icon className="h-3.5 w-3.5" /> {p}
                    </span>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" variant="outline" asChild>
                  <Link to="/dashboard">
                    <MessageSquare className="mr-1 h-4 w-4" /> Message
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => setFav((v) => !v)}
                >
                  <Heart
                    className={cn(
                      "mr-1 h-4 w-4",
                      fav && "fill-primary text-primary",
                    )}
                  />
                  {fav ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              icon={Users}
              label="Followers"
              value={creator.followers}
            />
            <StatTile icon={Eye} label="Avg. views" value={creator.avgViews} />
            <StatTile
              icon={TrendingUp}
              label="Engagement"
              value={creator.engagement}
            />
            <StatTile
              icon={Zap}
              label="Response rate"
              value={creator.responseRate}
            />
          </dl>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="order-2 space-y-10 lg:order-1">
            <section>
              <h2 className="font-display text-xl font-bold">About</h2>
              <p className="mt-3 text-muted-foreground">{creator.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {creator.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-display text-xl font-bold">
                Audience insights
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <InfoTile label="Age" value={creator.audience.age} />
                <InfoTile label="Gender" value={creator.audience.gender} />
                <InfoTile
                  label="Primary market"
                  value={creator.audience.country}
                />
              </div>
              <div className="mt-6 space-y-3">
                {creator.audience.split.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-muted-foreground">{s.value}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold">
                  Client reviews
                </h2>
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  <Star className="h-4 w-4 fill-warning text-warning" />{" "}
                  {creator.rating} · {creator.reviews} reviews
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <div
                    key={r.company}
                    className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                        {r.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">{r.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.type} • {r.date}
                        </p>
                      </div>
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />{" "}
                        {r.rating}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="order-1 lg:sticky lg:top-24 lg:order-2 lg:h-fit">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-lift">
              <h2 className="font-display text-lg font-bold">
                Advertising packages
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a platform to see its formats and pricing.
              </p>

              <Accordion
                type="single"
                collapsible
                value={activePlatform}
                onValueChange={handleAccordionChange}
                className="mt-4 space-y-3"
              >
                {platforms.map((p) => {
                  const Icon = PLATFORM_ICON[p] ?? Instagram;
                  const platformServices = creator.services.filter(
                    (s) => s.platform === p,
                  );
                  const fromPrice = Math.min(
                    ...platformServices.map((s) => s.price),
                  );
                  return (
                    <AccordionItem
                      key={p}
                      value={p}
                      className="rounded-2xl border border-border px-4"
                    >
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex flex-1 items-center justify-between pr-2">
                          <span className="flex items-center gap-2 font-semibold">
                            <Icon className="h-4 w-4 text-primary" /> {p}
                          </span>
                          <span className="text-sm font-normal text-muted-foreground">
                            From ${fromPrice}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {platformServices.map((s) => (
                            <ServiceOption
                              key={s.id}
                              service={s}
                              active={mode === "package" && s.id === selectedId}
                              full={isFull(s)}
                              onSelect={() => {
                                setSelectedId(s.id);
                                setMode("package");
                              }}
                            />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              <button
                type="button"
                onClick={() => setMode("negotiate")}
                className={cn(
                  "mt-3 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                  mode === "negotiate"
                    ? "border-primary bg-accent/60"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    Negotiate a package
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Tailor a collaboration to your needs: propose custom terms,
                    pricing, or requirements.
                  </span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>

              <Separator className="my-5" />

              <div>
                <h3 className="font-display text-sm font-bold">
                  Check availability
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Greyed-out days are already booked.
                </p>
                <div className="mt-3 flex justify-center rounded-2xl border border-border bg-background p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={[{ before: today }, ...unavailableDates]}
                  />
                </div>
                {selectedDate && (
                  <p className="mt-2 text-center text-sm font-medium">
                    Selected: {formatDate(selectedDate)}
                  </p>
                )}
              </div>

              <div className="mt-5 border-t border-border pt-4">
                {mode === "package" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total
                      </span>
                      <span className="font-display text-2xl font-bold">
                        ${selected?.price ?? 0}
                      </span>
                    </div>
                    <Button
                      size="lg"
                      className="mt-4 w-full"
                      onClick={openBooking}
                      disabled={!selected || isFull(selected) || !selectedDate}
                    >
                      {selected && isFull(selected)
                        ? "Fully booked this month"
                        : "Request to book"}
                    </Button>
                    {selected && !isFull(selected) && !selectedDate && (
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        Pick a date above to continue
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pricing
                      </span>
                      <span className="font-display text-lg font-bold">
                        Custom
                      </span>
                    </div>
                    <Button
                      size="lg"
                      className="mt-4 w-full"
                      onClick={openBooking}
                    >
                      Send negotiation request
                    </Button>
                  </>
                )}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {creator.availability} • {creator.responseRate} response rate
              </p>
            </div>
          </aside>
        </div>
      </main>

      {similar.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="font-display text-2xl font-bold">
              {similarHeading}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((c) => (
                <CreatorCard key={c.username} creator={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />

      <Dialog
        open={bookingOpen}
        onOpenChange={(open) => (open ? setBookingOpen(true) : closeBooking())}
      >
        <DialogContent>
          {confirmed ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />{" "}
                  {mode === "negotiate" ? "Proposal sent" : "Request sent"}
                </DialogTitle>
                <DialogDescription>
                  @{creator.username} has a {creator.responseRate} response rate
                  and will{" "}
                  {mode === "negotiate"
                    ? "review your proposal"
                    : "confirm availability"}{" "}
                  shortly. You'll be notified as soon as they respond.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={closeBooking}>Done</Button>
              </DialogFooter>
            </>
          ) : mode === "negotiate" ? (
            <>
              <DialogHeader>
                <DialogTitle>Negotiate a package</DialogTitle>
                <DialogDescription>
                  Describe what you'd like from @{creator.username} — format,
                  timeline, and your budget.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="negotiate-budget">
                    Proposed budget (optional)
                  </Label>
                  <Input
                    id="negotiate-budget"
                    placeholder="$600"
                    value={negotiateBudget}
                    onChange={(e) => setNegotiateBudget(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="negotiate-message">Your proposal</Label>
                  <textarea
                    id="negotiate-message"
                    rows={4}
                    value={negotiateMessage}
                    onChange={(e) => setNegotiateMessage(e.target.value)}
                    placeholder="e.g. 2 Instagram Stories + 1 Reel, delivered within 2 weeks…"
                    className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeBooking}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setConfirmed(true)}
                  disabled={!negotiateMessage.trim()}
                >
                  Send proposal
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm booking request</DialogTitle>
                <DialogDescription>
                  Review the details before sending your request to @
                  {creator.username}.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{selected?.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium">{selected?.platform}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {selectedDate ? formatDate(selectedDate) : "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-lg font-bold">
                    ${selected?.price}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You won't be charged yet — the creator confirms availability
                before payment is collected.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={closeBooking}>
                  Cancel
                </Button>
                <Button onClick={() => setConfirmed(true)}>Send request</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function isFull(service: Service) {
  return !!service.limit && service.limit.used >= service.limit.max;
}

function firstAvailableId(creator: Creator, platform: string | undefined) {
  const platformServices = creator.services.filter(
    (s) => s.platform === platform,
  );
  return (platformServices.find((s) => !isFull(s)) ?? platformServices[0])?.id;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ServiceOption({
  service,
  active,
  full,
  onSelect,
}: {
  service: Service;
  active: boolean;
  full: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={full}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-colors",
        full
          ? "cursor-not-allowed border-border bg-muted/40 opacity-70"
          : active
            ? "border-primary bg-accent/60"
            : "border-border bg-card hover:border-primary/40",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">{service.name}</span>
        <span className="font-display text-lg font-bold">${service.price}</span>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {service.bullets.map((b) => (
          <li key={b} className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{" "}
            {b}
          </li>
        ))}
      </ul>
      {service.limit && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {full ? "Fully booked" : "Availability"} {service.limit.period}
            </span>
            <span>
              {service.limit.used}/{service.limit.max}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                full ? "bg-warning" : "bg-primary",
              )}
              style={{
                width: `${Math.min(100, (service.limit.used / service.limit.max) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 font-display text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
