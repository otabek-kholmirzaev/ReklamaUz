from contextlib import asynccontextmanager
from datetime import datetime
import os
import urllib.parse

import httpx
import sqlite3
from dotenv import load_dotenv

load_dotenv()


from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles

from .database import connection_context, init_db
from .email import send_verification_email
from .messages import Messages
from .schemas import (
    AdServiceCreate,
    AdServiceResponse,
    AdServiceUpdate,
    AdTypeResponse,
    AuthResponse,
    AvailabilityBlockCreate,
    AvailabilityBlockResponse,
    AvailabilityResponse,
    BookingCreate,
    BookingResponse,
    BookingStatus,
    BookingStatusUpdate,
    CategoryResponse,
    InfluencerListItemResponse,
    InfluencerProfileResponse,
    PublicInfluencerProfileResponse,
    SignInRequest,
    SignUpRequest,
    SignupPendingResponse,
    UserResponse,
    VerifyEmailRequest,
    _parse_hhmm,
)
from .security import create_access_token, decode_access_token, hash_password, verify_password
from .storage import UPLOADS_DIR, save_avatar


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="ReklamaUz API", version="0.1.0", lifespan=lifespan)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
_frontend_url = os.getenv("FRONTEND_URL", "")
_CORS_ORIGINS = [o.strip() for o in _frontend_url.split(",") if o.strip()]
# In development (no FRONTEND_URL set), allow any localhost port so Vite's auto-port-bump doesn't break auth
_CORS_ORIGIN_REGEX = r"http://localhost:\d+" if not _frontend_url else None
app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_origin_regex=_CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"]
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

bearer_scheme = HTTPBearer(auto_error=False)


def row_to_user(row) -> UserResponse:
    created_at = row["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return UserResponse(id=row["id"], email=row["email"], role=row["role"], created_at=created_at)


def row_to_profile(row) -> InfluencerProfileResponse:
    values = dict(row)
    for field in ("created_at", "updated_at"):
        if isinstance(values[field], str):
            values[field] = datetime.fromisoformat(values[field])
    return InfluencerProfileResponse(**values)


def current_influencer_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.BEARER_TOKEN_REQUIRED)
    try:
        claims = decode_access_token(credentials.credentials)
        user_id = int(claims["sub"])
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.INVALID_OR_EXPIRED_TOKEN)

    with connection_context() as connection:
        user = connection.execute("SELECT id, email, role FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.USER_NO_LONGER_EXISTS)
    if user["role"] != "INFLUENCER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=Messages.ONLY_INFLUENCERS_CAN_MANAGE_PROFILES)
    return dict(user)


@app.post("/api/users/signup", response_model=SignupPendingResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpRequest) -> SignupPendingResponse:
    with connection_context() as connection:
        existing = connection.execute("SELECT id FROM users WHERE email = ?", (payload.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.ACCOUNT_ALREADY_EXISTS)

    password_hash = hash_password(payload.password)
    code = f"{__import__('secrets').randbelow(1_000_000):06d}"
    expires_at = datetime.utcnow() + __import__("datetime").timedelta(minutes=15)

    with connection_context() as connection:
        # Upsert: replace any existing pending verification for this email
        connection.execute(
            "DELETE FROM pending_verifications WHERE email = ?",
            (payload.email,),
        )
        connection.execute(
            "INSERT INTO pending_verifications (email, password_hash, role, code, expires_at) VALUES (?, ?, ?, ?, ?)",
            (payload.email, password_hash, payload.role.value, code, expires_at.isoformat()),
        )
        connection.commit()

    try:
        send_verification_email(payload.email, code)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return SignupPendingResponse(email=payload.email)


@app.post("/api/users/verify-email", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def verify_email(payload: VerifyEmailRequest) -> AuthResponse:
    with connection_context() as connection:
        row = connection.execute(
            "SELECT * FROM pending_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1",
            (payload.email,),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.NO_PENDING_VERIFICATION)

    if datetime.utcnow() > datetime.fromisoformat(row["expires_at"]):
        raise HTTPException(status_code=status.HTTP_410_GONE, detail=Messages.VERIFICATION_CODE_EXPIRED)

    if row["code"] != payload.code:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=Messages.INCORRECT_VERIFICATION_CODE)

    try:
        with connection_context() as connection:
            cursor = connection.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                (row["email"], row["password_hash"], row["role"]),
            )
            connection.execute("DELETE FROM pending_verifications WHERE email = ?", (payload.email,))
            connection.commit()
            user_row = connection.execute(
                "SELECT id, email, role, created_at FROM users WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
    except Exception as error:
        if "UNIQUE constraint failed: users.email" in str(error):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.ACCOUNT_ALREADY_EXISTS) from error
        raise

    user = row_to_user(user_row)
    return AuthResponse(access_token=create_access_token(user.id, user.email, user.role), user=user)


@app.post("/api/users/signin", response_model=AuthResponse)
def signin(payload: SignInRequest) -> AuthResponse:
    with connection_context() as connection:
        row = connection.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()

    if row is None or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.INVALID_CREDENTIALS)

    user = row_to_user(row)
    return AuthResponse(access_token=create_access_token(user.id, user.email, user.role), user=user)


@app.get("/api/auth/google")
def google_login(state: str = "") -> RedirectResponse:
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=Messages.GOOGLE_OAUTH_NOT_CONFIGURED)
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": state,
    }
    return RedirectResponse("https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params))


@app.get("/api/auth/google/callback")
def google_callback(code: str = "", error: str = "", state: str = "") -> RedirectResponse:
    # Use `state` as the frontend origin so any localhost port works in dev
    frontend_origin = state or _frontend_url or "http://localhost:8081"

    if error or not code:
        return RedirectResponse(f"{frontend_origin}/auth?mode=login&google_error=cancelled")

    try:
        token_resp = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        token_resp.raise_for_status()
        tokens = token_resp.json()
    except Exception:
        return RedirectResponse(f"{frontend_origin}/auth?mode=login&google_error=token_exchange_failed")

    try:
        userinfo_resp = httpx.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
            timeout=10,
        )
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()
    except Exception:
        return RedirectResponse(f"{frontend_origin}/auth?mode=login&google_error=userinfo_failed")

    email: str = userinfo.get("email", "")
    google_id: str = userinfo.get("sub", "")
    if not email:
        return RedirectResponse(f"{frontend_origin}/auth?mode=login&google_error=no_email")

    with connection_context() as conn:
        user_row = conn.execute("SELECT id, email, role FROM users WHERE email = ?", (email,)).fetchone()
        if user_row is None:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, role, google_id) VALUES (?, ?, ?, ?)",
                (email, "", "CLIENT", google_id),
            )
            conn.commit()
            user_row = conn.execute("SELECT id, email, role FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
        else:
            conn.execute(
                "UPDATE users SET google_id = ? WHERE id = ? AND (google_id IS NULL OR google_id = '')",
                (google_id, user_row["id"]),
            )
            conn.commit()

    jwt = create_access_token(user_row["id"], user_row["email"], user_row["role"])
    qs = urllib.parse.urlencode({
        "token": jwt,
        "uid": user_row["id"],
        "email": user_row["email"],
        "role": user_row["role"],
    })
    return RedirectResponse(f"{frontend_origin}/auth?{qs}")


@app.post("/api/influencer-profiles", response_model=InfluencerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_influencer_profile(
    username: str = Form(..., min_length=3, max_length=255),
    display_name: str = Form(..., min_length=1, max_length=255),
    category_id: int = Form(..., gt=0),
    bio: str | None = Form(None),
    location: str | None = Form(None),
    available_from: str | None = Form(None),
    available_to: str | None = Form(None),
    phone: str | None = Form(None),
    instagram_handle: str | None = Form(None),
    tiktok_handle: str | None = Form(None),
    youtube_url: str | None = Form(None),
    telegram_handle: str | None = Form(None),
    followers_range: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    user: dict = Depends(current_influencer_user),
) -> InfluencerProfileResponse:
    avatar_url = await save_avatar(avatar) if avatar else None
    try:
        available_from = _parse_hhmm(available_from) if available_from else None
        available_to = _parse_hhmm(available_to) if available_to else None
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    try:
        with connection_context() as connection:
            cursor = connection.execute(
                """
                INSERT INTO influencer_profiles
                    (user_id, username, display_name, bio, category_id, location, avatar_url, available_from, available_to,
                     phone, instagram_handle, tiktok_handle, youtube_url, telegram_handle, followers_range)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user["id"], username, display_name, bio, category_id, location, avatar_url, available_from, available_to,
                    phone, instagram_handle, tiktok_handle, youtube_url, telegram_handle, followers_range,
                ),
            )
            connection.commit()
            row = connection.execute("SELECT * FROM influencer_profiles WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except sqlite3.IntegrityError as error:
        message = str(error)
        if "influencer_profiles.user_id" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.PROFILE_ALREADY_EXISTS) from error
        if "influencer_profiles.username" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.USERNAME_TAKEN) from error
        if "FOREIGN KEY" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.CATEGORY_NOT_FOUND) from error
        raise
    return row_to_profile(row)


@app.get("/api/influencer-profiles/me", response_model=InfluencerProfileResponse)
def get_my_influencer_profile(
    user: dict = Depends(current_influencer_user),
) -> InfluencerProfileResponse:
    with connection_context() as connection:
        row = connection.execute(
            "SELECT * FROM influencer_profiles WHERE user_id = ?", (user["id"],)
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.NO_PROFILE_YET)
    return row_to_profile(row)


@app.patch("/api/influencer-profiles/me", response_model=InfluencerProfileResponse)
async def update_influencer_profile(
    username: str | None = Form(None, min_length=3, max_length=255),
    display_name: str | None = Form(None, min_length=1, max_length=255),
    category_id: int | None = Form(None, gt=0),
    bio: str | None = Form(None),
    location: str | None = Form(None),
    available_from: str | None = Form(None),
    available_to: str | None = Form(None),
    phone: str | None = Form(None),
    instagram_handle: str | None = Form(None),
    tiktok_handle: str | None = Form(None),
    youtube_url: str | None = Form(None),
    telegram_handle: str | None = Form(None),
    followers_range: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    user: dict = Depends(current_influencer_user),
) -> InfluencerProfileResponse:
    try:
        if available_from is not None:
            available_from = _parse_hhmm(available_from)
        if available_to is not None:
            available_to = _parse_hhmm(available_to)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    updates = {
        field: value
        for field, value in {
            "username": username,
            "display_name": display_name,
            "category_id": category_id,
            "bio": bio,
            "location": location,
            "available_from": available_from,
            "available_to": available_to,
            "phone": phone,
            "instagram_handle": instagram_handle,
            "tiktok_handle": tiktok_handle,
            "youtube_url": youtube_url,
            "telegram_handle": telegram_handle,
            "followers_range": followers_range,
        }.items()
        if value is not None
    }
    if avatar:
        updates["avatar_url"] = await save_avatar(avatar)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=Messages.AT_LEAST_ONE_PROFILE_FIELD_REQUIRED)

    allowed_fields = (
        "username", "display_name", "bio", "category_id", "location", "avatar_url", "available_from", "available_to",
        "phone", "instagram_handle", "tiktok_handle", "youtube_url", "telegram_handle", "followers_range",
    )
    assignments = ", ".join(f"{field} = ?" for field in updates if field in allowed_fields)
    values = [updates[field] for field in updates if field in allowed_fields]
    values.extend([datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), user["id"]])

    try:
        with connection_context() as connection:
            cursor = connection.execute(
                f"UPDATE influencer_profiles SET {assignments}, updated_at = ? WHERE user_id = ?",
                values,
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.PROFILE_NOT_FOUND)
            connection.commit()
            row = connection.execute("SELECT * FROM influencer_profiles WHERE user_id = ?", (user["id"],)).fetchone()
    except sqlite3.IntegrityError as error:
        message = str(error)
        if "influencer_profiles.username" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.USERNAME_TAKEN) from error
        if "FOREIGN KEY" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.CATEGORY_NOT_FOUND) from error
        raise
    return row_to_profile(row)


@app.get("/api/categories", response_model=list[CategoryResponse])
def get_categories() -> list[CategoryResponse]:
    with connection_context() as connection:
        rows = connection.execute("SELECT id, name FROM categories ORDER BY name ASC").fetchall()
    return [CategoryResponse(id=row["id"], name=row["name"]) for row in rows]


def row_to_public_profile(row) -> PublicInfluencerProfileResponse:
    values = dict(row)
    for field in ("created_at", "updated_at"):
        if isinstance(values[field], str):
            values[field] = datetime.fromisoformat(values[field])
    return PublicInfluencerProfileResponse(**values)


def row_to_influencer_list_item(row) -> InfluencerListItemResponse:
    values = dict(row)
    for field in ("created_at", "updated_at"):
        if isinstance(values[field], str):
            values[field] = datetime.fromisoformat(values[field])
    return InfluencerListItemResponse(**values)


@app.get("/api/influencer-profiles", response_model=list[InfluencerListItemResponse])
def list_influencer_profiles(
    category_id: int | None = None,
    q: str | None = None,
) -> list[InfluencerListItemResponse]:
    query = """
        SELECT influencer_profiles.*, categories.name AS category_name,
            (SELECT MIN(price) FROM ad_services
             WHERE ad_services.user_id = influencer_profiles.user_id AND ad_services.is_active = 1) AS price_from
        FROM influencer_profiles
        JOIN categories ON categories.id = influencer_profiles.category_id
        WHERE 1 = 1
    """
    params: list = []
    if category_id is not None:
        query += " AND influencer_profiles.category_id = ?"
        params.append(category_id)
    if q:
        query += """ AND (
            influencer_profiles.display_name LIKE ? ESCAPE '\\'
            OR influencer_profiles.username LIKE ? ESCAPE '\\'
            OR influencer_profiles.location LIKE ? ESCAPE '\\'
            OR influencer_profiles.bio LIKE ? ESCAPE '\\'
        )"""
        like = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
        params.extend([like, like, like, like])
    query += " ORDER BY influencer_profiles.created_at DESC"

    with connection_context() as connection:
        rows = connection.execute(query, params).fetchall()
    return [row_to_influencer_list_item(row) for row in rows]


@app.get("/api/influencer-profiles/{username}", response_model=PublicInfluencerProfileResponse)
def get_public_influencer_profile(username: str) -> PublicInfluencerProfileResponse:
    with connection_context() as connection:
        row = connection.execute(
            """
            SELECT influencer_profiles.*, categories.name AS category_name
            FROM influencer_profiles
            JOIN categories ON categories.id = influencer_profiles.category_id
            WHERE influencer_profiles.username = ?
            """,
            (username,),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.CREATOR_NOT_FOUND)
    return row_to_public_profile(row)


@app.get("/api/influencer-profiles/{username}/services", response_model=list[AdServiceResponse])
def get_public_influencer_services(username: str) -> list[AdServiceResponse]:
    with connection_context() as connection:
        profile = connection.execute(
            "SELECT user_id FROM influencer_profiles WHERE username = ?", (username,)
        ).fetchone()
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.CREATOR_NOT_FOUND)
        rows = connection.execute(
            "SELECT * FROM ad_services WHERE user_id = ? AND is_active = 1 ORDER BY price ASC",
            (profile["user_id"],),
        ).fetchall()
    return [row_to_ad_service(row) for row in rows]


@app.get("/api/ad-types", response_model=list[AdTypeResponse])
def get_ad_types() -> list[AdTypeResponse]:
    with connection_context() as connection:
        rows = connection.execute(
            "SELECT id, name, created_at, updated_at FROM ad_types ORDER BY id ASC"
        ).fetchall()
        return [
            AdTypeResponse(
                id=row["id"],
                name=row["name"],
                created_at=datetime.fromisoformat(row["created_at"]) if isinstance(row["created_at"], str) else row["created_at"],
                updated_at=datetime.fromisoformat(row["updated_at"]) if isinstance(row["updated_at"], str) else row["updated_at"],
            )
            for row in rows
        ]


def row_to_ad_service(row) -> AdServiceResponse:
    values = dict(row)
    for field in ("created_at", "updated_at"):
        if isinstance(values[field], str):
            values[field] = datetime.fromisoformat(values[field])
    values["is_active"] = bool(values["is_active"])
    return AdServiceResponse(**values)


def current_authenticated_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.BEARER_TOKEN_REQUIRED)
    try:
        claims = decode_access_token(credentials.credentials)
        user_id = int(claims["sub"])
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.INVALID_OR_EXPIRED_TOKEN)

    with connection_context() as connection:
        user = connection.execute("SELECT id, email, role FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.USER_NO_LONGER_EXISTS)
    if user["role"] != "INFLUENCER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=Messages.ONLY_INFLUENCERS_CAN_MANAGE_AD_SERVICES)
    return dict(user)


@app.get("/api/ad-services/me", response_model=list[AdServiceResponse])
def get_my_ad_services(
    user: dict = Depends(current_authenticated_user),
) -> list[AdServiceResponse]:
    with connection_context() as connection:
        rows = connection.execute(
            "SELECT * FROM ad_services WHERE user_id = ? ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
    return [row_to_ad_service(row) for row in rows]


@app.post("/api/ad-services", response_model=AdServiceResponse, status_code=status.HTTP_201_CREATED)
def create_ad_service(
    payload: AdServiceCreate,
    user: dict = Depends(current_authenticated_user),
) -> AdServiceResponse:
    try:
        with connection_context() as connection:
            cursor = connection.execute(
                """
                INSERT INTO ad_services (user_id, ad_type_id, title, description, price, currency)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (user["id"], payload.ad_type_id, payload.title, payload.description, payload.price, payload.currency),
            )
            connection.commit()
            row = connection.execute("SELECT * FROM ad_services WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except sqlite3.IntegrityError as error:
        message = str(error)
        if "FOREIGN KEY" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.AD_TYPE_NOT_FOUND) from error
        raise
    return row_to_ad_service(row)


@app.patch("/api/ad-services/{service_id}", response_model=AdServiceResponse)
def update_ad_service(
    service_id: int,
    payload: AdServiceUpdate,
    user: dict = Depends(current_authenticated_user),
) -> AdServiceResponse:
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "is_active" in payload.model_dump(exclude_unset=True):
        updates["is_active"] = int(payload.is_active) if payload.is_active is not None else updates.get("is_active")

    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=Messages.AT_LEAST_ONE_FIELD_REQUIRED)

    allowed_fields = ("ad_type_id", "title", "description", "price", "currency", "is_active")
    assignments = ", ".join(f"{field} = ?" for field in updates if field in allowed_fields)
    values = [updates[field] for field in updates if field in allowed_fields]
    values.extend([datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), service_id, user["id"]])

    try:
        with connection_context() as connection:
            cursor = connection.execute(
                f"UPDATE ad_services SET {assignments}, updated_at = ? WHERE id = ? AND user_id = ?",
                values,
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.AD_SERVICE_NOT_FOUND)
            connection.commit()
            row = connection.execute("SELECT * FROM ad_services WHERE id = ?", (service_id,)).fetchone()
    except sqlite3.IntegrityError as error:
        message = str(error)
        if "FOREIGN KEY" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.AD_TYPE_NOT_FOUND) from error
        raise
    return row_to_ad_service(row)


# ---------------------------------------------------------------------------
# Shared auth dependency — any authenticated user (CLIENT or INFLUENCER)
# ---------------------------------------------------------------------------

def current_any_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.BEARER_TOKEN_REQUIRED)
    try:
        claims = decode_access_token(credentials.credentials)
        user_id = int(claims["sub"])
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.INVALID_OR_EXPIRED_TOKEN)

    with connection_context() as connection:
        user = connection.execute("SELECT id, email, role FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=Messages.USER_NO_LONGER_EXISTS)
    return dict(user)


# ---------------------------------------------------------------------------
# Availability
# ---------------------------------------------------------------------------

def row_to_availability_block(row) -> AvailabilityBlockResponse:
    values = dict(row)
    if isinstance(values["created_at"], str):
        values["created_at"] = datetime.fromisoformat(values["created_at"])
    return AvailabilityBlockResponse(**values)


@app.get("/api/availability/me", response_model=list[AvailabilityBlockResponse])
def get_my_availability(
    user: dict = Depends(current_influencer_user),
) -> list[AvailabilityBlockResponse]:
    with connection_context() as connection:
        rows = connection.execute(
            "SELECT * FROM availability_blocks WHERE influencer_id = ? ORDER BY date ASC",
            (user["id"],),
        ).fetchall()
    return [row_to_availability_block(row) for row in rows]


@app.get("/api/availability/{influencer_id}", response_model=AvailabilityResponse)
def get_availability(influencer_id: int) -> AvailabilityResponse:
    with connection_context() as connection:
        blocked_rows = connection.execute(
            "SELECT date FROM availability_blocks WHERE influencer_id = ? ORDER BY date ASC",
            (influencer_id,),
        ).fetchall()
        booked_rows = connection.execute(
            """
            SELECT DISTINCT date FROM bookings
            WHERE influencer_id = ? AND status IN ('PENDING', 'CONFIRMED')
            ORDER BY date ASC
            """,
            (influencer_id,),
        ).fetchall()
    return AvailabilityResponse(
        blocked_dates=[row["date"] for row in blocked_rows],
        booked_dates=[row["date"] for row in booked_rows],
    )


@app.post("/api/availability", response_model=AvailabilityBlockResponse, status_code=status.HTTP_201_CREATED)
def create_availability_block(
    payload: AvailabilityBlockCreate,
    user: dict = Depends(current_influencer_user),
) -> AvailabilityBlockResponse:
    try:
        with connection_context() as connection:
            cursor = connection.execute(
                "INSERT INTO availability_blocks (influencer_id, date) VALUES (?, ?)",
                (user["id"], payload.date),
            )
            connection.commit()
            row = connection.execute("SELECT * FROM availability_blocks WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except sqlite3.IntegrityError as error:
        if "UNIQUE constraint failed" in str(error):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.DATE_ALREADY_BLOCKED) from error
        raise
    return row_to_availability_block(row)


@app.delete("/api/availability/{date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability_block(
    date: str,
    user: dict = Depends(current_influencer_user),
) -> None:
    with connection_context() as connection:
        cursor = connection.execute(
            "DELETE FROM availability_blocks WHERE influencer_id = ? AND date = ?",
            (user["id"], date),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.BLOCKED_DATE_NOT_FOUND)
        connection.commit()


# ---------------------------------------------------------------------------
# Bookings
# ---------------------------------------------------------------------------

def row_to_booking(row) -> BookingResponse:
    values = dict(row)
    for field in ("created_at", "updated_at"):
        if isinstance(values[field], str):
            values[field] = datetime.fromisoformat(values[field])
    return BookingResponse(**values)


@app.post("/api/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    user: dict = Depends(current_any_user),
) -> BookingResponse:
    if user["role"] != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=Messages.ONLY_CLIENTS_CAN_BOOK)

    with connection_context() as connection:
        service = connection.execute(
            "SELECT id, user_id, price, is_active FROM ad_services WHERE id = ?",
            (payload.service_id,),
        ).fetchone()

    if service is None or not service["is_active"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.AD_SERVICE_NOT_FOUND_OR_INACTIVE)

    if service["user_id"] == user["id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=Messages.CANNOT_BOOK_OWN_SERVICE)

    with connection_context() as connection:
        blocked = connection.execute(
            "SELECT 1 FROM availability_blocks WHERE influencer_id = ? AND date = ?",
            (service["user_id"], payload.date),
        ).fetchone()
        if blocked is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.DATE_NOT_AVAILABLE)

        existing = connection.execute(
            """
            SELECT 1 FROM bookings
            WHERE influencer_id = ? AND date = ? AND status IN ('PENDING', 'CONFIRMED')
            """,
            (service["user_id"], payload.date),
        ).fetchone()
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.DATE_ALREADY_BOOKED)

    try:
        with connection_context() as connection:
            cursor = connection.execute(
                """
                INSERT INTO bookings (client_id, influencer_id, service_id, date, price, description,
                    birthday_greeting, birthday_recipient, delivery_datetime, recipient_phone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user["id"], service["user_id"], payload.service_id, payload.date, service["price"],
                    payload.description, payload.birthday_greeting, payload.birthday_recipient,
                    payload.delivery_datetime, payload.recipient_phone,
                ),
            )
            connection.commit()
            row = connection.execute("SELECT * FROM bookings WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error

    return row_to_booking(row)


@app.patch("/api/bookings/{booking_id}", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    user: dict = Depends(current_any_user),
) -> BookingResponse:
    with connection_context() as connection:
        row = connection.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,)).fetchone()

    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.BOOKING_NOT_FOUND)

    booking = dict(row)
    is_influencer = user["id"] == booking["influencer_id"]
    is_client = user["id"] == booking["client_id"]
    if not is_influencer and not is_client:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=Messages.NO_ACCESS_TO_BOOKING)

    if booking["status"] != BookingStatus.PENDING.value:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=Messages.ONLY_PENDING_BOOKINGS_CAN_BE_UPDATED)

    if is_influencer and payload.status not in (BookingStatus.CONFIRMED, BookingStatus.CANCELLED):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=Messages.INFLUENCER_CAN_ONLY_CONFIRM_OR_CANCEL)
    if is_client and payload.status != BookingStatus.CANCELLED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=Messages.CLIENT_CAN_ONLY_CANCEL_BOOKING)

    with connection_context() as connection:
        connection.execute(
            "UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?",
            (payload.status.value, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), booking_id),
        )
        connection.commit()
        row = connection.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,)).fetchone()

    return row_to_booking(row)


@app.get("/api/bookings/my", response_model=list[BookingResponse])
def get_my_bookings(
    user: dict = Depends(current_any_user),
) -> list[BookingResponse]:
    with connection_context() as connection:
        if user["role"] == "CLIENT":
            rows = connection.execute(
                "SELECT * FROM bookings WHERE client_id = ? ORDER BY created_at DESC",
                (user["id"],),
            ).fetchall()
        else:
            rows = connection.execute(
                "SELECT * FROM bookings WHERE influencer_id = ? ORDER BY created_at DESC",
                (user["id"],),
            ).fetchall()
    return [row_to_booking(row) for row in rows]


@app.get("/api/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    user: dict = Depends(current_any_user),
) -> BookingResponse:
    with connection_context() as connection:
        row = connection.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,)).fetchone()

    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=Messages.BOOKING_NOT_FOUND)

    booking = dict(row)
    if user["id"] not in (booking["client_id"], booking["influencer_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=Messages.NO_ACCESS_TO_BOOKING)

    return row_to_booking(row)
