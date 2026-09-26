import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Heart,
  Instagram,
  Lock,
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { addBookingNotifications } from "@/lib/notifications";
import { isWishlisted, toggleWishlist, WISHLIST_EVENT } from "@/lib/wishlist";
import {
  apiFetch,
  type AdServiceResponse,
  type AdTypeResponse,
  type AvailabilityResponse,
  type BookingResponse,
  type PublicInfluencerProfileResponse,
} from "@/lib/api";

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

function platformFromAdType(adTypeName: string | undefined): string {
  if (!adTypeName) return "Other";
  if (adTypeName.startsWith("INSTAGRAM")) return "Instagram";
  if (adTypeName.startsWith("TELEGRAM")) return "Telegram";
  if (adTypeName.startsWith("YOUTUBE")) return "YouTube";
  if (adTypeName.startsWith("TIKTOK")) return "TikTok";
  return "Other";
}

function buildRealServices(
  adServices: AdServiceResponse[],
  adTypes: AdTypeResponse[] | undefined,
): Service[] {
  return adServices.map((service) => ({
    id: String(service.id),
    name: service.title,
    platform: platformFromAdType(
      adTypes?.find((t) => t.id === service.ad_type_id)?.name,
    ),
    price: service.price,
    bullets: service.description ? [service.description] : [],
  }));
}

const DEFAULT_CREATOR_PHOTO =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=768&h=960&fit=crop";

function buildRealOnlyCreator(
  profile: PublicInfluencerProfileResponse,
): Creator {
  return {
    username: profile.username,
    name: profile.display_name,
    photo: profile.avatar_url ?? DEFAULT_CREATOR_PHOTO,
    verified: false,
    category: profile.category_name,
    tags: [profile.category_name],
    location: profile.location ?? "Location not set",
    bio: profile.bio ?? "This creator hasn't added a bio yet.",
    platforms: [],
    followers: "—",
    followersNum: 0,
    avgViews: "—",
    engagement: "—",
    responseRate: "—",
    rating: 0,
    reviews: 0,
    audience: { age: "—", gender: "—", country: "—", split: [] },
    services: [],
    matchScore: 0,
    matchReasons: [],
    availability:
      profile.available_from && profile.available_to
        ? `Available ${profile.available_from}–${profile.available_to} daily`
        : "Availability not set",
    unavailableDates: [],
  };
}

function useRealCreatorData(username: string) {
  const { data: realProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["influencer-profile", username],
    queryFn: () =>
      apiFetch<PublicInfluencerProfileResponse>(
        `/api/influencer-profiles/${username}`,
      ),
    retry: false,
  });

  const { data: realServices } = useQuery({
    queryKey: ["influencer-services", username],
    queryFn: () =>
      apiFetch<AdServiceResponse[]>(
        `/api/influencer-profiles/${username}/services`,
      ),
    enabled: !!realProfile,
  });

  const { data: adTypes } = useQuery({
    queryKey: ["ad-types"],
    queryFn: () => apiFetch<AdTypeResponse[]>("/api/ad-types"),
    enabled: !!realProfile,
  });

  const { data: availability } = useQuery({
    queryKey: ["availability", realProfile?.user_id],
    queryFn: () =>
      apiFetch<AvailabilityResponse>(
        `/api/availability/${realProfile!.user_id}`,
      ),
    enabled: !!realProfile,
  });

  return { realProfile, realServices, adTypes, availability, profileLoading };
}

function CreatorProfileRoute() {
  const { username } = Route.useParams();
  const mockCreator = getCreator(username);
  const { realProfile, realServices, adTypes, availability, profileLoading } =
    useRealCreatorData(username);

  if (profileLoading && !mockCreator) {
    return null;
  }

  if (!mockCreator && !realProfile) {
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

  const base = mockCreator ?? buildRealOnlyCreator(realProfile!);
  const creator: Creator = realProfile
    ? {
        ...base,
        name: realProfile.display_name,
        bio: realProfile.bio ?? base.bio,
        category: realProfile.category_name,
        location: realProfile.location ?? base.location,
        photo: realProfile.avatar_url ?? base.photo,
        availability:
          realProfile.available_from && realProfile.available_to
            ? `Available ${realProfile.available_from}–${realProfile.available_to} daily`
            : base.availability,
        unavailableDates: [
          ...(availability?.blocked_dates ?? []),
          ...(availability?.booked_dates ?? []),
        ],
        services:
          realServices && realServices.length > 0
            ? buildRealServices(realServices, adTypes)
            : base.services,
      }
    : base;

  return (
    <CreatorProfile
      creator={creator}
      bookingContext={
        realProfile && realServices && realServices.length > 0
          ? {
              isReal: true,
              realServiceIds: new Set(realServices.map((s) => String(s.id))),
            }
          : { isReal: false, realServiceIds: new Set() }
      }
    />
  );
}

function CreatorProfile({
  creator,
  bookingContext,
}: {
  creator: Creator;
  bookingContext: { isReal: boolean; realServiceIds: Set<string> };
}) {
  const [fav, setFav] = useState(() => isWishlisted(creator.username));

  useEffect(() => {
    const handler = () => setFav(isWishlisted(creator.username));
    window.addEventListener(WISHLIST_EVENT, handler);
    return () => window.removeEventListener(WISHLIST_EVENT, handler);
  }, [creator.username]);

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
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [campaignName, setCampaignName] = useState("");
  const [campaignBrief, setCampaignBrief] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");

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
    setConfirmed(false);
    setBookingStep(1);
    setCampaignName("");
    setCampaignBrief("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardHolder("");
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setBookingError(null);
    setBookingStep(1);
  };

  const [bookingError, setBookingError] = useState<string | null>(null);
  const isRealService =
    bookingContext.isReal &&
    !!selected &&
    bookingContext.realServiceIds.has(selected.id);

  const bookingMutation = useMutation({
    mutationFn: () =>
      apiFetch<BookingResponse>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          service_id: Number(selected!.id),
          date: toDateKey(selectedDate!),
          description: `Publishing window: ${startTime}–${endTime}`,
        }),
      }),
    onSuccess: () => {
      setBookingError(null);
      if (selectedDate && selected) {
        addBookingNotifications({
          creatorUsername: creator.username,
          creatorName: creator.name,
          serviceName: selected.name,
          bookingDate: selectedDate,
        });
      }
      setConfirmed(true);
    },
    onError: (error) =>
      setBookingError(
        error instanceof Error ? error.message : "Could not send request.",
      ),
  });

  const submitBooking = () => {
    if (!selectedDate || !selected) return;
    if (isRealService) {
      bookingMutation.mutate();
      return;
    }
    addBookingNotifications({
      creatorUsername: creator.username,
      creatorName: creator.name,
      serviceName: selected.name,
      bookingDate: selectedDate,
    });
    setConfirmed(true);
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
                  onClick={() => setFav(toggleWishlist(creator.username))}
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
        <DialogContent className="sm:max-w-lg">
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
              <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{selected?.name}</span>
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
              <DialogFooter>
                <Button onClick={closeBooking}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* Step indicator */}
              <div className="mb-1 flex items-center gap-2">
                {([1, 2, 3] as const).map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        bookingStep === s
                          ? "bg-primary text-primary-foreground"
                          : bookingStep > s
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {bookingStep > s ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        s
                      )}
                    </span>
                    {s < 3 && (
                      <div
                        className={cn(
                          "h-px w-6",
                          bookingStep > s ? "bg-success/40" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                  {bookingStep === 1
                    ? "Review"
                    : bookingStep === 2
                      ? "Campaign details"
                      : "Payment"}
                </span>
              </div>

              {bookingStep === 1 && (
                <>
                  <DialogHeader>
                    <DialogTitle>Review your booking</DialogTitle>
                    <DialogDescription>
                      Confirm the service and schedule before continuing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Creator</span>
                      <span className="font-medium">@{creator.username}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
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
                      <span className="text-muted-foreground">
                        Publishing window
                      </span>
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
                  <DialogFooter>
                    <Button variant="outline" onClick={closeBooking}>
                      Cancel
                    </Button>
                    <Button onClick={() => setBookingStep(2)}>
                      Next — Campaign details
                    </Button>
                  </DialogFooter>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Campaign details
                    </DialogTitle>
                    <DialogDescription>
                      Tell the creator what this campaign is about.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Campaign name{" "}
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g. Summer collection launch"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Brief & instructions
                      </label>
                      <textarea
                        value={campaignBrief}
                        onChange={(e) => setCampaignBrief(e.target.value)}
                        placeholder="Describe the product, key messaging, hashtags, any do's or don'ts for the creator…"
                        rows={4}
                        className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      />
                      <p className="text-xs text-muted-foreground">
                        {campaignBrief.length}/1000 characters
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBookingStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setBookingStep(3)}>
                      Next — Payment
                    </Button>
                  </DialogFooter>
                </>
              )}

              {bookingStep === 3 && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Payment details
                    </DialogTitle>
                    <DialogDescription>
                      Your card will not be charged until the creator confirms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Card number</label>
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => {
                            const digits = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 16);
                            setCardNumber(
                              digits.replace(/(\d{4})(?=\d)/g, "$1 "),
                            );
                          }}
                          placeholder="1234 5678 9012 3456"
                          className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm tracking-wider outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Expiry</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(e) => {
                            const digits = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            setCardExpiry(
                              digits.length >= 3
                                ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                                : digits,
                            );
                          }}
                          placeholder="MM/YY"
                          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">CVC</label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cardCvc}
                            onChange={(e) =>
                              setCardCvc(
                                e.target.value.replace(/\D/g, "").slice(0, 4),
                              )
                            }
                            placeholder="123"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Cardholder name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on card"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      />
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" /> Payments are secured and
                      processed after creator confirmation. No charge today.
                    </p>
                  </div>
                  {bookingError && (
                    <p className="text-sm text-destructive">{bookingError}</p>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBookingStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={submitBooking}
                      disabled={
                        bookingMutation.isPending ||
                        !cardNumber ||
                        !cardExpiry ||
                        !cardCvc ||
                        !cardHolder
                      }
                    >
                      {bookingMutation.isPending
                        ? "Sending…"
                        : "Confirm & send request"}
                    </Button>
                  </DialogFooter>
                </>
              )}
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

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
