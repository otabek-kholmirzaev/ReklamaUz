import { Link } from "@tanstack/react-router";
import { BadgeCheck, Heart, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { Creator } from "@/lib/data";
import { CATEGORY_LABELS, translateEnum } from "@/lib/i18n/enums";
import { creatorContent as t } from "@/lib/i18n/creators";
import { cn } from "@/lib/utils";
import { isWishlisted, toggleWishlist, WISHLIST_EVENT } from "@/lib/wishlist";

export function CreatorCard({ creator }: { creator: Creator }) {
  const [fav, setFav] = useState(() => isWishlisted(creator.username));

  useEffect(() => {
    const handler = () => setFav(isWishlisted(creator.username));
    window.addEventListener(WISHLIST_EVENT, handler);
    return () => window.removeEventListener(WISHLIST_EVENT, handler);
  }, [creator.username]);

  const from = Math.min(...creator.services.map((s) => s.price));

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link
          to="/creator/$username"
          params={{ username: creator.username }}
          className="block h-full w-full"
          aria-label={t.viewProfile(creator.name)}
        >
          <img
            src={creator.photo}
            alt={creator.name}
            loading="lazy"
            width={768}
            height={960}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <button
          onClick={(event) => {
            event.preventDefault();
            setFav(toggleWishlist(creator.username));
          }}
          aria-label={fav ? t.removeFromWishlist : t.addToWishlist}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-background"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              fav ? "fill-primary text-primary" : "text-foreground",
            )}
          />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {creator.platforms.slice(0, 3).map((p) => (
            <span
              key={p}
              className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <Link
        to="/creator/$username"
        params={{ username: creator.username }}
        className="block space-y-3 p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t.viewProfile(creator.name)}
      >
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-semibold">
              @{creator.username}
            </span>
            {creator.verified && (
              <BadgeCheck className="h-4 w-4 text-primary" />
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {creator.rating}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {creator.name} • {translateEnum(CATEGORY_LABELS, creator.category)}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span>
            <strong className="font-semibold">{creator.followers}</strong>{" "}
            <span className="text-muted-foreground">{t.followers}</span>
          </span>
          <span>
            <strong className="font-semibold">{creator.engagement}</strong>{" "}
            <span className="text-muted-foreground">{t.engagementShort}</span>
          </span>
        </div>

        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {creator.location}
        </p>

        <div className="border-t border-border pt-3">
          <p className="text-sm">
            <span className="text-muted-foreground">{t.from} </span>
            <strong className="font-display text-base font-bold">
              ${from}
            </strong>
          </p>
        </div>
      </Link>
    </article>
  );
}
