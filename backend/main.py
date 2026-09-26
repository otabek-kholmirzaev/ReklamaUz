from contextlib import asynccontextmanager
from datetime import datetime
import os

import sqlite3

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles

from .database import connection_context, init_db
from .schemas import (
    AdServiceCreate,
    AdServiceResponse,
    AdServiceUpdate,
    AdTypeResponse,
    AuthResponse,
    InfluencerProfileResponse,
    SignInRequest,
    SignUpRequest,
    UserResponse,
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"]
)

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    try:
        claims = decode_access_token(credentials.credentials)
        user_id = int(claims["sub"])
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")

    with connection_context() as connection:
        user = connection.execute("SELECT id, email, role FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
    if user["role"] != "INFLUENCER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only influencers can manage influencer profiles")
    return dict(user)


@app.post("/api/users/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpRequest) -> AuthResponse:
    password_hash = hash_password(payload.password)
    try:
        with connection_context() as connection:
            cursor = connection.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                (payload.email, password_hash, payload.role.value),
            )
            connection.commit()
            row = connection.execute("SELECT id, email, role, created_at FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except Exception as error:
        if "UNIQUE constraint failed: users.email" in str(error):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists") from error
        raise

    user = row_to_user(row)
    return AuthResponse(access_token=create_access_token(user.id, user.email, user.role), user=user)


@app.post("/api/users/signin", response_model=AuthResponse)
def signin(payload: SignInRequest) -> AuthResponse:
    with connection_context() as connection:
        row = connection.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()

    if row is None or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user = row_to_user(row)
    return AuthResponse(access_token=create_access_token(user.id, user.email, user.role), user=user)


@app.post("/api/influencer-profiles", response_model=InfluencerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_influencer_profile(
    username: str = Form(..., min_length=3, max_length=255),
    display_name: str = Form(..., min_length=1, max_length=255),
    category_id: int = Form(..., gt=0),
    bio: str | None = Form(None),
    location: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    user: dict = Depends(current_influencer_user),
) -> InfluencerProfileResponse:
    avatar_url = await save_avatar(avatar) if avatar else None
    try:
        with connection_context() as connection:
            cursor = connection.execute(
                """
                INSERT INTO influencer_profiles
                    (user_id, username, display_name, bio, category_id, location, avatar_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user["id"], username, display_name, bio, category_id, location, avatar_url),
            )
            connection.commit()
            row = connection.execute("SELECT * FROM influencer_profiles WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except sqlite3.IntegrityError as error:
        message = str(error)
        if "influencer_profiles.user_id" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already have an influencer profile") from error
        if "influencer_profiles.username" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This username is already taken") from error
        if "FOREIGN KEY" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found") from error
        raise
    return row_to_profile(row)


@app.patch("/api/influencer-profiles/me", response_model=InfluencerProfileResponse)
async def update_influencer_profile(
    username: str | None = Form(None, min_length=3, max_length=255),
    display_name: str | None = Form(None, min_length=1, max_length=255),
    category_id: int | None = Form(None, gt=0),
    bio: str | None = Form(None),
    location: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    user: dict = Depends(current_influencer_user),
) -> InfluencerProfileResponse:
    updates = {
        field: value
        for field, value in {
            "username": username,
            "display_name": display_name,
            "category_id": category_id,
            "bio": bio,
            "location": location,
        }.items()
        if value is not None
    }
    if avatar:
        updates["avatar_url"] = await save_avatar(avatar)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one profile field is required")

    allowed_fields = ("username", "display_name", "bio", "category_id", "location", "avatar_url")
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
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Influencer profile not found")
            connection.commit()
            row = connection.execute("SELECT * FROM influencer_profiles WHERE user_id = ?", (user["id"],)).fetchone()
    except sqlite3.IntegrityError as error:
        message = str(error)
        if "influencer_profiles.username" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This username is already taken") from error
        if "FOREIGN KEY" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found") from error
        raise
    return row_to_profile(row)


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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    try:
        claims = decode_access_token(credentials.credentials)
        user_id = int(claims["sub"])
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")

    with connection_context() as connection:
        user = connection.execute("SELECT id, email, role FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
    if user["role"] != "INFLUENCER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only influencers can manage ad services")
    return dict(user)


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
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad type not found") from error
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one field is required")

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
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad service not found")
            connection.commit()
            row = connection.execute("SELECT * FROM ad_services WHERE id = ?", (service_id,)).fetchone()
    except sqlite3.IntegrityError as error:
        message = str(error)
        if "FOREIGN KEY" in message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad type not found") from error
        raise
    return row_to_ad_service(row)


