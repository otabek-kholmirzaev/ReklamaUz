from datetime import date as date_type, datetime, time as time_type
from enum import Enum

from pydantic import BaseModel, Field, field_validator

from .messages import Messages


def _parse_iso_date(value: str) -> str:
    try:
        parsed = date_type.fromisoformat(value)
    except ValueError as error:
        raise ValueError(Messages.DATE_FORMAT_INVALID) from error
    if parsed < datetime.utcnow().date():
        raise ValueError(Messages.DATE_IN_PAST)
    return parsed.isoformat()


def _parse_hhmm(value: str) -> str:
    try:
        parsed = time_type.fromisoformat(value)
    except ValueError as error:
        raise ValueError(Messages.TIME_FORMAT_INVALID) from error
    return parsed.strftime("%H:%M")


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
            raise ValueError(Messages.INVALID_EMAIL)
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


class SignupPendingResponse(BaseModel):
    status: str = "verification_sent"
    email: str


class VerifyEmailRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    code: str = Field(min_length=6, max_length=6)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class InfluencerProfileCreate(BaseModel):
    username: str = Field(min_length=3, max_length=255)
    display_name: str = Field(min_length=1, max_length=255)
    bio: str | None = None
    category_id: int = Field(gt=0)
    location: str | None = None
    available_from: str | None = None
    available_to: str | None = None
    phone: str | None = None
    instagram_handle: str | None = None
    tiktok_handle: str | None = None
    youtube_url: str | None = None
    telegram_handle: str | None = None
    followers_range: str | None = None


class InfluencerProfileUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=255)
    display_name: str | None = Field(default=None, min_length=1, max_length=255)
    bio: str | None = None
    category_id: int | None = Field(default=None, gt=0)
    location: str | None = None
    available_from: str | None = None
    available_to: str | None = None
    phone: str | None = None
    instagram_handle: str | None = None
    tiktok_handle: str | None = None
    youtube_url: str | None = None
    telegram_handle: str | None = None
    followers_range: str | None = None


class InfluencerProfileResponse(BaseModel):
    id: int
    user_id: int
    username: str
    display_name: str
    bio: str | None
    category_id: int
    location: str | None
    avatar_url: str | None
    available_from: str | None
    available_to: str | None
    phone: str | None
    instagram_handle: str | None
    tiktok_handle: str | None
    youtube_url: str | None
    telegram_handle: str | None
    followers_range: str | None
    created_at: datetime
    updated_at: datetime


class PublicInfluencerProfileResponse(InfluencerProfileResponse):
    category_name: str


class InfluencerListItemResponse(PublicInfluencerProfileResponse):
    price_from: float | None = None


class CategoryResponse(BaseModel):
    id: int
    name: str


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


class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class BookingCreate(BaseModel):
    service_id: int = Field(gt=0)
    date: str = Field(description="Booking date in YYYY-MM-DD format")
    description: str | None = None
    birthday_greeting: str | None = None
    birthday_recipient: str | None = None
    delivery_datetime: str | None = None
    recipient_phone: str | None = None

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: str) -> str:
        return _parse_iso_date(value)


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BaseModel):
    id: int
    client_id: int
    influencer_id: int
    service_id: int
    date: str
    price: float
    status: BookingStatus
    description: str | None
    birthday_greeting: str | None = None
    birthday_recipient: str | None = None
    delivery_datetime: str | None = None
    recipient_phone: str | None = None
    created_at: datetime
    updated_at: datetime


class AvailabilityBlockCreate(BaseModel):
    date: str = Field(description="Blocked date in YYYY-MM-DD format")

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: str) -> str:
        return _parse_iso_date(value)


class AvailabilityBlockResponse(BaseModel):
    id: int
    influencer_id: int
    date: str
    created_at: datetime


class AvailabilityResponse(BaseModel):
    blocked_dates: list[str]
    booked_dates: list[str]

