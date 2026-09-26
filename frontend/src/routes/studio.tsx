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
import { studio as t } from "@/lib/i18n/studio";
import {
  AD_TYPE_LABELS,
  CATEGORY_LABELS,
  translateEnum,
} from "@/lib/i18n/enums";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: t.pageTitle },
      {
        name: "description",
        content: t.pageDescription,
      },
    ],
  }),
  component: CreatorStudio,
});

const BENEFITS = t.benefits;

const PLATFORMS = [
  {
    id: "instagram",
    label: t.platformInstagram,
    icon: Instagram,
    field: "instagram_handle" as const,
  },
  {
    id: "tiktok",
    label: t.platformTikTok,
    icon: Music2,
    field: "tiktok_handle" as const,
  },
  {
    id: "youtube",
    label: t.platformYouTube,
    icon: Youtube,
    field: "youtube_url" as const,
  },
  {
    id: "telegram",
    label: t.platformTelegram,
    icon: Send,
    field: "telegram_handle" as const,
  },
];

const FOLLOWER_RANGES = t.followerRanges;

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
        throw new Error(t.logInToSaveProfile);
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
        error instanceof Error ? error.message : t.couldNotSaveProfile,
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
        error instanceof Error ? error.message : t.couldNotAddService,
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
            {t.studioForCreatorsTitle}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {t.studioForCreatorsBody}
          </p>
          <Button className="mt-6" asChild>
            <Link to="/discover">{t.browseCreators}</Link>
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
            <Sparkles className="h-3.5 w-3.5" /> {t.chip}
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">
            {t.heroHeading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {t.heroBody}
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
              {t.profileSetup}
            </p>
            <ol className="mt-3 space-y-1">
              {[
                ["1", t.step1],
                ["2", t.step2],
                ["3", t.step3],
                ["4", t.step4],
                ["5", t.step5],
                ["6", t.step6],
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
                eyebrow={t.personalInfoEyebrow}
                title={t.personalInfoTitle}
              >
                <p className="text-sm text-muted-foreground">
                  {t.loadingProfile}
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
                  eyebrow={t.personalInfoEyebrow}
                  title={t.personalInfoTitle}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.profilePicture}>
                      <label className="flex min-h-24 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-surface px-4 py-3 transition-colors hover:border-primary hover:bg-accent/30">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary shadow-soft">
                          <ImagePlus className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {photoName || t.uploadProfilePicture}
                          </span>
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                            {t.imageFormatHint}
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
                    <Field label={t.fullName}>
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
                    <Field label={t.phoneNumber}>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          setForm((f) => ({ ...f, phone: event.target.value }))
                        }
                        placeholder="+998 90 000 00 00"
                      />
                    </Field>
                    <Field label={t.cityRegion}>
                      <Input
                        value={form.location}
                        onChange={(event) =>
                          setForm((f) => ({
                            ...f,
                            location: event.target.value,
                          }))
                        }
                        placeholder={t.cityPlaceholder}
                      />
                    </Field>
                    <Field label={t.publicProfileHandle}>
                      <Input
                        value={form.username}
                        onChange={(event) =>
                          setForm((f) => ({
                            ...f,
                            username: event.target.value,
                          }))
                        }
                        placeholder={t.handlePlaceholder}
                        required
                      />
                    </Field>
                  </div>
                </SetupCard>

                <SetupCard
                  icon={Instagram}
                  eyebrow={t.platformsEyebrow}
                  title={t.platformsTitle}
                >
                  <p className="text-sm text-muted-foreground">
                    {t.platformsBody}
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
                      <Field label={t.instagramHandle}>
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
                            placeholder={t.usernamePlaceholder}
                          />
                        </div>
                      </Field>
                    )}
                    {platforms.includes("tiktok") && (
                      <Field label={t.tiktokHandle}>
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
                            placeholder={t.usernamePlaceholder}
                          />
                        </div>
                      </Field>
                    )}
                    {platforms.includes("youtube") && (
                      <Field label={t.youtubeChannelUrl}>
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
                      <Field label={t.telegramHandle}>
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
                            placeholder={t.channelPlaceholder}
                          />
                        </div>
                      </Field>
                    )}
                  </div>
                </SetupCard>

                <SetupCard
                  icon={Users}
                  eyebrow={t.audienceEyebrow}
                  title={t.audienceTitle}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.creatorCategory}>
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
                          {t.selectCategory}
                        </option>
                        {categories?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {translateEnum(CATEGORY_LABELS, c.name)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t.totalFollowers}>
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
                        <option value="">{t.selectRange}</option>
                        {FOLLOWER_RANGES.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label={t.tellBrandsAboutContent}>
                    <textarea
                      rows={4}
                      value={form.bio}
                      onChange={(event) =>
                        setForm((f) => ({ ...f, bio: event.target.value }))
                      }
                      placeholder={t.contentDescriptionPlaceholder}
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
                    {profile ? t.saveChanges : t.createProfile}
                  </Button>
                  {profile && (
                    <p className="inline-flex items-center gap-1.5 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" /> {t.liveAt}
                      {profile.username}
                    </p>
                  )}
                </SetupCard>
              </form>
            )}

            <SetupCard
              icon={CalendarClock}
              eyebrow={t.servicesEyebrow}
              title={t.servicesTitle}
            >
              <p className="text-sm text-muted-foreground">{t.servicesBody}</p>
              <div className="mt-5 space-y-3">
                {(services ?? []).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
                  >
                    <div>
                      <p className="font-semibold">{service.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const adTypeName = adTypes?.find(
                            (at) => at.id === service.ad_type_id,
                          )?.name;
                          return adTypeName
                            ? translateEnum(AD_TYPE_LABELS, adTypeName)
                            : t.serviceFallback;
                        })()}
                        {!service.is_active && ` · ${t.inactive}`}
                      </p>
                    </div>
                    <span className="font-display text-lg font-bold">
                      ${service.price}
                    </span>
                  </div>
                ))}
                {services?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t.noServicesYet}
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
                <Field label={t.adType}>
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
                      {t.select}
                    </option>
                    {adTypes?.map((adType) => (
                      <option key={adType.id} value={adType.id}>
                        {translateEnum(AD_TYPE_LABELS, adType.name)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t.title}>
                  <Input
                    value={newService.title}
                    onChange={(event) =>
                      setNewService((s) => ({
                        ...s,
                        title: event.target.value,
                      }))
                    }
                    placeholder={t.titlePlaceholder}
                    required
                  />
                </Field>
                <Field label={t.priceUsd}>
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
                    {t.addService}
                  </Button>
                </div>
              </form>
              {serviceError && (
                <p className="mt-2 text-sm text-destructive">{serviceError}</p>
              )}
            </SetupCard>

            <SetupCard
              icon={CalendarClock}
              eyebrow={t.calendarEyebrow}
              title={t.calendarTitle}
            >
              <p className="text-sm text-muted-foreground">{t.calendarBody}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
                <Field label={t.availableFrom}>
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
                <Field label={t.availableTo}>
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
                {t.saveHours}
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
              eyebrow={t.agreementEyebrow}
              title={t.agreementTitle}
            >
              <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(value) => setAgreed(value === true)}
                />
                <span className="leading-relaxed">
                  {t.agreementText}
                  <a
                    href="#terms"
                    className="font-semibold text-accent-foreground hover:underline"
                  >
                    {t.creatorTerms}
                  </a>
                  {t.agreementTextEnd}
                </span>
              </label>
              {agreed && profile && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    <strong className="block">{t.profileIsLive}</strong>
                    {t.profileIsLiveBody(profile.username)}
                  </span>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button size="lg" asChild disabled={!profile}>
                  <Link
                    to="/creator/$username"
                    params={{ username: profile?.username ?? "" }}
                  >
                    {t.viewPublicProfile}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/dashboard">{t.goToDashboard}</Link>
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
