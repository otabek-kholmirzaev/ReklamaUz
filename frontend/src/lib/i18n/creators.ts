// Uzbek strings for src/lib/data.ts mock creator content, and shared display
// helpers for creator-facing pages (creator-card.tsx, discover.tsx, matches.tsx,
// creator.$username.tsx). Category/tag/platform VALUES stay in English in
// data.ts (they double as filter/match keys and mirror the backend's category
// names) — translate them for display with `translateEnum(CATEGORY_LABELS, …)`
// from `enums.ts` wherever they're rendered, never by editing the stored value.
export const creatorContent = {
  thisMonth: "shu oy",
  viewProfile: (name: string) => `${name} profilini ko‘rish`,
  addToWishlist: "Sevimlilarga qo‘shish",
  removeFromWishlist: "Sevimlilardan olib tashlash",
  followers: "obunachi",
  engagementShort: "faollik",
  from: "Boshlang‘ich narx",
};
