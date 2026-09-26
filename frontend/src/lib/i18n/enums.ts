// Uzbek display labels for backend enum/db values. Never change the underlying
// value sent to/received from the API — only what's rendered to the user.
// Always falls back to the raw value if a mapping is missing (e.g. a category
// added later on the backend).

export const CATEGORY_LABELS: Record<string, string> = {
  Sports: "Sport",
  Fitness: "Fitnes",
  Football: "Futbol",
  Fashion: "Moda",
  Beauty: "Go‘zallik",
  Lifestyle: "Turmush tarzi",
  Travel: "Sayohat",
  "Food & Cooking": "Ovqat va pazandachilik",
  Technology: "Texnologiya",
  Gaming: "O‘yinlar",
  Music: "Musiqa",
  Comedy: "Kulgi",
  Education: "Ta’lim",
  "Business & Finance": "Biznes va moliya",
  Business: "Biznes",
  Automotive: "Avtomobil",
  "Health & Wellness": "Sog‘liq va farovonlik",
  "Family & Parenting": "Oila va farzand tarbiyasi",
  "Art & Photography": "San’at va fotografiya",
  Entertainment: "Ko‘ngilochar",
  "News & Media": "Yangiliklar va media",
};

// Ad type enums encode "PLATFORM_FORMAT" — the platform name (a brand) is kept
// as-is, only the format word is translated.
export const AD_TYPE_LABELS: Record<string, string> = {
  INSTAGRAM_STORY: "Instagram Story",
  INSTAGRAM_POST: "Instagram post",
  INSTAGRAM_REEL: "Instagram Reel",
  TELEGRAM_POST: "Telegram post",
  YOUTUBE_INTEGRATION: "YouTube integratsiyasi",
  YOUTUBE_VIDEO: "YouTube video",
  TIKTOK_VIDEO: "TikTok video",
  BIRTHDAY_WISH: "Tug‘ilgan kun tabrigi",
  PERSONAL_SHOUTOUT: "Shaxsiy tilga olish (shoutout)",
  EVENT_APPEARANCE: "Tadbirda ishtirok",
  OTHER: "Boshqa",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  CONFIRMED: "Tasdiqlangan",
  CANCELLED: "Bekor qilingan",
  COMPLETED: "Yakunlangan",
};

export function translateEnum(
  dict: Record<string, string>,
  value: string,
): string {
  return dict[value] ?? value;
}
