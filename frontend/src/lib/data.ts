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
};

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
  audience: { age: string; gender: string; country: string; split: { label: string; value: number }[] };
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
    location: "Tashkent, Uzbekistan",
    bio: "Professional footballer sharing matchday life, training routines and sportswear I actually use.",
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
      gender: "71% male",
      country: "Uzbekistan",
      split: [
        { label: "Uzbekistan", value: 82 },
        { label: "Kazakhstan", value: 9 },
        { label: "Russia", value: 5 },
        { label: "Other", value: 4 },
      ],
    },
    services: [
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 400,
        bullets: ["1 Instagram Story", "Up to 24 hours", "1 product mention", "Client provides creative"],
        limit: { used: 12, max: 15, period: "this month" },
      },
      {
        id: "ig-post",
        name: "Instagram Post",
        platform: "Instagram",
        price: 700,
        bullets: ["Feed post", "Caption included", "Product tag", "Pinned for 24 hours"],
        limit: { used: 3, max: 8, period: "this month" },
      },
      {
        id: "ig-reel",
        name: "Instagram Reel",
        platform: "Instagram",
        price: 900,
        bullets: ["30–60 second video", "Script support", "Product integration"],
        limit: { used: 2, max: 6, period: "this month" },
      },
      {
        id: "tg-post",
        name: "Telegram Post",
        platform: "Telegram",
        price: 300,
        bullets: ["Sponsored post", "Up to 24 hours pinned"],
        limit: { used: 5, max: 10, period: "this month" },
      },
    ],
    matchScore: 96,
    matchReasons: [
      "Strong sports audience",
      "82% audience in Uzbekistan",
      "Fits your budget",
      "Available during requested dates",
      "High engagement among your target demographic",
    ],
    availability: "Available from Oct 3",
    unavailableDates: ["2026-10-06", "2026-10-07", "2026-10-14", "2026-10-21", "2026-10-28"],
  },
  {
    username: "fitblogger",
    name: "Nilufar Ahmedova",
    photo: fitness,
    verified: true,
    category: "Fitness",
    tags: ["Fitness", "Wellness"],
    location: "Tashkent, Uzbekistan",
    bio: "Coach and fitness creator. Programs, gym culture and honest gear reviews.",
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
      gender: "64% female",
      country: "Uzbekistan",
      split: [
        { label: "Uzbekistan", value: 74 },
        { label: "Kazakhstan", value: 12 },
        { label: "Russia", value: 8 },
        { label: "Other", value: 6 },
      ],
    },
    services: [
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 250,
        bullets: ["2 Instagram Stories", "Swipe-up link", "1 product mention"],
        limit: { used: 5, max: 12, period: "this month" },
      },
      {
        id: "ig-reel",
        name: "Instagram Reel",
        platform: "Instagram",
        price: 500,
        bullets: ["Up to 45 second video", "Workout integration", "Caption included"],
        limit: { used: 4, max: 6, period: "this month" },
      },
    ],
    matchScore: 91,
    matchReasons: [
      "Audience actively buys sportswear",
      "Highest engagement rate in your category",
      "Well under your budget",
      "Two open slots in early October",
    ],
    availability: "Available from Oct 1",
    unavailableDates: ["2026-10-02", "2026-10-09", "2026-10-16"],
  },
  {
    username: "techuz",
    name: "Jasur Rahimov",
    photo: tech,
    verified: true,
    category: "Technology",
    tags: ["Technology", "Business"],
    location: "Tashkent, Uzbekistan",
    bio: "Gadget reviews, startup takes and tech explainers for a young professional audience.",
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
      gender: "68% male",
      country: "Uzbekistan",
      split: [
        { label: "Uzbekistan", value: 69 },
        { label: "Kazakhstan", value: 14 },
        { label: "Russia", value: 10 },
        { label: "Other", value: 7 },
      ],
    },
    services: [
      {
        id: "tg-post",
        name: "Telegram Post",
        platform: "Telegram",
        price: 200,
        bullets: ["Sponsored post", "Pinned 12 hours", "Link included"],
        limit: { used: 6, max: 10, period: "this month" },
      },
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 450,
        bullets: ["2 Stories", "Product demo", "Link sticker"],
        limit: { used: 7, max: 10, period: "this month" },
      },
    ],
    matchScore: 84,
    matchReasons: ["Premium professional audience", "Strong Telegram reach", "Fast turnaround"],
    availability: "Available from Oct 8",
    unavailableDates: ["2026-10-10", "2026-10-11", "2026-10-24"],
  },
  {
    username: "fashionista",
    name: "Kamila Tursunova",
    photo: fashion,
    verified: true,
    category: "Fashion",
    tags: ["Fashion", "Beauty"],
    location: "Tashkent, Uzbekistan",
    bio: "Fashion editor turned creator. Styling, brand edits and seasonal lookbooks.",
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
      gender: "79% female",
      country: "Uzbekistan",
      split: [
        { label: "Uzbekistan", value: 66 },
        { label: "Kazakhstan", value: 15 },
        { label: "Russia", value: 12 },
        { label: "Other", value: 7 },
      ],
    },
    services: [
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 350,
        bullets: ["3 Stories", "Styling sequence", "Link sticker"],
        limit: { used: 10, max: 10, period: "this month" },
      },
      {
        id: "ig-post",
        name: "Instagram Post",
        platform: "Instagram",
        price: 800,
        bullets: ["Editorial feed post", "Brand tag", "Caption included"],
        limit: { used: 2, max: 6, period: "this month" },
      },
    ],
    matchScore: 78,
    matchReasons: ["Strong lifestyle crossover", "High save rate on product posts"],
    availability: "Available from Oct 6",
    unavailableDates: ["2026-10-08", "2026-10-15", "2026-10-22"],
  },
  {
    username: "comedian",
    name: "Bekzod Aliev",
    photo: comedy,
    verified: true,
    category: "Comedy",
    tags: ["Comedy", "Lifestyle"],
    location: "Samarkand, Uzbekistan",
    bio: "Sketches and everyday humour. Brand integrations that people actually watch to the end.",
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
      gender: "55% male",
      country: "Uzbekistan",
      split: [
        { label: "Uzbekistan", value: 71 },
        { label: "Kazakhstan", value: 13 },
        { label: "Russia", value: 10 },
        { label: "Other", value: 6 },
      ],
    },
    services: [
      {
        id: "ig-story",
        name: "Instagram Story",
        platform: "Instagram",
        price: 500,
        bullets: ["2 Stories", "In-character mention", "Link sticker"],
        limit: { used: 6, max: 8, period: "this month" },
      },
      {
        id: "ig-reel",
        name: "Instagram Reel",
        platform: "Instagram",
        price: 1000,
        bullets: ["Sketch integration", "Script by creator", "Up to 60 seconds"],
        limit: { used: 5, max: 5, period: "this month" },
      },
    ],
    matchScore: 74,
    matchReasons: ["Largest reach on the platform", "Very high completion rate"],
    availability: "Available from Oct 12",
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

export const getCreator = (username: string) => creators.find((c) => c.username === username);

export const reviews = [
  {
    company: "Nike Uzbekistan",
    initials: "NU",
    rating: 5,
    comment:
      "Delivered ahead of schedule and the story drove our best single-day traffic this quarter. Communication was excellent.",
    type: "Instagram Story",
    date: "Sep 2026",
  },
  {
    company: "FitFuel",
    initials: "FF",
    rating: 5,
    comment: "The reel felt native, not like an ad. We re-booked the same week.",
    type: "Instagram Reel",
    date: "Aug 2026",
  },
  {
    company: "Uzum Market",
    initials: "UM",
    rating: 4,
    comment: "Solid reach and clean reporting. Creative feedback loop could be a bit faster.",
    type: "Telegram Post",
    date: "Aug 2026",
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
    title: "Nike Summer Campaign",
    creator: "footballstar",
    format: "Instagram Story",
    date: "October 5, 2026",
    amount: 420,
    status: "Confirmed" as CampaignStatus,
  },
  {
    id: "RB-48104",
    title: "Protein Bar Launch",
    creator: "fitblogger",
    format: "Instagram Reel",
    date: "October 11, 2026",
    amount: 525,
    status: "Content Review" as CampaignStatus,
  },
  {
    id: "RB-47980",
    title: "Autumn Lookbook",
    creator: "fashionista",
    format: "Instagram Post",
    date: "October 18, 2026",
    amount: 840,
    status: "Scheduled" as CampaignStatus,
  },
  {
    id: "RB-47755",
    title: "Smartwatch Drop",
    creator: "techuz",
    format: "Telegram Post",
    date: "September 12, 2026",
    amount: 210,
    status: "Completed" as CampaignStatus,
  },
];
