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
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'CLIENT', 'INFLUENCER')),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
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
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
            """
        )
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
        connection.commit()


@contextmanager
def connection_context() -> Iterator[sqlite3.Connection]:
    connection = get_connection()
    try:
        yield connection
    finally:
        connection.close()
