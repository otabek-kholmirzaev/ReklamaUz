import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/data";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI Campaign Copilot — Reklama.uz" },
      {
        name: "description",
        content:
          "Describe your campaign in plain language and Reklama.uz finds the best matching advertising opportunities.",
      },
      { property: "og:title", content: "AI Campaign Copilot — Reklama.uz" },
      {
        property: "og:description",
        content: "Plain-language campaign briefs matched to bookable creator advertising.",
      },
    ],
  }),
  component: Copilot,
});

const EXAMPLE =
  "I want to promote a new sportswear brand to young men in Tashkent. My budget is $1,500 and I want Instagram advertising during the first week of October.";

function Copilot() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const run = () => {
    setLoading(true);
    setTimeout(() => navigate({ to: "/matches" }), 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <span className="ai-chip">
          <Sparkles className="h-3.5 w-3.5" /> AI Campaign Copilot
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold">Find the right creators with AI</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Describe your campaign in plain language and we'll find the best matching advertising
          opportunities.
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-lift">
          <Label htmlFor="brief">Describe your campaign</Label>
          <textarea
            id="brief"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your campaign…"
            className="mt-2 w-full resize-none rounded-2xl border border-input bg-background p-4 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
          <button
            onClick={() => setText(EXAMPLE)}
            className="mt-2 text-left text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Use example: “{EXAMPLE}”
          </button>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Budget">
              <Input placeholder="$1,500" />
            </Field>
            <Field label="Location">
              <Input placeholder="Tashkent, Uzbekistan" />
            </Field>
            <Field label="Platform">
              <Picker options={["Instagram", "Telegram", "TikTok", "YouTube"]} />
            </Field>
            <Field label="Audience age">
              <Picker options={["16–24", "18–30", "18–34", "25–44"]} />
            </Field>
            <Field label="Gender">
              <Picker options={["Any", "Mostly male", "Mostly female"]} />
            </Field>
            <Field label="Category">
              <Picker options={categories} />
            </Field>
            <Field label="Preferred date">
              <Input type="date" defaultValue="2026-10-05" />
            </Field>
          </div>

          <Button size="lg" className="mt-7 w-full sm:w-auto" onClick={run} disabled={loading}>
            <Sparkles className="mr-1 h-4 w-4" />
            {loading ? "Matching creators…" : "Find Perfect Matches"}
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Picker({ options }: { options: string[] }) {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Any" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
