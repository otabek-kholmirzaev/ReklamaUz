// Generic fallback error strings shown when the backend didn't return a
// user-facing `detail` message, or the request couldn't be made at all.
export const errors = {
  couldNotReachServer:
    "Serverga ulanib bo‘lmadi. Backend ishga tushirilganiga ishonch hosil qiling.",
  accountAlreadyExists: "Bu elektron pochta bilan hisob allaqachon mavjud.",
  invalidCredentials: "Elektron pochta yoki parol noto‘g‘ri.",
  verificationExpired:
    "Tasdiqlash kodi muddati tugagan. Iltimos, qaytadan ro‘yxatdan o‘ting.",
  incorrectVerificationCode: "Tasdiqlash kodi noto‘g‘ri.",
  somethingWentWrong: "Xatolik yuz berdi. Qaytadan urinib ko‘ring.",
  apiError: (status: number) => `API xatosi ${status}`,
};
