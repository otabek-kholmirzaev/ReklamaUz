import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle2,
  Instagram,
  Music2,
  Send,
  Sparkles,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { becomeCreator as t } from "@/lib/i18n/becomeCreator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/become-a-creator")({
  head: () => ({
    meta: [
      { title: t.pageTitle },
      {
        name: "description",
        content: t.pageDescription,
      },
    ],
  }),
  component: BecomeACreator,
});

const CATEGORIES = t.categories;

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "telegram", label: "Telegram", icon: Send },
] as const;

function BecomeACreator() {
  const [submitted, setSubmitted] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [followersRange, setFollowersRange] = useState("");

  const togglePlatform = (id: string) =>
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="border-b border-border bg-foreground text-background">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/10 px-3 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" /> {t.heroBadge}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              {t.heroTitleLine1}
              <br />
              {t.heroTitleLine2}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-background/70">
              {t.heroSubtitle}
            </p>
            <ul className="mt-8 space-y-3 text-sm text-background/85">
              {t.benefits.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Form / Success */}
        <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-soft">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </span>
              <h2 className="font-display text-2xl font-bold">
                {t.successTitle}
              </h2>
              <p className="max-w-sm text-muted-foreground">
                {t.successMessage}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.successQuestionsPrefix}{" "}
                <span className="font-medium text-foreground">
                  {t.successEmail}
                </span>{" "}
                {t.successQuestionsSuffix}
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="font-display text-3xl font-bold">
                  {t.formSectionTitle}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {t.formSectionSubtitle}
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {/* Personal info */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-semibold">{t.personalInfoTitle}</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="full-name">{t.fullNameLabel}</Label>
                      <Input
                        id="full-name"
                        name="fullName"
                        placeholder={t.fullNamePlaceholder}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">{t.emailLabel}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">{t.phoneLabel}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+998 90 000 00 00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location">{t.locationLabel}</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder={t.locationPlaceholder}
                      />
                    </div>
                  </div>
                </div>

                {/* Platforms */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-semibold">{t.platformsTitle}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.platformsSubtitle}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

                  <div className="mt-4 space-y-4">
                    {platforms.includes("instagram") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="instagram-handle">
                          {t.instagramHandleLabel}
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            @
                          </span>
                          <Input
                            id="instagram-handle"
                            name="instagramHandle"
                            className="pl-7"
                            placeholder={t.handlePlaceholder}
                          />
                        </div>
                      </div>
                    )}
                    {platforms.includes("tiktok") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="tiktok-handle">
                          {t.tiktokHandleLabel}
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            @
                          </span>
                          <Input
                            id="tiktok-handle"
                            name="tiktokHandle"
                            className="pl-7"
                            placeholder={t.handlePlaceholder}
                          />
                        </div>
                      </div>
                    )}
                    {platforms.includes("youtube") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="youtube-url">{t.youtubeUrlLabel}</Label>
                        <Input
                          id="youtube-url"
                          name="youtubeUrl"
                          type="url"
                          placeholder="https://youtube.com/@..."
                        />
                      </div>
                    )}
                    {platforms.includes("telegram") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="telegram-handle">
                          {t.telegramHandleLabel}
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            @
                          </span>
                          <Input
                            id="telegram-handle"
                            name="telegramHandle"
                            className="pl-7"
                            placeholder={t.telegramPlaceholder}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audience */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-semibold">{t.audienceTitle}</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="category">{t.categoryLabel}</Label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      >
                        <option value="" disabled>
                          {t.categoryPlaceholder}
                        </option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="followers">{t.followersLabel}</Label>
                      <select
                        id="followers"
                        value={followersRange}
                        onChange={(e) => setFollowersRange(e.target.value)}
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      >
                        <option value="" disabled>
                          {t.followersPlaceholder}
                        </option>
                        {t.followersRanges.map((range) => (
                          <option key={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="about">{t.aboutLabel}</Label>
                      <textarea
                        id="about"
                        name="about"
                        placeholder={t.aboutPlaceholder}
                        rows={4}
                        className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={platforms.length === 0}
                >
                  {t.submit}
                </Button>
                {platforms.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {t.selectPlatformHint}
                  </p>
                )}
              </form>
            </>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
