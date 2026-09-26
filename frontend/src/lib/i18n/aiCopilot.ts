// Uzbek strings for the AI Campaign Copilot (lib/copilot.ts + routes/copilot.tsx).
export const aiCopilot = {
  couldNotRespond: "Kopilot hozir javob bera olmadi.",
  pageTitle: "AI Kampaniya Kopiloti — Reklama.uz",
  pageDescription:
    "Kampaniyangizni oddiy so‘zlar bilan tasvirlab bering, Reklama.uz esa unga mos eng yaxshi reklama imkoniyatlarini topib beradi.",
  campaigns: "Kampaniyalar",
  newCampaign: "Yangi kampaniya",
  deleteConversation: (title: string) => `"${title}" ni o‘chirish`,
  history: "Tarix",
  historyPrivacyNote:
    "Kampaniya tarixingiz ushbu brauzerda maxfiy tarzda saqlanadi.",
  heading: "AI Kampaniya Kopiloti",
  subheading: "Kreator-marketingni rejalashtirish bo‘yicha hamkoringiz",
  welcomeMessage:
    "Salom, men sizning kampaniya kopilotingizman. Nimani reklama qilmoqchi ekaningizni, kimga yetkazmoqchi ekaningizni va byudjetingizni ayting. Men aniq brif tuzishga va mos kreatorlarni topishga yordam beraman.",
  suggestedPrompts: [
    "Toshkentdagi go‘zallik kreatorlarini toping",
    "Instagram’da lansirovka rejalashtiring",
    "$1 500 dan kam byudjet bilan futbol muxlislariga yeting",
  ],
  thinking: "Kopilot o‘ylamoqda…",
  inputPlaceholder: "Kopilotga kampaniyangiz haqida xabar yozing…",
  sendHint: "Yuborish uchun Enter · Yangi qator uchun Shift + Enter",
  sendAria: "Xabar yuborish",
  disclaimer:
    "Kopilot kampaniya yo‘nalishini taklif qiladi; yakuniy mavjudlik har bir kreator profilida tasdiqlanadi.",
  priceFrom: (price: number) => `$${price} dan`,
};
