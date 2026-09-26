// Shared by lib/error-page.ts (SSR crash fallback) and routes/__root.tsx
// (404 + client error boundary).
export const errorPage = {
  pageDidNotLoad: "Bu sahifa yuklanmadi",
  somethingWentWrong:
    "Bizning tomonimizda xatolik yuz berdi. Sahifani yangilab ko‘rishingiz yoki bosh sahifaga qaytishingiz mumkin.",
  tryAgain: "Qaytadan urinish",
  goHome: "Bosh sahifaga qaytish",
  notFoundTitle: "Sahifa topilmadi",
  notFoundDescription: "Siz izlagan sahifa mavjud emas yoki ko‘chirilgan.",
};
