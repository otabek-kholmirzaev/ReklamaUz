const apiBaseUrl = (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type AuthUser = {
  id: number;
  email: string;
  role: "CLIENT" | "INFLUENCER";
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

const STORAGE_KEY = "reklama-session";
export const SESSION_CHANGED_EVENT = "reklama:session";

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT));
}

async function authRequest(path: string, body: object): Promise<AuthSession> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Make sure the backend is running.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    const detail = payload?.detail;
    if (typeof detail === "string") throw new Error(detail);
    if (response.status === 409) throw new Error("An account with this email already exists.");
    if (response.status === 401) throw new Error("Invalid email or password.");
    throw new Error("Something went wrong. Please try again.");
  }

  return {
    accessToken: payload.access_token as string,
    user: {
      id: payload.user.id as number,
      email: payload.user.email as string,
      role: payload.user.role as "CLIENT" | "INFLUENCER",
    },
  };
}

export function signup(
  email: string,
  password: string,
  role: "CLIENT" | "INFLUENCER",
): Promise<AuthSession> {
  return authRequest("/api/users/signup", { email, password, role });
}

export function signin(email: string, password: string): Promise<AuthSession> {
  return authRequest("/api/users/signin", { email, password });
}
