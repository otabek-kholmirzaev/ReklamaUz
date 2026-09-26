# Reklama.uz

**Influencer advertising marketplace for Uzbekistan**
**Live demo:** https://reklama-uz.lovable.app/

---

## What it does

Reklama.uz is a two-sided marketplace that connects brands with local creators. Brands browse verified influencer profiles, compare transparent ad packages, pick a date on a real availability calendar, and complete a booking in minutes — no DMs, no cold outreach, no guesswork on pricing.

Creators get their own studio to set services, manage their calendar, and track incoming bookings from a dashboard.

A built-in **AI Campaign Copilot** (GPT-4.1-mini) helps brands plan campaigns and find the right creator for their goals.

---

## Key features

- Creator discovery with category, platform, and follower-range filters
- Per-creator service packages with live availability calendar
- 3-step booking wizard (review → details → payment)
- **Tug'ilgan kun tabrigi** — dedicated flow for personalized celebrity birthday videos delivered via Telegram
- Creator Studio — manage profile, services, blocked dates, and avatar upload
- JWT-based auth with email + OTP verification and **Google OAuth**
- AI Campaign Copilot chat
- Wishlist and booking notifications

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | TanStack Start (React 19, SSR), TanStack Router, Tailwind CSS v4, shadcn/ui |
| Backend | Python 3.10, FastAPI, SQLite, custom HMAC-SHA256 JWT |
| Auth | Email + OTP (Resend), Google OAuth 2.0 |
| AI | OpenAI GPT-4.1-mini via Node.js/Express chat server |
| Tooling | Bun, Vite, TypeScript |

---

## Business domain

**Market:** Uzbekistan influencer advertising is largely unstructured — deals happen over Instagram DMs with no standard pricing, no availability transparency, and no paper trail.

**Solution:** A booking platform modeled after Booking.com — structured packages, upfront prices, real-time availability, and a confirmed booking record for both sides.

**Revenue model:** Transaction fee on each confirmed booking.

**Unique angle:** Localized for the Uzbek market with Uzbek-language UI, local platforms (Telegram, Instagram), and a niche product type (Tug'ilgan kun tabrigi celebrity birthday videos) that has no direct competitor.

---

## Run locally

```bash
# Backend
.venv310/bin/uvicorn backend.main:app --reload --port 8000

# Frontend
cd frontend && bun install && bun run dev
```

Copy `backend/.env.example` to `backend/.env` and fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, and `JWT_SECRET`.
