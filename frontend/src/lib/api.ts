import { getSession } from "@/lib/auth";

const apiBaseUrl = (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

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

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  } catch {
    throw new Error("Could not reach the server. Make sure the backend is running.");
  }

  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = (await response.json().catch(() => null)) as any;
    const detail = payload?.detail;
    throw new Error(typeof detail === "string" ? detail : `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}
