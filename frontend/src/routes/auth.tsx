import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  Store,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearSession, getSession, SESSION_CHANGED_EVENT, setSession, signin, signup } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";
type UserRole = "CLIENT" | "INFLUENCER";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "signup" ? "signup" : ("login" as AuthMode),
  }),
  head: () => ({
    meta: [
      { title: "Log in — Reklama.uz" },
      {
        name: "description",
        content: "Log in or create your Reklama.uz account to book creator advertising.",
      },
    ],
  }),
  component: Auth,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.2 13.8A6 6 0 0 1 6 12c0-.6.1-1.2.2-1.8V7.6H2.9A10 10 0 0 0 2 12c0 1.6.4 3.1.9 4.4l3.3-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.7 0 3.1.6 4.3 1.7l3.2-3.1C17.7 2.9 15.1 2 12 2a10 10 0 0 0-9.1 5.6l3.3 2.6C7 7.7 9.3 5.9 12 5.9Z"
      />
    </svg>
  );
}

function Auth() {
  const { mode: routeMode } = Route.useSearch();
  const navigate = useNavigate({ from: "/auth" });
  const [mode, setMode] = useState<AuthMode>(routeMode);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect already-authenticated users away
  useEffect(() => {
    if (getSession()) void navigate({ to: "/" });
  }, [navigate]);

  // Sync with SESSION_CHANGED_EVENT (e.g. logout from another tab)
  useEffect(() => {
    const handler = () => {
      if (!getSession()) return;
      void navigate({ to: "/" });
    };
    window.addEventListener(SESSION_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, handler);
  }, [navigate]);

  const isSignup = mode === "signup";

  const updateMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    void navigate({ to: "/auth", search: { mode: nextMode } });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const data = new FormData(event.currentTarget);
      const email = (data.get("email") as string).trim();
      const password = data.get("password") as string;

      const session = isSignup
        ? await signup(email, password, role)
        : await signin(email, password);

      setSession(session);
      void navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-lift lg:grid-cols-[1fr_1.1fr]">
        {/* Left panel — decorative */}
        <section className="relative hidden overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/40 blur-3xl" />
          <div className="relative">
            <Logo />
          </div>
          <div className="relative my-auto max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/10 px-3 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" /> Built for better campaigns
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight">
              Find the right creator. Book with confidence.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-background/70">
              Compare clear packages, real availability and audience data in one place.
            </p>
            <ul className="mt-9 space-y-4 text-sm text-background/85">
              {[
                "Verified creators and transparent pricing",
                "Real-time service capacity and schedules",
                "One place for every campaign request",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/10">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-background/50">© 2026 Reklama.uz</p>
        </section>

        {/* Right panel — form */}
        <section className="flex flex-col p-6 sm:p-10 lg:p-14">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="mx-auto my-auto w-full max-w-md py-10 lg:py-0">
            {/* Mode toggle */}
            <div className="rounded-xl bg-muted p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => updateMode("login")}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    !isSignup ? "bg-card shadow-soft" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => updateMode("signup")}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    isSignup ? "bg-card shadow-soft" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Create account
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-3xl font-extrabold">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {isSignup
                  ? "Start booking creator advertising in a few minutes."
                  : "Log in to manage your campaigns and bookings."}
              </p>
            </div>

            {/* Google — UI only, not connected */}
            <Button type="button" variant="outline" className="mt-7 h-11 w-full" disabled>
              <GoogleMark />
              <span className="ml-2">Continue with Google</span>
            </Button>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              or continue with email
            </div>

            <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
              {/* Role selector — signup only */}
              {isSignup && (
                <div className="space-y-2">
                  <Label>I am a…</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: "CLIENT", label: "Business / Brand", icon: Store },
                        { value: "INFLUENCER", label: "Creator / Influencer", icon: UserRound },
                      ] as const
                    ).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-colors",
                          role === value
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border bg-background hover:border-primary/40",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignup && (
                    <button
                      type="button"
                      className="text-xs font-medium text-accent-foreground hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder="At least 8 characters"
                    className="pl-10 pr-10"
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignup && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  By creating an account, you agree to the Terms of Service and Privacy Policy.
                </p>
              )}

              {error && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading
                  ? isSignup
                    ? "Creating account…"
                    : "Logging in…"
                  : isSignup
                    ? "Create account"
                    : "Log in"}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "New to Reklama.uz?"}{" "}
              <button
                type="button"
                onClick={() => updateMode(isSignup ? "login" : "signup")}
                className="font-semibold text-accent-foreground hover:underline"
              >
                {isSignup ? "Log in" : "Create an account"}
              </button>
            </p>
          </div>
          <Link to="/" className="text-center text-sm text-muted-foreground hover:text-foreground">
            ← Back to homepage
          </Link>
        </section>
      </div>
    </main>
  );
}
