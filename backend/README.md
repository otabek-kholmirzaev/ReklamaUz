# ReklamaUz API

FastAPI + SQLite authentication API. Email verification is intentionally not required yet.

## Run locally

From the repository root:

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

The SQLite database is created at `backend/reklama.db` on first startup. The 20 influencer categories are seeded automatically and safely on every startup. Set `JWT_SECRET` before using this outside local development.

## Endpoints

### `POST /api/users/signup`

```json
{
  "email": "creator@example.com",
  "password": "strong-password",
  "role": "INFLUENCER"
}
```

Allowed roles are `CLIENT` and `INFLUENCER`. A successful response returns a JWT access token and the public user record.

### `POST /api/users/signin`

```json
{
  "email": "creator@example.com",
  "password": "strong-password"
}
```
