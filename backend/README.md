# Reklama.uz — Backend

FastAPI + SQLite REST API. Handles auth, influencer profiles, ad services, bookings, and availability.

## Stack

- **Python 3.10**, FastAPI, Uvicorn
- **SQLite** — single-file DB at `backend/reklama.db`
- **Custom JWT** — HMAC-SHA256, no third-party JWT lib
- **Resend** — transactional email (OTP verification)
- **httpx** — Google OAuth token exchange

## Run locally

From the repository root (must use the Python 3.10 venv):

```bash
.venv310/bin/uvicorn backend.main:app --reload --port 8000
```

The DB and all tables are created automatically on first startup. Categories and ad types are seeded idempotently on every start.

## Environment

Create `backend/.env`:

```env
JWT_SECRET=change-me-in-production
FRONTEND_URL=http://localhost:8081

# Email verification (Resend)
RESEND_API_KEY=re_...

# Google OAuth
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

## API overview

### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users/signup` | Start email signup — sends OTP |
| `POST` | `/api/users/verify-email` | Verify OTP, create user, return JWT |
| `POST` | `/api/users/signin` | Email + password login, return JWT |
| `GET` | `/api/auth/google` | Redirect to Google consent screen |
| `GET` | `/api/auth/google/callback` | Exchange code, upsert user, redirect to frontend with JWT |

### Influencer profiles
| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/influencer-profiles` | INFLUENCER |
| `PATCH` | `/api/influencer-profiles/me` | INFLUENCER |
| `GET` | `/api/influencer-profiles` | Public |
| `GET` | `/api/influencer-profiles/:username` | Public |
| `GET` | `/api/influencer-profiles/:username/services` | Public |

### Bookings
| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/bookings` | CLIENT |
| `GET` | `/api/bookings/my` | Any |
| `GET` | `/api/bookings/:id` | Owner |
| `PATCH` | `/api/bookings/:id` | Owner |

Bookings support birthday video fields: `birthday_greeting`, `birthday_recipient`, `delivery_datetime`, `recipient_phone`.

### Availability
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/availability/:user_id` | Public |
| `GET` | `/api/availability/me` | INFLUENCER |
| `POST` | `/api/availability` | INFLUENCER |
| `DELETE` | `/api/availability/:date` | INFLUENCER |

### Other
- `GET /api/categories` — influencer categories
- `GET /api/ad-types` — ad types (INSTAGRAM_POST, BIRTHDAY_WISH, etc.)
- `GET /uploads/:filename` — static avatar files
