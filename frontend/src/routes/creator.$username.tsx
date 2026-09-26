import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Instagram,
  MapPin,
  Music2,
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  creators,
  getCreator,
  reviews,
  type Creator,
  type Service,
} from "@/lib/data";
import { getSession } from "@/lib/auth";
import { addBookingNotifications } from "@/lib/notifications";

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

const TIME_OPTIONS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

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
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);
  const platforms = Array.from(
    new Set(creator.services.map((s) => s.platform)),
  );
  const [activePlatform, setActivePlatform] = useState(platforms[0] ?? "");
  const [selectedId, setSelectedId] = useState(() =>
    firstAvailableId(creator, platforms[0]),
  );
  const selected = creator.services.find((s) => s.id === selectedId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
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
  const serviceBookedDates = (selected?.bookedDates ?? []).map(
    (d) => new Date(`${d}T00:00:00`),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePlatformChange = (platform: string) => {
    setActivePlatform(platform);
    if (platform) {
      setSelectedId(firstAvailableId(creator, platform));
      setSelectedDate(undefined);
    }
  };

  const hasValidTimeRange = startTime < endTime;

  const openBooking = () => {
    if (!getSession()) {
      void navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    setConfirmed(false);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
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
              className="h-48 w-40 shrink-0 rounded-3xl object-cover shadow-lift sm:h-64 sm:w-52"
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
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">Book a service</p>
              <h2 className="mt-1 font-display text-2xl font-bold">
                Advertising packages
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Select a platform, service, date and time.
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-border bg-surface p-4 lg:sticky lg:top-24 lg:h-fit">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                1. Platform
              </p>
              <div className="mt-3 space-y-2">
                {platforms.map((platform) => {
                  const Icon = PLATFORM_ICON[platform] ?? Instagram;
                  const serviceCount = creator.services.filter(
                    (service) => service.platform === platform,
                  ).length;
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformChange(platform)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                        activePlatform === platform
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-transparent hover:border-border hover:bg-card",
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card shadow-soft">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <span className="min-w-0 flex-1 font-semibold">
                        {platform}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {serviceCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="min-w-0">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = PLATFORM_ICON[activePlatform] ?? Instagram;
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      2. Service
                    </p>
                    <h3 className="font-display text-xl font-bold">
                      {activePlatform} services
                    </h3>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {creator.services
                    .filter((service) => service.platform === activePlatform)
                    .map((service) => (
                      <ServiceOption
                        key={service.id}
                        service={service}
                        active={service.id === selectedId}
                        full={isFull(service)}
                        onSelect={() => {
                          setSelectedId(service.id);
                          setSelectedDate(undefined);
                        }}
                      />
                    ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-lift sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      3. Schedule
                    </p>
                    <h3 className="mt-1 font-display text-xl font-bold">
                      Choose an available date and time
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Blocked dates include existing bookings for{" "}
                      {selected?.name ?? "this service"}.
                    </p>
                  </div>
                  {selected?.limit && (
                    <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
                      {selected.limit.max - selected.limit.used} of{" "}
                      {selected.limit.max} slots left
                    </span>
                  )}
                </div>
                <div className="mt-5 grid gap-6 xl:grid-cols-[auto_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-border bg-background p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={
                        selected && isFull(selected)
                          ? () => true
                          : [
                              { before: today },
                              ...unavailableDates,
                              ...serviceBookedDates,
                            ]
                      }
                    />
                  </div>
                  <div className="rounded-2xl bg-surface p-5">
                    <p className="font-semibold">Publishing window</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose the time period for the requested placement.
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <label className="text-sm font-medium">
                        From
                        <select
                          value={startTime}
                          onChange={(event) => setStartTime(event.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time}>{time}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm font-medium">
                        To
                        <select
                          value={endTime}
                          onChange={(event) => setEndTime(event.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time}>{time}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {!hasValidTimeRange && (
                      <p className="mt-2 text-xs text-destructive">
                        End time must be after start time.
                      </p>
                    )}
                    <div className="mt-6 border-t border-border pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Package total
                        </span>
                        <span className="font-display text-2xl font-bold">
                          ${selected?.price ?? 0}
                        </span>
                      </div>
                      <Button
                        size="lg"
                        className="mt-4 w-full"
                        onClick={openBooking}
                        disabled={
                          !selected ||
                          isFull(selected) ||
                          !selectedDate ||
                          !hasValidTimeRange
                        }
                      >
                        {selected && isFull(selected)
                          ? "Monthly capacity reached"
                          : "Request to book"}
                      </Button>
                      {!selectedDate && selected && !isFull(selected) && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          Choose a date to continue
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-border pt-12">
          <h2 className="font-display text-xl font-bold">About</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">{creator.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {creator.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
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
                {creator.audience.split.map((audience) => (
                  <div key={audience.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{audience.label}</span>
                      <span className="text-muted-foreground">
                        {audience.value}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${audience.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold">
                  Client reviews
                </h2>
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  <Star className="h-4 w-4 fill-warning text-warning" />{" "}
                  {creator.rating} · {creator.reviews}
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.company}
                    className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                        {review.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">{review.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.type} • {review.date}
                        </p>
                      </div>
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />{" "}
                        {review.rating}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <InstagramInsights creator={creator} />
        </section>
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
                  <CheckCircle2 className="h-5 w-5 text-success" /> Request sent
                </DialogTitle>
                <DialogDescription>
                  @{creator.username} has a {creator.responseRate} response rate
                  and will confirm this booking shortly. You'll be notified as
                  soon as they respond.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={closeBooking}>Done</Button>
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
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {startTime}–{endTime}
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
                <Button
                  onClick={() => {
                    if (selectedDate && selected) {
                      addBookingNotifications({
                        creatorUsername: creator.username,
                        creatorName: creator.name,
                        serviceName: selected.name,
                        bookingDate: selectedDate,
                      });
                    }
                    setConfirmed(true);
                  }}
                >
                  Send request
                </Button>
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

function InstagramInsights({ creator }: { creator: Creator }) {
  const insights = {
    reach:
      creator.username === "footballstar"
        ? "486K"
        : `${creator.avgViews} reach`,
    impressions: creator.username === "footballstar" ? "1.1M" : "740K",
    profileActivity: creator.username === "footballstar" ? "18.4K" : "9.6K",
    gender:
      creator.username === "footballstar"
        ? "68% Female"
        : creator.audience.gender,
    age:
      creator.username === "footballstar" ? "25–34: 42%" : creator.audience.age,
    cities:
      creator.username === "footballstar"
        ? [
            ["Tashkent", "61%"],
            ["Namangan", "14%"],
            ["Samarkand", "8%"],
          ]
        : [
            ["Tashkent", "54%"],
            ["Samarkand", "12%"],
            ["Namangan", "9%"],
          ],
  };

  return (
    <section className="mt-10 rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <Instagram className="h-4 w-4" /> Instagram insights
          </p>
          <h2 className="mt-1 font-display text-xl font-bold">
            Recent audience and content performance
          </h2>
        </div>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Mock import · last 30 days
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <InfoTile label="Followers" value={creator.followers} />
        <InfoTile label="Reach" value={insights.reach} />
        <InfoTile label="Impressions" value={insights.impressions} />
        <InfoTile label="Engagement" value={creator.engagement} />
        <InfoTile label="Profile activity" value={insights.profileActivity} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-semibold">
            <Users className="h-4 w-4 text-primary" /> Audience
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoTile label="Gender" value={insights.gender} />
            <InfoTile label="Largest age group" value={insights.age} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Top cities
          </p>
          <div className="mt-2 space-y-2">
            {insights.cities.map(([city, share], index) => (
              <div key={city} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium">{city}</span>
                <span className="text-muted-foreground">{share}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-4 w-4 text-primary" /> Content-level
            performance
          </div>
          <div className="mt-4 space-y-3">
            {[
              ["Latest Reel", "642K plays", "8.1% engagement"],
              ["Product Story set", "184K reach", "4.8K link taps"],
              ["Feed post", "96K reach", "6.7% engagement"],
            ].map(([content, result, detail]) => (
              <div
                key={content}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm"
              >
                <span className="font-medium">{content}</span>
                <span className="text-right text-muted-foreground">
                  <span className="block">{result}</span>
                  <span className="text-xs">{detail}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
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
