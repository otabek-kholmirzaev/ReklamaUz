from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class UserRole(str, Enum):
    CLIENT = "CLIENT"
    INFLUENCER = "INFLUENCER"


class SignUpRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=8, max_length=128)
    role: UserRole

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("Enter a valid email address")
        return normalized


class SignInRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class InfluencerProfileCreate(BaseModel):
    username: str = Field(min_length=3, max_length=255)
    display_name: str = Field(min_length=1, max_length=255)
    bio: str | None = None
    category_id: int = Field(gt=0)
    location: str | None = None


class InfluencerProfileUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=255)
    display_name: str | None = Field(default=None, min_length=1, max_length=255)
    bio: str | None = None
    category_id: int | None = Field(default=None, gt=0)
    location: str | None = None


class InfluencerProfileResponse(BaseModel):
    id: int
    user_id: int
    username: str
    display_name: str
    bio: str | None
    category_id: int
    location: str | None
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime


class AdTypeResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime


class AdServiceCreate(BaseModel):
    ad_type_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price: float = Field(gt=0)
    currency: str = Field(default="USD", min_length=1, max_length=10)


class AdServiceUpdate(BaseModel):
    ad_type_id: int | None = Field(default=None, gt=0)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=1, max_length=10)
    is_active: bool | None = None


class AdServiceResponse(BaseModel):
    id: int
    user_id: int
    ad_type_id: int
    title: str
    description: str | None
    price: float
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
