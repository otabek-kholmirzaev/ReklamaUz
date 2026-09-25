from contextlib import asynccontextmanager
from datetime import datetime
import os

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .database import connection_context, init_db
from .schemas import AuthResponse, SignInRequest, SignUpRequest, UserResponse
from .security import create_access_token, hash_password, verify_password


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="ReklamaUz API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"]
)


def row_to_user(row) -> UserResponse:
    created_at = row["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return UserResponse(id=row["id"], email=row["email"], role=row["role"], created_at=created_at)


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
