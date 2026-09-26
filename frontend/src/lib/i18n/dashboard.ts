// Strings for the /dashboard route, its shell (DashShell), and the
// StatusBadge component (shared between the dashboard's booking table and
// the creator studio's campaign statuses).
export const dashboard = {
  pageTitle: "Boshqaruv paneli — Reklama.uz",
  navOverview: "Umumiy ko‘rinish",
  roleInfluencer: "Kreator / Influencer",
  roleBusiness: "Biznes / Brend",
  incoming: "Kiruvchi",
  myCampaigns: "Mening kampaniyalarim",
  bookingRequests: "Bron so‘rovlari",
  yourBookings: "Sizning bronlaringiz",
  findCreators: "Kreatorlarni topish",
  couldNotLoadBookings: "Bronlarni yuklab bo‘lmadi.",
  noBookingsYet: "Hozircha bronlar yo‘q",
  noBookingsInfluencerHint:
    "Xizmatlaringizni kashf etgan va band qilgan brendlar shu yerda ko‘rinadi.",
  noBookingsBusinessHint:
    "Kreatorni toping, xizmatni tanlang, sanani belgilang va birinchi so‘rovingizni yuboring.",
  discoverCreators: "Kreatorlarni kashf eting",
  tableReference: "Raqami",
  tableDate: "Sana",
  tableAmount: "Summa",
  tableStatus: "Holat",
  tableActions: "Amallar",
  confirmBooking: "Tasdiqlash",
  declineBooking: "Rad etish",
  cancelBooking: "Bekor qilish",
  couldNotUpdateBooking: "Bron holatini yangilab bo‘lmadi.",
  calendarLabel: "Kalendar",
  manageAvailability: "Bandligingizni boshqaring",
  availabilityHint:
    "Sanani bloklash yoki blokdan chiqarish uchun bosing. Bloklangan sanalarni mijozlar band qila olmaydi.",
  backToSite: "Saytga qaytish",
  // Keyed by the exact display strings StatusBadge receives (Title Case,
  // matching its `styles` lookup) — not the raw backend enum values, which
  // are already covered by BOOKING_STATUS_LABELS in enums.ts.
  statusLabels: {
    Pending: "Kutilmoqda",
    Confirmed: "Tasdiqlangan",
    "Content Review": "Kontent ko‘rib chiqilmoqda",
    Scheduled: "Rejalashtirilgan",
    Published: "Chop etilgan",
    Completed: "Yakunlangan",
    Cancelled: "Bekor qilingan",
  } as Record<string, string>,
};
