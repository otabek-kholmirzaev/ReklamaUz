"""One-off script to populate demo data for the pitch showcase.

Creates influencer accounts matching the usernames used by the frontend's
mock creator cards (footballstar, fitblogger, techuz, fashionista, comedian)
so that clicking into those profiles shows a real, working calendar and
booking flow backed by the database. Also creates a few demo bookings
against the existing client accounts.

Run with:
    ./.venv310/bin/python -m backend.seed
"""

import datetime
import random

from .database import connection_context, init_db
from .security import hash_password

DEMO_PASSWORD = "Demo1234!"

INFLUENCERS = [
    {
        "email": "footballstar@reklama.uz",
        "username": "footballstar",
        "display_name": "Sardor Yusupov",
        "bio": "Professional footballer sharing matchday life, training routines and sportswear I actually use.",
        "category": "Football",
        "location": "Tashkent, Uzbekistan",
        "available_from": "09:00",
        "available_to": "18:00",
        "phone": "+998 90 123 45 67",
        "instagram_handle": "footballstar",
        "telegram_handle": "footballstar_official",
        "followers_range": "Over 1M",
        "services": [
            ("EVENT_APPEARANCE", "Stadium meet & greet", 2500),
            ("INSTAGRAM_STORY", "Sponsor story shoutout", 400),
            ("INSTAGRAM_POST", "Feed post", 700),
        ],
    },
    {
        "email": "fitblogger@reklama.uz",
        "username": "fitblogger",
        "display_name": "Nilufar Ahmedova",
        "bio": "Coach and fitness creator. Programs, gym culture and honest gear reviews.",
        "category": "Fitness",
        "location": "Tashkent, Uzbekistan",
        "available_from": "07:00",
        "available_to": "16:00",
        "phone": "+998 90 234 56 78",
        "instagram_handle": "fitblogger",
        "tiktok_handle": "fitblogger",
        "followers_range": "500K – 1M",
        "services": [
            ("INSTAGRAM_STORY", "Workout story feature", 150),
            ("INSTAGRAM_REEL", "Fitness reel", 450),
            ("PERSONAL_SHOUTOUT", "Personal shoutout video", 80),
        ],
    },
    {
        "email": "techuz@reklama.uz",
        "username": "techuz",
        "display_name": "Jasur Rahimov",
        "bio": "Tech reviewer covering gadgets, apps and everything shipping out of Central Asia's startup scene.",
        "category": "Technology",
        "location": "Tashkent, Uzbekistan",
        "available_from": "11:00",
        "available_to": "20:00",
        "phone": "+998 90 345 67 89",
        "youtube_url": "https://youtube.com/@techuz",
        "telegram_handle": "techuz_channel",
        "followers_range": "100K – 500K",
        "services": [
            ("YOUTUBE_INTEGRATION", "Product integration segment", 900),
            ("TELEGRAM_POST", "Tech channel post", 200),
            ("INSTAGRAM_STORY", "Unboxing story", 180),
        ],
    },
    {
        "email": "fashionista@reklama.uz",
        "username": "fashionista",
        "display_name": "Kamila Tursunova",
        "bio": "Fashion and style creator. Outfit breakdowns, hauls and honest brand collabs.",
        "category": "Fashion",
        "location": "Samarkand, Uzbekistan",
        "available_from": "10:00",
        "available_to": "19:00",
        "services": [
            ("INSTAGRAM_POST", "Outfit feed post", 500),
            ("INSTAGRAM_STORY", "Try-on story", 220),
            ("TIKTOK_VIDEO", "Style TikTok", 350),
        ],
    },
    {
        "email": "comedian@reklama.uz",
        "username": "comedian",
        "display_name": "Bekzod Aliev",
        "bio": "Sketch comedian and content creator. Brand integrations that people actually want to watch.",
        "category": "Comedy",
        "location": "Fergana, Uzbekistan",
        "available_from": "12:00",
        "available_to": "21:00",
        "services": [
            ("INSTAGRAM_REEL", "Comedy skit integration", 600),
            ("BIRTHDAY_WISH", "Personalized birthday video", 120),
            ("EVENT_APPEARANCE", "Live show shoutout", 1500),
        ],
    },
]


def future_date(days_ahead: int) -> str:
    return (datetime.date.today() + datetime.timedelta(days=days_ahead)).isoformat()


def seed() -> None:
    init_db()
    random.seed(42)

    with connection_context() as connection:
        client_ids = [
            row["id"]
            for row in connection.execute(
                "SELECT id FROM users WHERE role = 'CLIENT' ORDER BY id ASC"
            ).fetchall()
        ]
        if not client_ids:
            demo_client_row = connection.execute(
                "SELECT id FROM users WHERE email = 'democlient@reklama.uz'"
            ).fetchone()
            if demo_client_row is None:
                cursor = connection.execute(
                    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'CLIENT')",
                    ("democlient@reklama.uz", hash_password(DEMO_PASSWORD)),
                )
                client_ids = [cursor.lastrowid]
            else:
                client_ids = [demo_client_row["id"]]
        ad_type_ids = {
            row["name"]: row["id"]
            for row in connection.execute("SELECT id, name FROM ad_types").fetchall()
        }
        category_ids = {
            row["name"]: row["id"]
            for row in connection.execute("SELECT id, name FROM categories").fetchall()
        }

        booking_pool_days = list(range(3, 40))
        random.shuffle(booking_pool_days)

        for creator in INFLUENCERS:
            user_row = connection.execute(
                "SELECT id FROM users WHERE email = ?", (creator["email"],)
            ).fetchone()
            if user_row is None:
                cursor = connection.execute(
                    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'INFLUENCER')",
                    (creator["email"], hash_password(DEMO_PASSWORD)),
                )
                user_id = cursor.lastrowid
            else:
                user_id = user_row["id"]

            profile_row = connection.execute(
                "SELECT id FROM influencer_profiles WHERE user_id = ?", (user_id,)
            ).fetchone()
            if profile_row is None:
                connection.execute(
                    """
                    INSERT INTO influencer_profiles
                        (user_id, username, display_name, bio, category_id, location, available_from, available_to)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        user_id,
                        creator["username"],
                        creator["display_name"],
                        creator["bio"],
                        category_ids[creator["category"]],
                        creator["location"],
                        creator["available_from"],
                        creator["available_to"],
                    ),
                )

            existing_services = connection.execute(
                "SELECT id FROM ad_services WHERE user_id = ?", (user_id,)
            ).fetchall()
            service_ids = [row["id"] for row in existing_services]
            if not existing_services:
                for ad_type_name, title, price in creator["services"]:
                    cursor = connection.execute(
                        """
                        INSERT INTO ad_services (user_id, ad_type_id, title, price)
                        VALUES (?, ?, ?, ?)
                        """,
                        (user_id, ad_type_ids[ad_type_name], title, price),
                    )
                    service_ids.append(cursor.lastrowid)

            existing_blocks = connection.execute(
                "SELECT date FROM availability_blocks WHERE influencer_id = ?", (user_id,)
            ).fetchall()
            if not existing_blocks:
                block_days = random.sample(range(2, 45), 4)
                for day_offset in block_days:
                    connection.execute(
                        "INSERT OR IGNORE INTO availability_blocks (influencer_id, date) VALUES (?, ?)",
                        (user_id, future_date(day_offset)),
                    )

            existing_bookings = connection.execute(
                "SELECT id FROM bookings WHERE influencer_id = ?", (user_id,)
            ).fetchall()
            if not existing_bookings and client_ids and service_ids:
                for _ in range(2):
                    day_offset = booking_pool_days.pop()
                    booking_date = future_date(day_offset)
                    blocked = connection.execute(
                        "SELECT 1 FROM availability_blocks WHERE influencer_id = ? AND date = ?",
                        (user_id, booking_date),
                    ).fetchone()
                    if blocked:
                        continue
                    service_id = random.choice(service_ids)
                    price = connection.execute(
                        "SELECT price FROM ad_services WHERE id = ?", (service_id,)
                    ).fetchone()["price"]
                    status = random.choice(["PENDING", "CONFIRMED", "COMPLETED"])
                    connection.execute(
                        """
                        INSERT INTO bookings (client_id, influencer_id, service_id, date, price, status, description)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            random.choice(client_ids),
                            user_id,
                            service_id,
                            booking_date,
                            price,
                            status,
                            "Seeded demo booking for pitch showcase",
                        ),
                    )

        connection.commit()

    print("Seed complete. Demo logins (password for all: %s):" % DEMO_PASSWORD)
    for creator in INFLUENCERS:
        print(f"  {creator['email']}  ->  /creator/{creator['username']}")
    print("  democlient@reklama.uz  ->  client account used for seeded bookings")


if __name__ == "__main__":
    seed()
