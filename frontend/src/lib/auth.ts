import { errors } from "@/lib/i18n/errors";

export const apiBaseUrl = (
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

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

async function post<T>(path: string, body: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(errors.couldNotReachServer);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    const detail = payload?.detail;
    if (typeof detail === "string") throw new Error(detail);
    if (response.status === 409) throw new Error(errors.accountAlreadyExists);
    if (response.status === 401) throw new Error(errors.invalidCredentials);
    if (response.status === 410) throw new Error(errors.verificationExpired);
    if (response.status === 422)
      throw new Error(payload?.detail ?? errors.incorrectVerificationCode);
    throw new Error(errors.somethingWentWrong);
  }

  return payload as T;
}

function toSession(payload: {
  access_token: string;
  user: { id: number; email: string; role: string };
}): AuthSession {
  return {
    accessToken: payload.access_token,
    user: {
      id: payload.user.id,
      email: payload.user.email,
      role: payload.user.role as "CLIENT" | "INFLUENCER",
    },
  };
}

export type SignupPending = { status: "verification_sent"; email: string };

export async function signup(
  email: string,
  password: string,
  role: "CLIENT" | "INFLUENCER",
): Promise<SignupPending> {
  return post<SignupPending>("/api/users/signup", { email, password, role });
}

export async function verifyEmail(
  email: string,
  code: string,
): Promise<AuthSession> {
  const payload = await post<{
    access_token: string;
    user: { id: number; email: string; role: string };
  }>("/api/users/verify-email", { email, code });
  return toSession(payload);
}

export async function signin(
  email: string,
  password: string,
): Promise<AuthSession> {
  const payload = await post<{
    access_token: string;
    user: { id: number; email: string; role: string };
  }>("/api/users/signin", { email, password });
  return toSession(payload);
}
