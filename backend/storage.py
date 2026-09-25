import os
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status


UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", Path(__file__).with_name("uploads")))
MAX_AVATAR_SIZE = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


async def save_avatar(avatar: UploadFile) -> str:
    if avatar.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Avatar must be a JPG, PNG, WEBP, or GIF image")

    extension = Path(avatar.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        extension = ".jpg" if avatar.content_type == "image/jpeg" else ".png"

    contents = await avatar.read(MAX_AVATAR_SIZE + 1)
    if len(contents) > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Avatar must be 5 MB or smaller")

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    (UPLOADS_DIR / filename).write_bytes(contents)
    return f"/uploads/{filename}"
