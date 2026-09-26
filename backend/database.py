import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


DATABASE_PATH = Path(os.getenv("DATABASE_PATH", Path(__file__).with_name("reklama.db")))

INFLUENCER_CATEGORIES = (
    "Sports",
    "Fitness",
    "Football",
    "Fashion",
    "Beauty",
    "Lifestyle",
    "Travel",
    "Food & Cooking",
    "Technology",
    "Gaming",
    "Music",
    "Comedy",
    "Education",
    "Business & Finance",
    "Automotive",
    "Health & Wellness",
    "Family & Parenting",
    "Art & Photography",
    "Entertainment",
    "News & Media",
)

AD_TYPES = (
    "INSTAGRAM_STORY",
    "INSTAGRAM_POST",
    "INSTAGRAM_REEL",
    "TELEGRAM_POST",
    "YOUTUBE_INTEGRATION",
    "YOUTUBE_VIDEO",
    "TIKTOK_VIDEO",
    "BIRTHDAY_WISH",
    "PERSONAL_SHOUTOUT",
    "EVENT_APPEARANCE",
    "OTHER",
)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(320) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL DEFAULT '',
                role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'CLIENT', 'INFLUENCER')),
                google_id VARCHAR(255),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        existing_user_columns = {row["name"] for row in connection.execute("PRAGMA table_info(users)")}
        if "google_id" not in existing_user_columns:
            connection.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)")
        existing_booking_columns = {row["name"] for row in connection.execute("PRAGMA table_info(bookings)")}
        for col, col_type in {
            "birthday_greeting": "TEXT",
            "birthday_recipient": "TEXT",
            "delivery_datetime": "VARCHAR(32)",
            "recipient_phone": "VARCHAR(30)",
        }.items():
            if col not in existing_booking_columns:
                connection.execute(f"ALTER TABLE bookings ADD COLUMN {col} {col_type}")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.executemany(
            "INSERT OR IGNORE INTO categories (name) VALUES (?)",
            [(name,) for name in INFLUENCER_CATEGORIES],
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS ad_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.executemany(
            "INSERT OR IGNORE INTO ad_types (name) VALUES (?)",
            [(name,) for name in AD_TYPES],
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS influencer_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                username VARCHAR(255) NOT NULL UNIQUE,
                display_name VARCHAR(255) NOT NULL,
                bio TEXT,
                category_id INTEGER NOT NULL,
                location VARCHAR(255),
                avatar_url VARCHAR(2048),
                available_from VARCHAR(5),
                available_to VARCHAR(5),
                phone VARCHAR(30),
                instagram_handle VARCHAR(255),
                tiktok_handle VARCHAR(255),
                youtube_url VARCHAR(2048),
                telegram_handle VARCHAR(255),
                followers_range VARCHAR(50),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
            """
        )
        existing_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(influencer_profiles)")
        }
        new_profile_columns = {
            "available_from": "VARCHAR(5)",
            "available_to": "VARCHAR(5)",
            "phone": "VARCHAR(30)",
            "instagram_handle": "VARCHAR(255)",
            "tiktok_handle": "VARCHAR(255)",
            "youtube_url": "VARCHAR(2048)",
            "telegram_handle": "VARCHAR(255)",
            "followers_range": "VARCHAR(50)",
        }
        for column, column_type in new_profile_columns.items():
            if column not in existing_columns:
                connection.execute(f"ALTER TABLE influencer_profiles ADD COLUMN {column} {column_type}")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS ad_services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ad_type_id INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'USD',
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (ad_type_id) REFERENCES ad_types(id)
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS availability_blocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                influencer_id INTEGER NOT NULL,
                date DATE NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (influencer_id, date),
                FOREIGN KEY (influencer_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER NOT NULL,
                influencer_id INTEGER NOT NULL,
                service_id INTEGER NOT NULL,
                date DATE NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
                description TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (influencer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (service_id) REFERENCES ad_services(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS pending_verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(320) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL,
                code VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


@contextmanager
def connection_context() -> Iterator[sqlite3.Connection]:
    connection = get_connection()
    try:
        yield connection
    finally:
        connection.close()
