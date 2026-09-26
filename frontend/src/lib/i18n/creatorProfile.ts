export const creatorProfile = {
  notFoundTitle: "Kreator topilmadi — Reklama.uz",
  notFoundDescription: "Bu kreator profili topilmadi.",
  bookTitle: (name: string, username: string) =>
    `${name} (@${username}) bilan reklama — Reklama.uz`,
  bookDescription: (
    name: string,
    followers: string,
    engagement: string,
    platforms: string,
  ) =>
    `${name} bilan reklama band qiling — ${followers} obunachi va ${platforms} platformalarida ${engagement} faollik.`,

  locationNotSet: "Manzil ko‘rsatilmagan",
  bioNotSet: "Bu kreator hali bio qo‘shmagan.",
  availabilityNotSet: "Mavjudlik belgilanmagan",
  availableDaily: (from: string, to: string) =>
    `Har kuni ${from}–${to} band qilish mumkin`,

  notFoundHeading: "Kreator topilmadi",
  notFoundBody: (username: string) =>
    `"${username}" uchun profil topilmadi. Ehtimol, ular foydalanuvchi nomini o‘zgartirishgan yoki havola noto‘g‘ri.`,
  browseCreators: "Kreatorlarni ko‘rib chiqish",

  discover: "Kashf etish",
  reviewsCount: (n: number) => `${n} ta sharh`,
  saved: "Saqlangan",
  save: "Saqlash",

  followers: "Obunachilar",
  avgViews: "O‘rtacha ko‘rish",
  engagement: "Faollik",
  responseRate: "Javob berish darajasi",

  bookServiceEyebrow: "Xizmatni band qilish",
  advertisingPackages: "Reklama paketlari",
  selectPlatformServiceDateTime: "Platforma, xizmat, sana va vaqtni tanlang.",

  step1Platform: "1. Platforma",
  step2Service: "2. Xizmat",
  platformServices: (platform: string) => `${platform} xizmatlari`,
  step3Schedule: "3. Jadval",
  chooseAvailableDateTime: "Mavjud sana va vaqtni tanlang",
  blockedDatesInclude: (service: string) =>
    `Band qilingan sanalarga ${service} uchun mavjud buyurtmalar kiradi.`,
  thisService: "ushbu xizmat",
  slotsLeft: (left: number, max: number) => `${max} tadan ${left} tasi qoldi`,

  publishingWindow: "Chop etish oynasi",
  choosePublishingPeriod:
    "So‘ralgan joylashtirish uchun vaqt oralig‘ini tanlang.",
  from: "Boshlanishi",
  to: "Tugashi",
  endTimeAfterStart: "Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak.",

  packageTotal: "Paket narxi",
  monthlyCapacityReached: "Oylik limit to‘ldi",
  requestToBook: "Band qilishni so‘rash",
  chooseDateToContinue: "Davom etish uchun sanani tanlang",

  about: "Haqida",
  audienceInsights: "Auditoriya tahlili",
  age: "Yosh",
  gender: "Jins",
  primaryMarket: "Asosiy bozor",
  clientReviews: "Mijozlar sharhlari",

  moreInCategory: (category: string) => `${category} bo‘yicha yana`,
  moreCreatorsToExplore: "Kashf etish uchun boshqa kreatorlar",

  // Booking dialog
  requestSent: "So‘rov yuborildi",
  requestSentDescription: (username: string, rate: string) =>
    `@${username} ning javob berish darajasi ${rate} va ushbu bandlovni tez orada tasdiqlaydi. Javob berishlari bilanoq sizga xabar beriladi.`,
  service: "Xizmat",
  platform: "Platforma",
  date: "Sana",
  time: "Vaqt",
  total: "Jami",
  done: "Tayyor",

  stepReview: "Ko‘rib chiqish",
  stepCampaignDetails: "Kampaniya tafsilotlari",
  stepPayment: "To‘lov",

  reviewBookingTitle: "Bandlovingizni ko‘rib chiqing",
  reviewBookingDescription:
    "Davom etishdan oldin xizmat va jadvalni tasdiqlang.",
  creator: "Kreator",
  cancel: "Bekor qilish",
  nextCampaignDetails: "Keyingisi — Kampaniya tafsilotlari",

  campaignDetailsTitle: "Kampaniya tafsilotlari",
  campaignDetailsDescription:
    "Kreatorga ushbu kampaniya nima haqida ekanini ayting.",
  campaignName: "Kampaniya nomi",
  optional: "ixtiyoriy",
  campaignNamePlaceholder: "masalan, Yozgi kolleksiya taqdimoti",
  briefInstructions: "Brif va ko‘rsatmalar",
  briefPlaceholder:
    "Mahsulotni, asosiy xabarni, hashteglarni, kreator uchun qilish/qilmaslik kerak bo‘lgan narsalarni tasvirlab bering…",
  charactersCount: (n: number) => `${n}/1000 belgi`,
  back: "Orqaga",
  nextPayment: "Keyingisi — To‘lov",

  paymentDetailsTitle: "To‘lov tafsilotlari",
  paymentDetailsDescription:
    "Kreator tasdiqlamaguncha kartangizdan pul yechilmaydi.",
  cardNumber: "Karta raqami",
  expiry: "Amal qilish muddati",
  cvc: "CVC",
  cardholderName: "Karta egasining ismi",
  cardholderPlaceholder: "Kartadagi ism",
  paymentSecureNote:
    "To‘lovlar xavfsiz va faqat kreator tasdiqlaganidan so‘ng amalga oshiriladi. Bugun hech qanday to‘lov yechilmaydi.",
  sending: "Yuborilmoqda…",
  confirmAndSend: "Tasdiqlash va yuborish",
  couldNotSendRequest: "So‘rovni yuborib bo‘lmadi.",

  fullyBooked: "To’liq band",
  availabilityPrefix: "Mavjudlik",

  // Birthday booking
  birthdayPlatform: "Tug’ilgan kun tabrigi",
  stepBirthdayDetails: "Tabrik tafsilotlari",
  nextBirthdayDetails: "Keyingisi — Tabrik tafsilotlari",
  birthdayDetailsTitle: "Tabrik tafsilotlari",
  birthdayDetailsDescription: "Kreator uchun tabrik matnini va yetkazib berish ma’lumotlarini kiriting.",
  birthdayGreetingLabel: "Tabrik matni",
  birthdayGreetingPlaceholder: "masalan, \"Aziz onam, tug’ilgan kuningiz muborak bo’lsin! Siz mening hayotimdagi eng muhim insonsiz…\"",
  birthdayRecipientLabel: "Kimni tabriklash",
  birthdayRecipientPlaceholder: "masalan, \"onam\", \"akam\", \"do’stim\"",
  deliveryDateTimeLabel: "Yetkazib berish sanasi va vaqti",
  deliveryDateTimeHint: "Video shu sana va vaqtda Telegram orqali yetkazib beriladi.",
  recipientPhoneLabel: "Telefon raqami",
  recipientPhonePlaceholder: "+998 90 000 00 00",
  recipientPhoneHint: "Ushbu raqamga video Telegram orqali yuboriladi.",
  deliveryDateLabel: "Yetkazib berish",
  recipient: "Tabrik qabul qiluvchi",

  instagramInsights: "Instagram tahlili",
  recentPerformance: "So‘nggi auditoriya va kontent samaradorligi",
  mockImportNote: "Namunaviy import · so‘nggi 30 kun",
  reach: "Qamrov",
  impressions: "Ko‘rsatishlar",
  profileActivity: "Profil faolligi",
  audience: "Auditoriya",
  largestAgeGroup: "Eng katta yosh guruhi",
  topCities: "Top shaharlar",
  contentPerformance: "Kontent darajasidagi samaradorlik",
  latestReel: "So‘nggi Reel",
  productStorySet: "Mahsulot Story to‘plami",
  feedPost: "Lenta posti",
  plays: (n: string) => `${n} ko‘rish`,
  reachCount: (n: string) => `${n} qamrov`,
  linkTaps: (n: string) => `${n} havola bosilishi`,
  engagementPct: (n: string) => `${n} faollik`,
};
