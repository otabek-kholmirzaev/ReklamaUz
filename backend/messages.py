"""Centralized Uzbek (Latin) user-facing message strings for the backend.

Mirrors the pattern used in frontend/src/lib/i18n/ — plain string constants,
no i18n framework, no locale switching.
"""


class Messages:
    # --- Auth ---
    BEARER_TOKEN_REQUIRED = "Bearer token talab qilinadi"
    INVALID_OR_EXPIRED_TOKEN = "Token yaroqsiz yoki muddati o‘tgan"
    USER_NO_LONGER_EXISTS = "Foydalanuvchi endi mavjud emas"
    ONLY_INFLUENCERS_CAN_MANAGE_PROFILES = "Faqat influenserlar profil boshqarishi mumkin"
    ONLY_INFLUENCERS_CAN_MANAGE_AD_SERVICES = "Faqat influenserlar reklama xizmatlarini boshqarishi mumkin"
    ACCOUNT_ALREADY_EXISTS = "Bu elektron pochta bilan hisob allaqachon mavjud"
    NO_PENDING_VERIFICATION = "Bu elektron pochta uchun kutilayotgan tasdiqlash topilmadi"
    VERIFICATION_CODE_EXPIRED = "Tasdiqlash kodi muddati tugagan. Iltimos, qaytadan ro‘yxatdan o‘ting."
    INCORRECT_VERIFICATION_CODE = "Tasdiqlash kodi noto‘g‘ri"
    INVALID_CREDENTIALS = "Elektron pochta yoki parol noto‘g‘ri"
    GOOGLE_OAUTH_NOT_CONFIGURED = "Google orqali kirish sozlanmagan. GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET o‘rnating."

    # --- Influencer profiles ---
    PROFILE_ALREADY_EXISTS = "Sizda allaqachon influencer profili mavjud"
    USERNAME_TAKEN = "Bu foydalanuvchi nomi band"
    CATEGORY_NOT_FOUND = "Kategoriya topilmadi"
    NO_PROFILE_YET = "Hozircha influencer profili yo‘q"
    AT_LEAST_ONE_PROFILE_FIELD_REQUIRED = "Kamida bitta profil maydoni talab qilinadi"
    PROFILE_NOT_FOUND = "Influencer profili topilmadi"
    CREATOR_NOT_FOUND = "Kreator topilmadi"

    # --- Ad services ---
    AD_TYPE_NOT_FOUND = "Reklama turi topilmadi"
    AT_LEAST_ONE_FIELD_REQUIRED = "Kamida bitta maydon talab qilinadi"
    AD_SERVICE_NOT_FOUND = "Reklama xizmati topilmadi"

    # --- Bookings ---
    ONLY_CLIENTS_CAN_BOOK = "Faqat mijozlar bron qilishi mumkin"
    AD_SERVICE_NOT_FOUND_OR_INACTIVE = "Reklama xizmati topilmadi yoki faol emas"
    CANNOT_BOOK_OWN_SERVICE = "O‘z xizmatingizni bron qila olmaysiz"
    DATE_NOT_AVAILABLE = "Bu sana mavjud emas"
    DATE_ALREADY_BOOKED = "Bu sana allaqachon band qilingan"
    BOOKING_NOT_FOUND = "Bron topilmadi"
    NO_ACCESS_TO_BOOKING = "Sizda ushbu bronga kirish huquqi yo‘q"

    # --- Availability ---
    DATE_ALREADY_BLOCKED = "Bu sana allaqachon bloklangan"
    BLOCKED_DATE_NOT_FOUND = "Bloklangan sana topilmadi"

    # --- Validation (schemas.py field validators) ---
    INVALID_EMAIL = "Yaroqli elektron pochta manzilini kiriting"
    DATE_FORMAT_INVALID = "Sana YYYY-MM-DD formatida bo‘lishi kerak"
    DATE_IN_PAST = "Sana o‘tmishda bo‘lishi mumkin emas"
    TIME_FORMAT_INVALID = "Vaqt HH:MM formatida bo‘lishi kerak"

    # --- Verification email (email.py) ---
    EMAIL_HEADING = "Reklama.uz hisobingizni tasdiqlang"
    EMAIL_BODY = "Ro‘yxatdan o‘tishni yakunlash uchun quyidagi kodni kiriting."
    EMAIL_EXPIRY_NOTE = "15 daqiqada muddati tugaydi. Agar bu so‘rovni yubormagan bo‘lsangiz, ushbu xatni e’tiborsiz qoldiring."

    @staticmethod
    def email_subject(code: str) -> str:
        return f"Reklama.uz kodingiz: {code}"
