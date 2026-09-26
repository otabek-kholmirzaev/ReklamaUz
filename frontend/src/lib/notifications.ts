export type AppNotification = {
  id: string;
  creatorUsername: string;
  creatorName: string;
  serviceName: string;
  bookingDate: string;        // "YYYY-MM-DD" of the actual ad date
  reminderDaysBefore: 3 | 1; // which reminder this is
  scheduledFor: string;       // "YYYY-MM-DD" when reminder fires
  read: boolean;
  createdAt: string;
};

const STORAGE_KEY = "reklama-notifications";
export const NOTIFICATIONS_EVENT = "reklama:notifications";

export function getNotifications(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as AppNotification[];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT));
}

export function addBookingNotifications({
  creatorUsername,
  creatorName,
  serviceName,
  bookingDate,
}: {
  creatorUsername: string;
  creatorName: string;
  serviceName: string;
  bookingDate: Date;
}): void {
  const bookingDateStr = bookingDate.toISOString().split("T")[0];

  const threeDaysBefore = new Date(bookingDate);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

  const oneDayBefore = new Date(bookingDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);

  const now = new Date().toISOString();
  const newNotifs: AppNotification[] = [
    {
      id: crypto.randomUUID(),
      creatorUsername,
      creatorName,
      serviceName,
      bookingDate: bookingDateStr,
      reminderDaysBefore: 3,
      scheduledFor: threeDaysBefore.toISOString().split("T")[0],
      read: false,
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      creatorUsername,
      creatorName,
      serviceName,
      bookingDate: bookingDateStr,
      reminderDaysBefore: 1,
      scheduledFor: oneDayBefore.toISOString().split("T")[0],
      read: false,
      createdAt: now,
    },
  ];

  saveNotifications([...newNotifs, ...getNotifications()]);
}
