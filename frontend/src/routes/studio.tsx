import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ImagePlus,
  Instagram,
  Music2,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  apiFetch,
  type AdServiceResponse,
  type AdTypeResponse,
  type AvailabilityBlockResponse,
  type CategoryResponse,
  type InfluencerProfileResponse,
} from "@/lib/api";
import {
  type AuthSession,
  getSession,
  SESSION_CHANGED_EVENT,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Creator Studio — Reklama.uz" },
      {
        name: "description",
        content:
          "Apply as a creator and set up your profile, services and availability on Reklama.uz.",
      },
    ],
  }),
  component: CreatorStudio,
});

const BENEFITS = [
  "Transparent, upfront pricing — you set your rates",
  "Brands come to you — no cold outreach needed",
  "Real-time booking calendar and payout dashboard",
];

const PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    field: "instagram_handle" as const,
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: Music2,
    field: "tiktok_handle" as const,
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    field: "youtube_url" as const,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: Send,
    field: "telegram_handle" as const,
  },
];

const FOLLOWER_RANGES = [
  "Under 10K",
  "10K – 50K",
  "50K – 100K",
  "100K – 500K",
  "500K – 1M",
  "Over 1M",
];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function CreatorStudio() {
  const queryClient = useQueryClient();
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionState(getSession());
    setReady(true);
  }, []);

  useEffect(() => {
    const handler = () => setSessionState(getSession());
    window.addEventListener(SESSION_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, handler);
  }, []);

  const isInfluencer = session?.user.role === "INFLUENCER";

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<CategoryResponse[]>("/api/categories"),
    enabled: ready,
  });

  const { data: adTypes } = useQuery({
    queryKey: ["ad-types"],
    queryFn: () => apiFetch<AdTypeResponse[]>("/api/ad-types"),
    enabled: ready,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["influencer-profile", "me"],
    queryFn: () =>
      apiFetch<InfluencerProfileResponse>("/api/influencer-profiles/me"),
    enabled: ready && isInfluencer,
    retry: false,
  });

  const { data: services } = useQuery({
    queryKey: ["ad-services", "me"],
    queryFn: () => apiFetch<AdServiceResponse[]>("/api/ad-services/me"),
    enabled: ready && isInfluencer,
  });

  const { data: blockedDates } = useQuery({
    queryKey: ["availability", "me"],
    queryFn: () =>
      apiFetch<AvailabilityBlockResponse[]>("/api/availability/me"),
    enabled: ready && isInfluencer,
  });

  const [form, setForm] = useState({
    username: "",
    display_name: "",
    category_id: "",
    bio: "",
    location: "",
    phone: "",
    followers_range: "",
    available_from: "10:00",
    available_to: "18:00",
    instagram_handle: "",
    tiktok_handle: "",
    youtube_url: "",
    telegram_handle: "",
  });
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Prefill the form once the existing profile loads (if any)
  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username,
        display_name: profile.display_name,
        category_id: String(profile.category_id),
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        phone: profile.phone ?? "",
        followers_range: profile.followers_range ?? "",
        available_from: profile.available_from ?? "10:00",
        available_to: profile.available_to ?? "18:00",
        instagram_handle: profile.instagram_handle ?? "",
        tiktok_handle: profile.tiktok_handle ?? "",
        youtube_url: profile.youtube_url ?? "",
        telegram_handle: profile.telegram_handle ?? "",
      });
      setPlatforms(
        PLATFORMS.filter(({ field }) => profile[field]).map(({ id }) => id),
      );
    }
  }, [profile]);

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
    const field = PLATFORMS.find((p) => p.id === id)?.field;
    if (field && platforms.includes(id)) {
      setForm((f) => ({ ...f, [field]: "" }));
    }
  };

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!session) {
        throw new Error("Log in or sign up as a creator to save your profile.");
      }
      const body = new FormData();
      body.set("username", form.username);
      body.set("display_name", form.display_name);
      body.set("category_id", form.category_id);
      body.set("bio", form.bio);
      body.set("location", form.location);
      body.set("phone", form.phone);
      body.set("followers_range", form.followers_range);
      body.set("available_from", form.available_from);
      body.set("available_to", form.available_to);
      body.set(
        "instagram_handle",
        platforms.includes("instagram") ? form.instagram_handle : "",
      );
      body.set(
        "tiktok_handle",
        platforms.includes("tiktok") ? form.tiktok_handle : "",
      );
      body.set(
        "youtube_url",
        platforms.includes("youtube") ? form.youtube_url : "",
      );
      body.set(
        "telegram_handle",
        platforms.includes("telegram") ? form.telegram_handle : "",
      );
      if (avatarFile) body.set("avatar", avatarFile);

      return apiFetch<InfluencerProfileResponse>(
        profile ? "/api/influencer-profiles/me" : "/api/influencer-profiles",
        { method: profile ? "PATCH" : "POST", body },
      );
    },
    onSuccess: (saved) => {
      setProfileError(null);
      queryClient.setQueryData(["influencer-profile", "me"], saved);
    },
    onError: (error) =>
      setProfileError(
        error instanceof Error ? error.message : "Could not save profile.",
      ),
  });

  const [newService, setNewService] = useState({
    ad_type_id: "",
    title: "",
    price: "",
  });
  const [serviceError, setServiceError] = useState<string | null>(null);

  const addServiceMutation = useMutation({
    mutationFn: () =>
      apiFetch<AdServiceResponse>("/api/ad-services", {
        method: "POST",
        body: JSON.stringify({
          ad_type_id: Number(newService.ad_type_id),
          title: newService.title,
          price: Number(newService.price),
        }),
      }),
    onSuccess: () => {
      setServiceError(null);
      setNewService({ ad_type_id: "", title: "", price: "" });
      void queryClient.invalidateQueries({ queryKey: ["ad-services", "me"] });
    },
    onError: (error) =>
      setServiceError(
        error instanceof Error ? error.message : "Could not add service.",
      ),
  });

  const blockMutation = useMutation({
    mutationFn: (date: string) =>
      apiFetch<AvailabilityBlockResponse>("/api/availability", {
        method: "POST",
        body: JSON.stringify({ date }),
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["availability", "me"] }),
  });

  const unblockMutation = useMutation({
    mutationFn: (date: string) =>
      apiFetch<void>(`/api/availability/${date}`, { method: "DELETE" }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["availability", "me"] }),
  });

  const blockedDateKeys = new Set((blockedDates ?? []).map((b) => b.date));
  const blockedDateObjects = (blockedDates ?? []).map(
    (b) => new Date(`${b.date}T00:00:00`),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toggleBlockedDate = (date: Date) => {
    const key = toDateKey(date);
    if (blockedDateKeys.has(key)) unblockMutation.mutate(key);
    else blockMutation.mutate(key);
  };

  if (!ready) return null;

  if (session && !isInfluencer) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-3xl font-bold">
            Studio is for creator accounts
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your account is registered as a business/brand. Sign up with a
            creator account to set up a public profile, services and
            availability.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/discover">Browse creators</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

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
            Complete your public profile, set the services brands can request,
            and manage the calendar clients see when they book you.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden rounded-3xl border border-border bg-surface p-4 lg:block lg:sticky lg:top-24 lg:h-fit">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Profile setup
            </p>
            <ol className="mt-3 space-y-1">
              {[
                ["1", "Personal information"],
                ["2", "Platforms"],
                ["3", "Audience & content"],
                ["4", "Services & pricing"],
                ["5", "Calendar & availability"],
                ["6", "Agreement"],
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

          <div className="space-y-6">
            {profileLoading ? (
              <SetupCard
                icon={UserRound}
                eyebrow="1. Personal information"
                title="Tell brands who they’re booking"
              >
                <p className="text-sm text-muted-foreground">
                  Loading your profile…
                </p>
              </SetupCard>
            ) : (
              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveProfileMutation.mutate();
                }}
              >
                <SetupCard
                  icon={UserRound}
                  eyebrow="1. Personal information"
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
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            setAvatarFile(file);
                            setPhotoName(file?.name ?? "");
                          }}
                        />
                      </label>
                    </Field>
                    <Field label="Full name">
                      <Input
                        value={form.display_name}
                        onChange={(event) =>
                          setForm((f) => ({
                            ...f,
                            display_name: event.target.value,
                          }))
                        }
                        required
                      />
                    </Field>
                    <Field label="Phone number">
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          setForm((f) => ({ ...f, phone: event.target.value }))
                        }
                        placeholder="+998 90 000 00 00"
                      />
                    </Field>
                    <Field label="City / Region">
                      <Input
                        value={form.location}
                        onChange={(event) =>
                          setForm((f) => ({
                            ...f,
                            location: event.target.value,
                          }))
                        }
                        placeholder="Tashkent, Uzbekistan"
                      />
                    </Field>
                    <Field label="Public profile handle">
                      <Input
                        value={form.username}
                        onChange={(event) =>
                          setForm((f) => ({
                            ...f,
                            username: event.target.value,
                          }))
                        }
                        placeholder="e.g. fitblogger"
                        required
                      />
                    </Field>
                  </div>
                </SetupCard>

                <SetupCard
                  icon={Instagram}
                  eyebrow="2. Platforms"
                  title="Where can brands find your content?"
                >
                  <p className="text-sm text-muted-foreground">
                    Select every platform you're active on, then add your handle
                    so brands can verify your audience.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {PLATFORMS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => togglePlatform(id)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors",
                          platforms.includes(id)
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border bg-background hover:border-primary/40",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {platforms.includes("instagram") && (
                      <Field label="Instagram handle">
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            @
                          </span>
                          <Input
                            className="pl-7"
                            value={form.instagram_handle}
                            onChange={(event) =>
                              setForm((f) => ({
                                ...f,
                                instagram_handle: event.target.value,
                              }))
                            }
                            placeholder="yourusername"
                          />
                        </div>
                      </Field>
                    )}
                    {platforms.includes("tiktok") && (
                      <Field label="TikTok handle">
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            @
                          </span>
                          <Input
                            className="pl-7"
                            value={form.tiktok_handle}
                            onChange={(event) =>
                              setForm((f) => ({
                                ...f,
                                tiktok_handle: event.target.value,
                              }))
                            }
                            placeholder="yourusername"
                          />
                        </div>
                      </Field>
                    )}
                    {platforms.includes("youtube") && (
                      <Field label="YouTube channel URL">
                        <Input
                          type="url"
                          value={form.youtube_url}
                          onChange={(event) =>
                            setForm((f) => ({
                              ...f,
                              youtube_url: event.target.value,
                            }))
                          }
                          placeholder="https://youtube.com/@..."
                        />
                      </Field>
                    )}
                    {platforms.includes("telegram") && (
                      <Field label="Telegram channel / username">
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            @
                          </span>
                          <Input
                            className="pl-7"
                            value={form.telegram_handle}
                            onChange={(event) =>
                              setForm((f) => ({
                                ...f,
                                telegram_handle: event.target.value,
                              }))
                            }
                            placeholder="yourchannel"
                          />
                        </div>
                      </Field>
                    )}
                  </div>
                </SetupCard>

                <SetupCard
                  icon={Users}
                  eyebrow="3. Audience & content"
                  title="Help brands understand your reach"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Creator category">
                      <select
                        value={form.category_id}
                        onChange={(event) =>
                          setForm((f) => ({
                            ...f,
                            category_id: event.target.value,
                          }))
                        }
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categories?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Total followers (approx.)">
                      <select
                        value={form.followers_range}
                        onChange={(event) =>
                          setForm((f) => ({
                            ...f,
                            followers_range: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      >
                        <option value="">Select a range…</option>
                        {FOLLOWER_RANGES.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Tell brands about your content">
                    <textarea
                      rows={4}
                      value={form.bio}
                      onChange={(event) =>
                        setForm((f) => ({ ...f, bio: event.target.value }))
                      }
                      placeholder="Describe your content style, audience, and why you'd be a great fit for brand partnerships…"
                      className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                    />
                  </Field>
                  {profileError && (
                    <p className="text-sm text-destructive">{profileError}</p>
                  )}
                  <Button
                    type="submit"
                    disabled={saveProfileMutation.isPending}
                  >
                    {profile ? "Save changes" : "Create profile"}
                  </Button>
                  {profile && (
                    <p className="inline-flex items-center gap-1.5 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" /> Live at /creator/
                      {profile.username}
                    </p>
                  )}
                </SetupCard>
              </form>
            )}

            <SetupCard
              icon={CalendarClock}
              eyebrow="4. Services & pricing"
              title="Make your offers clear and bookable"
            >
              <p className="text-sm text-muted-foreground">
                Add each format you sell with a fixed price. Brands will see
                these on your public profile.
              </p>
              <div className="mt-5 space-y-3">
                {(services ?? []).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
                  >
                    <div>
                      <p className="font-semibold">{service.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {adTypes?.find((t) => t.id === service.ad_type_id)
                          ?.name ?? "Service"}
                        {!service.is_active && " · Inactive"}
                      </p>
                    </div>
                    <span className="font-display text-lg font-bold">
                      ${service.price}
                    </span>
                  </div>
                ))}
                {services?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No services yet — add your first one below.
                  </p>
                )}
              </div>

              <form
                className="mt-5 grid gap-3 rounded-2xl border border-dashed border-input bg-surface p-4 sm:grid-cols-[1.3fr_1fr_1fr_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  addServiceMutation.mutate();
                }}
              >
                <Field label="Ad type">
                  <select
                    value={newService.ad_type_id}
                    onChange={(event) =>
                      setNewService((s) => ({
                        ...s,
                        ad_type_id: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {adTypes?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Title">
                  <Input
                    value={newService.title}
                    onChange={(event) =>
                      setNewService((s) => ({
                        ...s,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Instagram Reel"
                    required
                  />
                </Field>
                <Field label="Price (USD)">
                  <Input
                    type="number"
                    min="0"
                    value={newService.price}
                    onChange={(event) =>
                      setNewService((s) => ({
                        ...s,
                        price: event.target.value,
                      }))
                    }
                    required
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={addServiceMutation.isPending}
                  >
                    Add service
                  </Button>
                </div>
              </form>
              {serviceError && (
                <p className="mt-2 text-sm text-destructive">{serviceError}</p>
              )}
            </SetupCard>

            <SetupCard
              icon={CalendarClock}
              eyebrow="5. Calendar & availability"
              title="Set the hours and days you take bookings"
            >
              <p className="text-sm text-muted-foreground">
                Set the daily hours you're open for bookings, then click any
                dates on the calendar you're NOT available — clients won't be
                able to book those days.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
                <Field label="Available from">
                  <Input
                    type="time"
                    value={form.available_from}
                    onChange={(event) =>
                      setForm((f) => ({
                        ...f,
                        available_from: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Available to">
                  <Input
                    type="time"
                    value={form.available_to}
                    onChange={(event) =>
                      setForm((f) => ({
                        ...f,
                        available_to: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => saveProfileMutation.mutate()}
                disabled={saveProfileMutation.isPending}
              >
                Save hours
              </Button>

              <div className="mt-6 inline-block rounded-2xl border border-border bg-surface p-2">
                <Calendar
                  mode="single"
                  selected={undefined}
                  onSelect={(date) => date && toggleBlockedDate(date)}
                  disabled={[{ before: today }]}
                  modifiers={{ blocked: blockedDateObjects }}
                  modifiersClassNames={{
                    blocked: "bg-destructive/15 text-destructive",
                  }}
                />
              </div>
            </SetupCard>

            <SetupCard
              icon={ShieldCheck}
              eyebrow="6. Creator agreement"
              title="Confirm your listing is accurate"
            >
              <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(value) => setAgreed(value === true)}
                />
                <span className="leading-relaxed">
                  I confirm that my profile, package pricing and availability
                  are accurate. I agree to the{" "}
                  <a
                    href="#terms"
                    className="font-semibold text-accent-foreground hover:underline"
                  >
                    Creator Terms
                  </a>
                  , marketplace standards, and payment policy.
                </span>
              </label>
              {agreed && profile && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    <strong className="block">
                      Your creator profile is live
                    </strong>
                    Brands can find and book you at /creator/{profile.username}.
                    You can edit services and availability at any time.
                  </span>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button size="lg" asChild disabled={!profile}>
                  <Link
                    to="/creator/$username"
                    params={{ username: profile?.username ?? "" }}
                  >
                    View public profile
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/dashboard">Go to dashboard</Link>
                </Button>
              </div>
            </SetupCard>
          </div>
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
