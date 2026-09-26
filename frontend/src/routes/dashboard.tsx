import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarDays,
  LayoutDashboard,
  ReceiptText,
  Store,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DashShell } from "@/components/dash-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  apiFetch,
  type AvailabilityBlockResponse,
  type BookingResponse,
} from "@/lib/api";
import {
  type AuthSession,
  clearSession,
  getSession,
  SESSION_CHANGED_EVENT,
} from "@/lib/auth";
import { common } from "@/lib/i18n/common";
import { dashboard as t } from "@/lib/i18n/dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: t.pageTitle }],
  }),
  component: Dashboard,
});

const NAV = [{ label: t.navOverview, to: "/dashboard", active: true }];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookings", "my"],
    queryFn: () => apiFetch<BookingResponse[]>("/api/bookings/my"),
    enabled: ready && !!session,
  });

  const isInfluencer = session?.user.role === "INFLUENCER";

  const { data: blockedDates } = useQuery({
    queryKey: ["availability", "me"],
    queryFn: () =>
      apiFetch<AvailabilityBlockResponse[]>("/api/availability/me"),
    enabled: ready && !!session && isInfluencer,
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
  const selectedDates = (blockedDates ?? []).map(
    (b) => new Date(`${b.date}T00:00:00`),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleAvailabilityToggle = (date: Date) => {
    const key = toDateKey(date);
    if (blockedDateKeys.has(key)) {
      unblockMutation.mutate(key);
    } else {
      blockMutation.mutate(key);
    }
  };

  if (!ready || !session) return null;

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
              {isInfluencer ? (
                <UserRound className="h-6 w-6" />
              ) : (
                <Store className="h-6 w-6" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-bold">{session.user.email}</p>
                <BadgeCheck className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {isInfluencer ? t.roleInfluencer : t.roleBusiness}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            {common.logOut}
          </Button>
        </div>

        {/* Bookings section */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">
                {isInfluencer ? t.incoming : t.myCampaigns}
              </p>
              <h2 className="mt-0.5 font-display text-2xl font-bold">
                {isInfluencer ? t.bookingRequests : t.yourBookings}
              </h2>
            </div>
            {!isInfluencer && (
              <Button asChild variant="outline">
                <Link to="/discover">{t.findCreators}</Link>
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
              {error instanceof Error ? error.message : t.couldNotLoadBookings}
            </p>
          )}

          {!isLoading && !error && (!bookings || bookings.length === 0) && (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-soft">
              <ReceiptText className="h-8 w-8 text-muted-foreground/40" />
              <p className="font-semibold">{t.noBookingsYet}</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {isInfluencer
                  ? t.noBookingsInfluencerHint
                  : t.noBookingsBusinessHint}
              </p>
              {!isInfluencer && (
                <Button asChild className="mt-2">
                  <Link to="/discover">{t.discoverCreators}</Link>
                </Button>
              )}
            </div>
          )}

          {!isLoading && !error && bookings && bookings.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-3xl border border-border shadow-soft">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">{t.tableReference}</th>
                    <th className="hidden px-5 py-3 sm:table-cell">
                      {t.tableDate}
                    </th>
                    <th className="px-5 py-3">{t.tableAmount}</th>
                    <th className="px-5 py-3">{t.tableStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          #{String(booking.id).padStart(5, "0")}
                          {booking.birthday_recipient && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-900/20 dark:text-pink-400">
                              🎂 Tabrik
                            </span>
                          )}
                        </p>
                        {booking.birthday_recipient ? (
                          <div className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
                            <p>{booking.birthday_recipient} · {booking.recipient_phone}</p>
                            {booking.delivery_datetime && (
                              <p>Yetkazib berish: {booking.delivery_datetime.replace("T", " ")}</p>
                            )}
                          </div>
                        ) : booking.description ? (
                          <p className="mt-0.5 max-w-[200px] truncate text-xs text-muted-foreground">
                            {booking.description}
                          </p>
                        ) : null}
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
                        <StatusBadge
                          status={capitalizeStatus(booking.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {isInfluencer && (
          <section>
            <p className="text-sm font-medium text-primary">
              {t.calendarLabel}
            </p>
            <h2 className="mt-0.5 font-display text-2xl font-bold">
              {t.manageAvailability}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.availabilityHint}
            </p>
            <div className="mt-4 inline-block rounded-3xl border border-border bg-card p-2 shadow-soft">
              <Calendar
                mode="single"
                selected={undefined}
                onSelect={(date) => date && handleAvailabilityToggle(date)}
                disabled={[{ before: today }]}
                modifiers={{ blocked: selectedDates }}
                modifiersClassNames={{
                  blocked: "bg-destructive/15 text-destructive",
                }}
              />
            </div>
          </section>
        )}
      </div>
    </DashShell>
  );
}

function capitalizeStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
