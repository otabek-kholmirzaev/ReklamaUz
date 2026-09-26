const STORAGE_KEY = "reklama-wishlist";
export const WISHLIST_EVENT = "reklama:wishlist";

export function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveWishlist(usernames: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usernames));
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));
}

export function isWishlisted(username: string): boolean {
  return getWishlist().includes(username);
}

/** Toggles the given username and returns whether it's now wishlisted. */
export function toggleWishlist(username: string): boolean {
  const current = getWishlist();
  const wishlisted = current.includes(username);
  saveWishlist(
    wishlisted ? current.filter((u) => u !== username) : [...current, username],
  );
  return !wishlisted;
}
