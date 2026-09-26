import { clearSession, getSession } from "@/lib/auth";

const apiBaseUrl = (
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export type BookingResponse = {
  id: number;
  client_id: number;
  influencer_id: number;
  service_id: number;
  date: string;
  price: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type AvailabilityBlockResponse = {
  id: number;
  influencer_id: number;
  date: string;
  created_at: string;
};

export type AvailabilityResponse = {
  blocked_dates: string[];
  booked_dates: string[];
};

export type CategoryResponse = {
  id: number;
  name: string;
};

export type AdTypeResponse = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type AdServiceResponse = {
  id: number;
  user_id: number;
  ad_type_id: number;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InfluencerProfileResponse = {
  id: number;
  user_id: number;
  username: string;
  display_name: string;
  bio: string | null;
  category_id: number;
  location: string | null;
  avatar_url: string | null;
  available_from: string | null;
  available_to: string | null;
  phone: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_url: string | null;
  telegram_handle: string | null;
  followers_range: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicInfluencerProfileResponse = InfluencerProfileResponse & {
  category_name: string;
};

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const session = getSession();
  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Could not reach the server. Make sure the backend is running.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) clearSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = (await response.json().catch(() => null)) as any;
    const detail = payload?.detail;
    throw new Error(
      typeof detail === "string" ? detail : `API error ${response.status}`,
    );
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
