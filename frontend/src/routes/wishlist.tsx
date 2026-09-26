import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { CreatorCard } from "@/components/creator-card";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { creators } from "@/lib/data";
import { wishlistText as t } from "@/lib/i18n/wishlist";
import { getWishlist, WISHLIST_EVENT } from "@/lib/wishlist";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: t.pageTitle },
      {
        name: "description",
        content: t.description,
      },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const [usernames, setUsernames] = useState<string[]>([]);

  useEffect(() => {
    const load = () => setUsernames(getWishlist());
    load();
    window.addEventListener(WISHLIST_EVENT, load);
    return () => window.removeEventListener(WISHLIST_EVENT, load);
  }, []);

  const saved = usernames
    .map((username) => creators.find((c) => c.username === username))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div>
          <p className="text-sm font-medium text-primary">{t.savedForLater}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
            {t.heading}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">{t.subtitle}</p>
        </div>

        {saved.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-soft">
            <Heart className="h-8 w-8 text-muted-foreground/40" />
            <p className="font-semibold">{t.emptyTitle}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {t.emptyHint}
            </p>
            <Button asChild className="mt-2">
              <Link to="/discover">{t.browseCreators}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((creator) => (
              <CreatorCard key={creator.username} creator={creator} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
