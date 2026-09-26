# Reklama.uz — Frontend

React 19 SSR app built with TanStack Start. Serves the creator marketplace UI: discovery, booking, creator studio, dashboard, AI copilot, and auth.

**Live:** https://reklama-uz.lovable.app/

## Stack

- **TanStack Start** — SSR + file-based routing (TanStack Router)
- **React 19** + TypeScript
- **Tailwind CSS v4** + shadcn/ui (Radix primitives)
- **TanStack Query** — server state, mutations
- **Bun** + Vite

## Run locally

Requires [Bun](https://bun.sh).

```bash
cd frontend
bun install
bun run dev
```

Vite starts on port `8081` if `8080` is occupied (e.g. by Zookeeper).

## Environment

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | FastAPI backend URL (default `http://localhost:8000`) |
| `VITE_API_BASE_URL` | AI Copilot chat server URL (default `http://localhost:3001`) |

## Routes

| Path | Description |
|---|---|
| `/` | Homepage |
| `/discover` | Creator search + filters |
| `/creator/:username` | Creator profile + booking dialog |
| `/auth` | Login / signup / Google OAuth callback |
| `/dashboard` | Booking history, availability calendar |
| `/studio` | Creator Studio — profile, services, schedule |
| `/copilot` | AI Campaign Copilot chat |
| `/become-a-creator` | Creator application form |
| `/wishlist` | Saved creators |

## Key conventions

- All auth state lives in `localStorage` via `src/lib/auth.ts`; SSR-safe (reads only in `useEffect`)
- API calls go through `src/lib/api.ts` (`apiFetch`) which attaches the Bearer token automatically
- UI strings are in `src/lib/i18n/` (Uzbek)
