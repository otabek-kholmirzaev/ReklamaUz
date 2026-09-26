import football from "@/assets/creator-football.jpg";
import fitness from "@/assets/creator-fitness.jpg";
import tech from "@/assets/creator-tech.jpg";
import fashion from "@/assets/creator-fashion.jpg";
import comedy from "@/assets/creator-comedy.jpg";

export type Service = {
  id: string;
  name: string;
  platform: string;
  price: number;
  bullets: string[];
  limit?: { used: number; max: number; period: string };
  /** Dates already reserved for this specific format, in addition to creator-wide holds. */
  bookedDates?: string[];
};

// NOTE on localization: `category`, `tags`, and `platforms` values below are
// kept in English on purpose — they double as filter/search keys (see
// discover.tsx) and mirror the backend's category names (see
// src/lib/i18n/enums.ts). Translate them for display with
// `translateEnum(CATEGORY_LABELS, value)` at the render site, never here.
export type Creator = {
  username: string;
  name: string;
  photo: string;
  verified: boolean;
  category: string;
  tags: string[];
  location: string;
  bio: string;
  platforms: string[];
  followers: string;
  followersNum: number;
  avgViews: string;
  engagement: string;
  responseRate: string;
  rating: number;
  reviews: number;
  audience: {
    age: string;
    gender: string;
    country: string;
    split: { label: string; value: number }[];
  };
  services: Service[];
  matchScore: number;
  matchReasons: string[];
  availability: string;
  unavailableDates: string[];
};

export const creators: Creator[] = [
  {
    username: "footballstar",
    name: "Sardor Yusupov",
    photo: football,
    verified: true,
    category: "Football",
    tags: ["Football", "Lifestyle"],
    location: "Toshkent, O‘zbekiston",
    bio: "Professional futbolchi — o‘yin kuni hayoti, mashg‘ulot dasturlari va o‘zim foydalanadigan sport kiyimlari haqida ulashaman.",
    platforms: ["Instagram", "Telegram", "YouTube"],
    followers: "1.2M",
    followersNum: 1200000,
    avgViews: "320K",
    engagement: "6.4%",
    responseRate: "98%",
    rating: 4.9,
    reviews: 128,
    audience: {
      age: "18–34",
      gender: "71% erkak",
      country: "O‘zbekiston",
      split: [
        { label: "O‘zbekiston", value: 82 },
        { label: "Qozog‘iston", value: 9 },
        { label: "Rossiya", value: 5 },
        { label: "Boshqa", value: 4 },
      ],
    },
    services: [
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 400,
        bullets: [
          "1 ta Instagram Story",
          "24 soatgacha",
          "1 ta mahsulot tilga olinadi",
          "Kreativ material mijoz tomonidan taqdim etiladi",
        ],
        limit: { used: 12, max: 15, period: "shu oy" },
        bookedDates: ["2026-10-03", "2026-10-12", "2026-10-20"],
      },
      {
        id: "ig-post",
        name: "Instagram post",
        platform: "Instagram",
        price: 700,
        bullets: [
          "Lentaga post",
          "Sarlavha kiritilgan",
          "Mahsulot tegi",
          "24 soat qadalgan holatda",
        ],
        limit: { used: 3, max: 8, period: "shu oy" },
        bookedDates: ["2026-10-09", "2026-10-18"],
      },
      {
        id: "ig-reel",
        name: "Instagram Reel",
        platform: "Instagram",
        price: 900,
        bullets: [
          "30–60 soniyalik video",
          "Ssenariy bo‘yicha yordam",
          "Mahsulot integratsiyasi",
        ],
        limit: { used: 2, max: 6, period: "shu oy" },
        bookedDates: ["2026-10-04", "2026-10-23"],
      },
      {
        id: "tg-post",
        name: "Telegram post",
        platform: "Telegram",
        price: 300,
        bullets: ["Sponsorlik posti", "24 soatgacha qadalgan"],
        limit: { used: 5, max: 10, period: "shu oy" },
        bookedDates: ["2026-10-05", "2026-10-19"],
      },
    ],
    matchScore: 96,
    matchReasons: [
      "Sport auditoriyasi kuchli",
      "Auditoriyaning 82% O‘zbekistonda",
      "Byudjetingizga mos keladi",
      "So‘ralgan sanalarda band emas",
      "Maqsadli auditoriyangiz orasida yuqori faollik",
    ],
    availability: "3-oktabrdan band qilish mumkin",
    unavailableDates: [
      "2026-10-06",
      "2026-10-07",
      "2026-10-14",
      "2026-10-21",
      "2026-10-28",
    ],
  },
  {
    username: "fitblogger",
    name: "Nilufar Ahmedova",
    photo: fitness,
    verified: true,
    category: "Fitness",
    tags: ["Fitness", "Wellness"],
    location: "Toshkent, O‘zbekiston",
    bio: "Murabbiy va fitnes-kreator. Dasturlar, sport zali madaniyati va halol jihoz sharhlari.",
    platforms: ["Instagram", "TikTok"],
    followers: "620K",
    followersNum: 620000,
    avgViews: "180K",
    engagement: "7.1%",
    responseRate: "95%",
    rating: 4.8,
    reviews: 86,
    audience: {
      age: "18–34",
      gender: "64% ayol",
      country: "O‘zbekiston",
      split: [
        { label: "O‘zbekiston", value: 74 },
        { label: "Qozog‘iston", value: 12 },
        { label: "Rossiya", value: 8 },
        { label: "Boshqa", value: 6 },
      ],
    },
    services: [
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 250,
        bullets: [
          "2 ta Instagram Story",
          "Yuqoriga surish havolasi",
          "1 ta mahsulot tilga olinadi",
        ],
        limit: { used: 5, max: 12, period: "shu oy" },
      },
      {
        id: "ig-reel",
        name: "Instagram Reel",
        platform: "Instagram",
        price: 500,
        bullets: [
          "45 soniyagacha video",
          "Mashg‘ulot integratsiyasi",
          "Sarlavha kiritilgan",
        ],
        limit: { used: 4, max: 6, period: "shu oy" },
      },
      {
        id: "ig-post",
        name: "Instagram post",
        platform: "Instagram",
        price: 420,
        bullets: [
          "Muharrirlik lentasi posti",
          "Jihoz sharhi bilan",
          "Sarlavha kiritilgan",
        ],
        limit: { used: 3, max: 8, period: "shu oy" },
      },
    ],
    matchScore: 91,
    matchReasons: [
      "Auditoriya sport kiyimlarini faol xarid qiladi",
      "Kategoriyangizdagi eng yuqori faollik darajasi",
      "Byudjetingizdan ancha past",
      "Oktabr boshida ikkita bo‘sh joy",
    ],
    availability: "1-oktabrdan band qilish mumkin",
    unavailableDates: ["2026-10-02", "2026-10-09", "2026-10-16"],
  },
  {
    username: "techuz",
    name: "Jasur Rahimov",
    photo: tech,
    verified: true,
    category: "Technology",
    tags: ["Technology", "Business"],
    location: "Toshkent, O‘zbekiston",
    bio: "Gadjet sharhlari, startap fikrlari va yosh professional auditoriya uchun texnologik tushuntirishlar.",
    platforms: ["Telegram", "YouTube", "Instagram"],
    followers: "410K",
    followersNum: 410000,
    avgViews: "120K",
    engagement: "5.2%",
    responseRate: "92%",
    rating: 4.7,
    reviews: 54,
    audience: {
      age: "22–40",
      gender: "68% erkak",
      country: "O‘zbekiston",
      split: [
        { label: "O‘zbekiston", value: 69 },
        { label: "Qozog‘iston", value: 14 },
        { label: "Rossiya", value: 10 },
        { label: "Boshqa", value: 7 },
      ],
    },
    services: [
      {
        id: "tg-post",
        name: "Telegram post",
        platform: "Telegram",
        price: 200,
        bullets: ["Sponsorlik posti", "12 soat qadalgan", "Havola kiritilgan"],
        limit: { used: 6, max: 10, period: "shu oy" },
      },
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 450,
        bullets: ["2 ta Story", "Mahsulot demosi", "Havola stikeri"],
        limit: { used: 7, max: 10, period: "shu oy" },
      },
      {
        id: "ig-post",
        name: "Instagram post",
        platform: "Instagram",
        price: 600,
        bullets: [
          "Batafsil gadjet sharhi posti",
          "Sotib olish havolasi",
          "Sarlavha kiritilgan",
        ],
        limit: { used: 2, max: 6, period: "shu oy" },
      },
    ],
    matchScore: 84,
    matchReasons: [
      "Premium professional auditoriya",
      "Telegramda kuchli qamrov",
      "Tez bajarish muddati",
    ],
    availability: "8-oktabrdan band qilish mumkin",
    unavailableDates: ["2026-10-10", "2026-10-11", "2026-10-24"],
  },
  {
    username: "fashionista",
    name: "Kamila Tursunova",
    photo: fashion,
    verified: true,
    category: "Fashion",
    tags: ["Fashion", "Beauty"],
    location: "Toshkent, O‘zbekiston",
    bio: "Moda muharriridan kreatorga aylangan. Stilistika, brend intervyulari va mavsumiy lukbuklar.",
    platforms: ["Instagram", "TikTok"],
    followers: "780K",
    followersNum: 780000,
    avgViews: "210K",
    engagement: "6.0%",
    responseRate: "90%",
    rating: 4.9,
    reviews: 102,
    audience: {
      age: "18–30",
      gender: "79% ayol",
      country: "O‘zbekiston",
      split: [
        { label: "O‘zbekiston", value: 66 },
        { label: "Qozog‘iston", value: 15 },
        { label: "Rossiya", value: 12 },
        { label: "Boshqa", value: 7 },
      ],
    },
    services: [
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 350,
        bullets: ["3 ta Story", "Stilistika ketma-ketligi", "Havola stikeri"],
        limit: { used: 10, max: 10, period: "shu oy" },
      },
      {
        id: "ig-post",
        name: "Instagram post",
        platform: "Instagram",
        price: 800,
        bullets: [
          "Muharrirlik lentasi posti",
          "Brend tegi",
          "Sarlavha kiritilgan",
        ],
        limit: { used: 2, max: 6, period: "shu oy" },
      },
    ],
    matchScore: 78,
    matchReasons: [
      "Turmush tarzi bilan kuchli mos kelish",
      "Mahsulot postlarida saqlash darajasi yuqori",
    ],
    availability: "6-oktabrdan band qilish mumkin",
    unavailableDates: ["2026-10-08", "2026-10-15", "2026-10-22"],
  },
  {
    username: "comedian",
    name: "Bekzod Aliev",
    photo: comedy,
    verified: true,
    category: "Comedy",
    tags: ["Comedy", "Lifestyle"],
    location: "Samarqand, O‘zbekiston",
    bio: "Sketchlar va kundalik hazil. Odamlar oxirigacha tomosha qiladigan brend integratsiyalari.",
    platforms: ["Instagram", "TikTok", "YouTube"],
    followers: "1.8M",
    followersNum: 1800000,
    avgViews: "540K",
    engagement: "8.2%",
    responseRate: "88%",
    rating: 4.8,
    reviews: 173,
    audience: {
      age: "16–34",
      gender: "55% erkak",
      country: "O‘zbekiston",
      split: [
        { label: "O‘zbekiston", value: 71 },
        { label: "Qozog‘iston", value: 13 },
        { label: "Rossiya", value: 10 },
        { label: "Boshqa", value: 6 },
      ],
    },
    services: [
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 500,
        bullets: ["2 ta Story", "Obraz ichida tilga olish", "Havola stikeri"],
        limit: { used: 6, max: 8, period: "shu oy" },
      },
      {
        id: "ig-reel",
        name: "Instagram Reel",
        platform: "Instagram",
        price: 1000,
        bullets: [
          "Sketch integratsiyasi",
          "Ssenariy kreator tomonidan",
          "60 soniyagacha",
        ],
        limit: { used: 5, max: 5, period: "shu oy" },
      },
      {
        id: "ig-post",
        name: "Instagram post",
        platform: "Instagram",
        price: 700,
        bullets: [
          "Komik karusel post",
          "Brend tegi",
          "Sarlavha kiritilgan",
        ],
        limit: { used: 3, max: 7, period: "shu oy" },
      },
    ],
    matchScore: 74,
    matchReasons: [
      "Platformadagi eng katta qamrov",
      "Juda yuqori ko‘rib bitirish darajasi",
    ],
    availability: "12-oktabrdan band qilish mumkin",
    unavailableDates: ["2026-10-13", "2026-10-20", "2026-10-27"],
  },
];

export const categories = [
  "Football",
  "Fitness",
  "Fashion",
  "Beauty",
  "Gaming",
  "Music",
  "Comedy",
  "Lifestyle",
  "Business",
  "Technology",
  "Education",
];

export const getCreator = (username: string) =>
  creators.find((c) => c.username === username);

const DEFAULT_CREATOR_PHOTO =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=768&h=960&fit=crop";

/** Shape shared by the API's public/list influencer-profile responses. */
export type PublicProfileLike = {
  username: string;
  display_name: string;
  bio: string | null;
  category_name: string;
  location: string | null;
  avatar_url: string | null;
  available_from: string | null;
  available_to: string | null;
};

/**
 * Builds a `Creator` (the UI's display shape) out of a real backend profile.
 * Fields the backend doesn't track yet (ratings, engagement, audience, ...)
 * are filled with neutral placeholders rather than fabricated numbers.
 */
export function creatorFromProfile(
  profile: PublicProfileLike,
  priceFrom: number | null = null,
): Creator {
  return {
    username: profile.username,
    name: profile.display_name,
    photo: profile.avatar_url ?? DEFAULT_CREATOR_PHOTO,
    verified: false,
    category: profile.category_name,
    tags: [profile.category_name],
    location: profile.location ?? "Manzil ko‘rsatilmagan",
    bio: profile.bio ?? "Bu kreator hali bio qo‘shmagan.",
    platforms: [],
    followers: "—",
    followersNum: 0,
    avgViews: "—",
    engagement: "—",
    responseRate: "—",
    rating: 0,
    reviews: 0,
    audience: { age: "—", gender: "—", country: "—", split: [] },
    services:
      priceFrom != null
        ? [
            {
              id: "base",
              name: profile.category_name,
              platform: "Other",
              price: priceFrom,
              bullets: [],
            },
          ]
        : [],
    matchScore: 0,
    matchReasons: [],
    availability:
      profile.available_from && profile.available_to
        ? `Har kuni ${profile.available_from}–${profile.available_to} band qilish mumkin`
        : "Mavjudlik belgilanmagan",
    unavailableDates: [],
  };
}

export const reviews = [
  {
    company: "Nike Uzbekistan",
    initials: "NU",
    rating: 5,
    comment:
      "Muddatidan oldin taqdim etildi va story shu chorakdagi eng yaxshi bir kunlik trafikni keltirdi. Muloqot juda yaxshi edi.",
    type: "Instagram Story",
    date: "2026-sen",
  },
  {
    company: "FitFuel",
    initials: "FF",
    rating: 5,
    comment:
      "Reel sun'iy emas, tabiiy ko‘rindi. Xuddi shu hafta ichida qayta buyurtma berdik.",
    type: "Instagram Reel",
    date: "2026-avg",
  },
  {
    company: "Uzum Market",
    initials: "UM",
    rating: 4,
    comment:
      "Qamrov yaxshi va hisobot aniq. Kreativ bo‘yicha fikr-mulohaza aylanishi biroz tezroq bo‘lsa yaxshi bo‘lardi.",
    type: "Telegram post",
    date: "2026-avg",
  },
];

export type CampaignStatus =
  | "Pending"
  | "Confirmed"
  | "Content Review"
  | "Scheduled"
  | "Published"
  | "Completed";

export const campaigns = [
  {
    id: "RB-48219",
    title: "Nike yozgi kampaniyasi",
    creator: "footballstar",
    format: "Instagram Story",
    date: "2026-yil 5-oktabr",
    amount: 420,
    status: "Confirmed" as CampaignStatus,
  },
  {
    id: "RB-48104",
    title: "Protein batonchasi taqdimoti",
    creator: "fitblogger",
    format: "Instagram Reel",
    date: "2026-yil 11-oktabr",
    amount: 525,
    status: "Content Review" as CampaignStatus,
  },
  {
    id: "RB-47980",
    title: "Kuzgi lukbuk",
    creator: "fashionista",
    format: "Instagram post",
    date: "2026-yil 18-oktabr",
    amount: 840,
    status: "Scheduled" as CampaignStatus,
  },
  {
    id: "RB-47755",
    title: "Smart soat taqdimoti",
    creator: "techuz",
    format: "Telegram post",
    date: "2026-yil 12-sentabr",
    amount: 210,
    status: "Completed" as CampaignStatus,
  },
];
