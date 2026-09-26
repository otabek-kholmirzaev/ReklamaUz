import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, LayoutDashboard, ReceiptText, Store, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { DashShell } from "@/components/dash-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { apiFetch, type BookingResponse } from "@/lib/api";
import { type AuthSession, clearSession, getSession, SESSION_CHANGED_EVENT } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Reklama.uz" }],
  }),
  component: Dashboard,
});

const NAV = [{ label: "Overview", to: "/dashboard", active: true }];

function Dashboard() {
  const navigate = useNavigate();
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  // Client-only auth check — localStorage unavailable during SSR
  useEffect(() => {
    const s = getSession();
    setSessionState(s);
    setReady(true);
    if (!s) void navigate({ to: "/auth", search: { mode: "login" } });
  }, [navigate]);

  useEffect(() => {
    const handler = () => {
      const s = getSession();
      setSessionState(s);
      if (!s) void navigate({ to: "/auth", search: { mode: "login" } });
    };
    window.addEventListener(SESSION_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, handler);
  }, [navigate]);

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["bookings", "my"],
    queryFn: () => apiFetch<BookingResponse[]>("/api/bookings/my"),
    enabled: ready && !!session,
  });

  if (!ready || !session) return null;

  const isInfluencer = session.user.role === "INFLUENCER";

  const handleLogout = () => {
    clearSession();
    void navigate({ to: "/" });
  };

  return (
    <DashShell items={NAV}>
      <div className="space-y-8 max-w-4xl">
        {/* User card */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              {isInfluencer ? <UserRound className="h-6 w-6" /> : <Store className="h-6 w-6" />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-bold">{session.user.email}</p>
                <BadgeCheck className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {isInfluencer ? "Creator / Influencer" : "Business / Brand"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        {/* Bookings section */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">
                {isInfluencer ? "Incoming" : "My campaigns"}
              </p>
              <h2 className="mt-0.5 font-display text-2xl font-bold">
                {isInfluencer ? "Booking requests" : "Your bookings"}
              </h2>
            </div>
            {!isInfluencer && (
              <Button asChild variant="outline">
                <Link to="/discover">Find creators</Link>
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load bookings."}
            </p>
          )}

          {!isLoading && !error && (!bookings || bookings.length === 0) && (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-soft">
              <ReceiptText className="h-8 w-8 text-muted-foreground/40" />
              <p className="font-semibold">No bookings yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {isInfluencer
                  ? "Brands that discover and book your services will appear here."
                  : "Find a creator, pick a service, choose a date, and send your first request."}
              </p>
              {!isInfluencer && (
                <Button asChild className="mt-2">
                  <Link to="/discover">Discover creators</Link>
                </Button>
              )}
            </div>
          )}

          {!isLoading && !error && bookings && bookings.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-3xl border border-border shadow-soft">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Reference</th>
                    <th className="hidden px-5 py-3 sm:table-cell">Date</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          #{String(booking.id).padStart(5, "0")}
                        </p>
                        {booking.description && (
                          <p className="mt-0.5 max-w-[200px] truncate text-xs text-muted-foreground">
                            {booking.description}
                          </p>
                        )}
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          {booking.date}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        ${booking.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={capitalizeStatus(booking.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashShell>
  );
}

function capitalizeStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
