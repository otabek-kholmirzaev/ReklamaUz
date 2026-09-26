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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/become-a-creator")({
  head: () => ({
    meta: [
      { title: "Become a Creator — Reklama.uz" },
      {
        name: "description",
        content:
          "Apply to join Reklama.uz as a creator and start earning from brand partnerships.",
      },
    ],
  }),
  component: BecomeACreator,
});

const CATEGORIES = [
  "Sports & Football",
  "Fashion & Beauty",
  "Lifestyle",
  "Travel",
  "Food & Cooking",
  "Technology & Gaming",
  "Music & Entertainment",
  "Education & Business",
  "Health & Fitness",
  "Comedy & Humor",
  "Family & Parenting",
  "Other",
];

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
              <Sparkles className="h-4 w-4" /> Creator applications open
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Grow your income.<br />Work with top brands.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-background/70">
              Join the Reklama.uz creator marketplace and connect with businesses
              looking to reach Uzbekistan's audiences.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-background/85">
              {[
                "Transparent, upfront pricing — you set your rates",
                "Brands come to you — no cold outreach needed",
                "Real-time booking calendar and payout dashboard",
              ].map((item) => (
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
                Application received!
              </h2>
              <p className="max-w-sm text-muted-foreground">
                Thanks for applying. Our team reviews every application and
                will reach out within 3–5 business days with next steps.
              </p>
              <p className="text-sm text-muted-foreground">
                Questions? Email us at{" "}
                <span className="font-medium text-foreground">
                  creators@reklama.uz
                </span>
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="font-display text-3xl font-bold">
                  Apply to join
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Fill in the form below and we'll review your profile. Takes
                  about 3 minutes.
                </p>
              </div>

              <form
                className="mt-8 space-y-6"
                onSubmit={handleSubmit}
              >
                {/* Personal info */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-semibold">Personal information</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="full-name">Full name</Label>
                      <Input
                        id="full-name"
                        name="fullName"
                        placeholder="Azizbek Toshmatov"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+998 90 000 00 00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location">City / Region</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Tashkent"
                      />
                    </div>
                  </div>
                </div>

                {/* Platforms */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-semibold">Active platforms</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select all that apply.
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
                        <Label htmlFor="instagram-handle">Instagram handle</Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                          <Input id="instagram-handle" name="instagramHandle" className="pl-7" placeholder="yourusername" />
                        </div>
                      </div>
                    )}
                    {platforms.includes("tiktok") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="tiktok-handle">TikTok handle</Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                          <Input id="tiktok-handle" name="tiktokHandle" className="pl-7" placeholder="yourusername" />
                        </div>
                      </div>
                    )}
                    {platforms.includes("youtube") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="youtube-url">YouTube channel URL</Label>
                        <Input id="youtube-url" name="youtubeUrl" type="url" placeholder="https://youtube.com/@..." />
                      </div>
                    )}
                    {platforms.includes("telegram") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="telegram-handle">Telegram channel / username</Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                          <Input id="telegram-handle" name="telegramHandle" className="pl-7" placeholder="yourchannel" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audience */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-semibold">Audience & content</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="category">Primary category</Label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      >
                        <option value="" disabled>Select a category…</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="followers">Total followers (approx.)</Label>
                      <select
                        id="followers"
                        value={followersRange}
                        onChange={(e) => setFollowersRange(e.target.value)}
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                      >
                        <option value="" disabled>Select a range…</option>
                        <option>Under 10K</option>
                        <option>10K – 50K</option>
                        <option>50K – 100K</option>
                        <option>100K – 500K</option>
                        <option>500K – 1M</option>
                        <option>Over 1M</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="about">Tell us about your content</Label>
                      <textarea
                        id="about"
                        name="about"
                        placeholder="Describe your content style, audience, and why you'd be a great fit for brand partnerships on Reklama.uz…"
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
                  Submit application
                </Button>
                {platforms.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    Select at least one platform to continue.
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
