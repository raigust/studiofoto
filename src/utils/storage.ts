import confetti from 'canvas-confetti';
import {
  Booking,
  PortfolioItem,
  DaySchedule,
  AdminNotification,
  StudioSettings,
  TimeSlot,
  StudioTask,
  StudioGear,
  StudioExpense,
  AdminProfile,
  AdminSession,
} from '../types';
import {
  INITIAL_BOOKINGS,
  INITIAL_PORTFOLIO,
  INITIAL_DAY_SCHEDULES,
  DEFAULT_STUDIO_SETTINGS,
  STANDARD_SLOT_TEMPLATES,
  DEFAULT_STUDIO_TASKS,
  INITIAL_STUDIO_GEAR,
  INITIAL_STUDIO_EXPENSES,
  HERO_STUDIO_IMAGE,
} from '../data/mockData';

const STORAGE_KEYS = {
  BOOKINGS: 'diafera_bookings_v1',
  PORTFOLIO: 'diafera_portfolio_v1',
  DAY_SCHEDULES: 'diafera_day_schedules_v1',
  NOTIFICATIONS: 'diafera_notifications_v1',
  SETTINGS: 'diafera_settings_v1',
  ADMIN_AUTH: 'diafera_admin_auth_v1',
  TASKS: 'diafera_tasks_v1',
  ADMIN_THEME: 'diafera_admin_theme_v1',
  GEAR: 'diafera_gear_v1',
  EXPENSES: 'diafera_expenses_v1',
  PROFILE: 'diafera_admin_profile_v1',
  PASSWORD: 'diafera_admin_pwd_v1',
  SESSION: 'diafera_admin_session_v1',
  ATTEMPTS: 'diafera_admin_attempts_v1',
};

export const getStoredTasks = (): StudioTask[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_STUDIO_TASKS));
      return DEFAULT_STUDIO_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading tasks', e);
    return DEFAULT_STUDIO_TASKS;
  }
};

export const saveStoredTasks = (tasks: StudioTask[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks', e);
  }
};

export const getStoredGear = (): StudioGear[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GEAR);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GEAR, JSON.stringify(INITIAL_STUDIO_GEAR));
      return INITIAL_STUDIO_GEAR;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading gear', e);
    return INITIAL_STUDIO_GEAR;
  }
};

export const saveStoredGear = (gear: StudioGear[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GEAR, JSON.stringify(gear));
  } catch (e) {
    console.error('Error saving gear', e);
  }
};

export const getStoredExpenses = (): StudioExpense[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_STUDIO_EXPENSES));
      return INITIAL_STUDIO_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading expenses', e);
    return INITIAL_STUDIO_EXPENSES;
  }
};

export const saveStoredExpenses = (expenses: StudioExpense[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses', e);
  }
};

export const getStoredAdminTheme = (): 'light' | 'dark' => {
  try {
    return (localStorage.getItem(STORAGE_KEYS.ADMIN_THEME) as 'light' | 'dark') || 'light';
  } catch {
    return 'light';
  }
};

export const saveStoredAdminTheme = (theme: 'light' | 'dark') => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_THEME, theme);
  } catch (e) {
    console.error('Error saving admin theme', e);
  }
};

// --- Storage Accessors ---

export const getStoredBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading bookings from localStorage', e);
    return INITIAL_BOOKINGS;
  }
};

export const saveStoredBookings = (bookings: Booking[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving bookings to localStorage', e);
  }
};

/**
 * Sanitized public availability for public customer view.
 * Prevents leaking private customer names, phone numbers, notes, and payment info
 * when an unauthenticated user views the website.
 */
export const getPublicBookingsAvailability = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) return [];
    const list: Booking[] = JSON.parse(raw);
    return list.map((b) => ({
      id: b.id,
      customerName: 'Telah Dipesan',
      customerPhone: '***',
      packageId: b.packageId,
      packageName: 'Sesi Foto Terjadwal',
      category: b.category,
      date: b.date,
      timeSlot: b.timeSlot,
      timeSlotId: b.timeSlotId,
      numberOfPeople: 1,
      totalPrice: 0,
      dpAmount: 0,
      paymentStatus: 'PAID_FULL',
      status: b.status,
      createdAt: b.createdAt,
      whatsappNotified: false,
    }));
  } catch {
    return [];
  }
};

export const searchCustomerBookingByQuery = (query: string): Booking[] => {
  const cleanTerm = query.toLowerCase().trim();
  if (!cleanTerm) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) return [];
    const list: Booking[] = JSON.parse(raw);
    return list.filter((b) => {
      const idMatch = b.id.toLowerCase() === cleanTerm || b.id.toLowerCase().includes(cleanTerm);
      const nameMatch = b.customerName.toLowerCase().includes(cleanTerm);
      const phoneDigits = b.customerPhone.replace(/\D/g, '');
      const queryDigits = cleanTerm.replace(/\D/g, '');
      const phoneMatch = queryDigits.length >= 4 && phoneDigits.includes(queryDigits);
      return idMatch || nameMatch || phoneMatch;
    });
  } catch {
    return [];
  }
};

export const getStoredPortfolio = (): PortfolioItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(INITIAL_PORTFOLIO));
      return INITIAL_PORTFOLIO;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading portfolio from localStorage', e);
    return INITIAL_PORTFOLIO;
  }
};

export const saveStoredPortfolio = (items: PortfolioItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving portfolio to localStorage', e);
  }
};

export const getStoredDaySchedules = (): Record<string, DaySchedule> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAY_SCHEDULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DAY_SCHEDULES, JSON.stringify(INITIAL_DAY_SCHEDULES));
      return INITIAL_DAY_SCHEDULES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading day schedules from localStorage', e);
    return INITIAL_DAY_SCHEDULES;
  }
};

export const saveStoredDaySchedules = (schedules: Record<string, DaySchedule>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAY_SCHEDULES, JSON.stringify(schedules));
  } catch (e) {
    console.error('Error saving day schedules to localStorage', e);
  }
};

export const getStoredNotifications = (): AdminNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      const initialNotes: AdminNotification[] = [
        {
          id: 'notif-1',
          type: 'NEW_BOOKING',
          title: 'Pengajuan Booking Baru',
          message: 'Bima Satria Wardhana mengajukan booking sesi Personal Portrait untuk 9 Okt 2026.',
          timestamp: '2026-10-07T10:05:00Z',
          read: false,
          bookingId: 'DFS-202610-003',
        },
        {
          id: 'notif-2',
          type: 'NEW_BOOKING',
          title: 'Pengajuan Booking Baru',
          message: 'Kallista Skin Botanicals mengajukan booking sesi Commercial Product untuk 9 Okt 2026.',
          timestamp: '2026-10-07T10:20:00Z',
          read: false,
          bookingId: 'DFS-202610-004',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotes));
      return initialNotes;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading notifications from localStorage', e);
    return [];
  }
};

export const saveStoredNotifications = (notifications: AdminNotification[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications to localStorage', e);
  }
};

export const getStoredSettings = (): StudioSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_STUDIO_SETTINGS));
      return DEFAULT_STUDIO_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
    return DEFAULT_STUDIO_SETTINGS;
  }
};

export const saveStoredSettings = (settings: StudioSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
};

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: 'Raihan Gusti',
  role: 'Lead Photographer & Studio Director',
  email: 'raihangusti066@gmail.com',
  phone: '6281289004512',
  avatarUrl: HERO_STUDIO_IMAGE,
  bio: 'Spesialis visual sinematik minimalis dan editorial fashion portrait di Bandung.',
  sessionTimeoutMinutes: 30,
  lastLoginAt: '2026-10-07T10:00:00Z',
  twoFactorEnabled: false,
};

export const getStoredAdminProfile = (): AdminProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_ADMIN_PROFILE));
      return DEFAULT_ADMIN_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ADMIN_PROFILE, ...parsed };
  } catch (e) {
    console.error('Error reading admin profile', e);
    return DEFAULT_ADMIN_PROFILE;
  }
};

export const saveStoredAdminProfile = (profile: AdminProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    // Also synchronize adminName and adminRole in studio settings
    const currentSettings = getStoredSettings();
    saveStoredSettings({
      ...currentSettings,
      adminName: profile.name,
      adminRole: profile.role,
    });
  } catch (e) {
    console.error('Error saving admin profile', e);
  }
};

export const getStoredAdminPassword = (): string => {
  try {
    const pwd = localStorage.getItem(STORAGE_KEYS.PASSWORD);
    return pwd || 'admin123';
  } catch {
    return 'admin123';
  }
};

export const saveStoredAdminPassword = (newPassword: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword);
  } catch (e) {
    console.error('Error saving admin password', e);
  }
};

export const validateAdminPassword = (input: string): boolean => {
  const current = getStoredAdminPassword();
  // Allow currently configured password or emergency master PIN
  return input === current || input === 'diafera';
};

// --- Brute Force Protection & Rate Limiting ---
interface LoginAttemptsData {
  failedCount: number;
  lockedUntil: number;
}

export const getLoginAttemptsStatus = (): { allowed: boolean; remainingAttempts: number; lockTimeRemainingSec: number } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return { allowed: true, remainingAttempts: 5, lockTimeRemainingSec: 0 };
    const data: LoginAttemptsData = JSON.parse(raw);
    const now = Date.now();
    if (data.lockedUntil && data.lockedUntil > now) {
      const remainingSec = Math.ceil((data.lockedUntil - now) / 1000);
      return { allowed: false, remainingAttempts: 0, lockTimeRemainingSec: remainingSec };
    }
    const remaining = Math.max(0, 5 - data.failedCount);
    return { allowed: true, remainingAttempts: remaining, lockTimeRemainingSec: 0 };
  } catch {
    return { allowed: true, remainingAttempts: 5, lockTimeRemainingSec: 0 };
  }
};

export const recordLoginAttempt = (success: boolean): { allowed: boolean; remainingAttempts: number; lockTimeRemainingSec: number } => {
  try {
    if (success) {
      localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
      return { allowed: true, remainingAttempts: 5, lockTimeRemainingSec: 0 };
    }
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    let data: LoginAttemptsData = raw ? JSON.parse(raw) : { failedCount: 0, lockedUntil: 0 };
    const now = Date.now();
    if (data.lockedUntil && data.lockedUntil < now) {
      data = { failedCount: 0, lockedUntil: 0 };
    }
    data.failedCount += 1;
    if (data.failedCount >= 5) {
      data.lockedUntil = now + 60 * 1000; // 60 seconds lockout
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(data));
      return { allowed: false, remainingAttempts: 0, lockTimeRemainingSec: 60 };
    }
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(data));
    return { allowed: true, remainingAttempts: Math.max(0, 5 - data.failedCount), lockTimeRemainingSec: 0 };
  } catch {
    return { allowed: true, remainingAttempts: 5, lockTimeRemainingSec: 0 };
  }
};

// --- Session Security Middleware ---
export const createAdminSession = (profile: AdminProfile): AdminSession => {
  const timeoutMs = (profile.sessionTimeoutMinutes || 30) * 60 * 1000;
  const now = Date.now();
  const session: AdminSession = {
    token: `diafera_sec_${now}_${Math.random().toString(36).substring(2, 9)}`,
    loginTime: now,
    expiresAt: now + timeoutMs,
    adminName: profile.name,
    adminEmail: profile.email,
  };
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    saveStoredAdminProfile({
      ...profile,
      lastLoginAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error creating admin session', e);
  }
  return session;
};

export const getAdminSession = (): AdminSession | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const verifyAdminSession = (): boolean => {
  const session = getAdminSession();
  return session !== null;
};

export const refreshAdminSession = () => {
  try {
    const session = getAdminSession();
    if (session) {
      const profile = getStoredAdminProfile();
      const timeoutMs = (profile.sessionTimeoutMinutes || 30) * 60 * 1000;
      session.expiresAt = Date.now() + timeoutMs;
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Error refreshing session', e);
  }
};

export const clearAdminSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  } catch (e) {
    console.error(e);
  }
};

export const getAdminAuthStatus = (): boolean => {
  return verifyAdminSession();
};

export const setAdminAuthStatus = (isLoggedIn: boolean) => {
  if (!isLoggedIn) {
    clearAdminSession();
  }
};

// --- Computed Slot Status Generator ---

export const getComputedSlotsForDate = (
  date: string,
  bookings: Booking[],
  daySchedules: Record<string, DaySchedule>
): {
  slots: TimeSlot[];
  dayInfo: DaySchedule;
  isFullyBookedOrClosed: boolean;
  activeApprovedCount: number;
} => {
  const dayInfo = daySchedules[date] || {
    date,
    isClosed: false,
    maxCapacity: 5,
  };

  const dayBookings = bookings.filter((b) => b.date === date && b.status !== 'REJECTED');
  const approvedBookings = dayBookings.filter((b) => b.status === 'APPROVED');
  const activeApprovedCount = approvedBookings.length;

  // Check if max capacity reached (e.g., admin set maxCapacity = 1)
  const isCapacityReached = dayInfo.maxCapacity > 0 && activeApprovedCount >= dayInfo.maxCapacity;
  const isDayFullyUnavailable = dayInfo.isClosed || isCapacityReached;

  const slots: TimeSlot[] = STANDARD_SLOT_TEMPLATES.map((tmpl) => {
    const existingBooking = dayBookings.find((b) => b.timeSlotId === tmpl.time);
    const isManuallyLocked = dayInfo.manuallyLockedSlots?.includes(tmpl.time);

    let status: TimeSlot['status'] = 'available';
    let bookingId: string | undefined = undefined;
    let customerName: string | undefined = undefined;
    let packageName: string | undefined = undefined;
    let blockReason: string | undefined = undefined;

    if (dayInfo.isClosed) {
      status = 'blocked';
      blockReason = dayInfo.closeReason || 'Studio Ditutup oleh Admin';
    } else if (isManuallyLocked) {
      status = 'blocked';
      blockReason = 'Slot dinonaktifkan oleh Admin';
    } else if (existingBooking) {
      bookingId = existingBooking.id;
      customerName = existingBooking.customerName;
      packageName = existingBooking.packageName;
      if (existingBooking.status === 'APPROVED') {
        status = 'booked';
      } else if (existingBooking.status === 'PENDING') {
        status = 'pending';
      }
    } else if (isCapacityReached) {
      // If capacity reached, unbooked slots become unavailable!
      status = 'blocked';
      blockReason = `Batas Kuota Hari Ini Terpenuhi (${activeApprovedCount}/${dayInfo.maxCapacity} Customer)`;
    }

    return {
      id: `${date}_${tmpl.time}`,
      time: tmpl.time,
      endTime: tmpl.endTime,
      label: tmpl.label,
      period: tmpl.period,
      status,
      bookingId,
      customerName,
      packageName,
      blockReason,
    };
  });

  return {
    slots,
    dayInfo,
    isFullyBookedOrClosed: isDayFullyUnavailable,
    activeApprovedCount,
  };
};

// --- WhatsApp Link Generators ---

export const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

export const generateApprovalWhatsAppUrl = (
  booking: Booking,
  studioSettings: StudioSettings
): string => {
  const phone = formatPhoneNumber(booking.customerPhone);
  const formattedDate = new Date(booking.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedDp = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(booking.dpAmount);

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(booking.totalPrice);

  const message = `Halo Kak *${booking.customerName}*, salam hangat dari *${studioSettings.studioName}*! ✨

Kabar baik! Pengajuan jadwal sesi foto studio Anda telah *DISETUJUI & TERKONFIRMASI RESMI*.

📋 *RINCIAN RESERVASI STUDIO:*
• *Kode Booking:* #${booking.id}
• *Layanan:* ${booking.packageName}
• *Tanggal:* ${formattedDate}
• *Waktu Sesi:* ${booking.timeSlot}
• *Jumlah Orang:* ${booking.numberOfPeople} Orang
• *Total Biaya:* ${formattedTotal}
• *Status Pembayaran:* DP Tercatat (${formattedDp})

📍 *LOKASI STUDIO:*
${studioSettings.address}

📌 *CATATAN PENTING:*
1. Mohon tiba 15 menit sebelum waktu sesi dimulai untuk persiapan makeup / outfit.
2. Jika ada perubahan konsep atau tambahan orang, silakan koordinasikan dengan kami.

Terima kasih atas kepercayaannya. Kami siap mengabadikan momen berharga Anda dengan standar terbaik! 📷✨

_Tim ${studioSettings.studioName}_`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const generateRejectionWhatsAppUrl = (
  booking: Booking,
  studioSettings: StudioSettings,
  reason: string
): string => {
  const phone = formatPhoneNumber(booking.customerPhone);
  const formattedDate = new Date(booking.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const message = `Halo Kak *${booking.customerName}*, terima kasih telah melakukan pengajuan reservasi di *${studioSettings.studioName}*.

Mohon maaf, pengajuan sesi foto untuk tanggal *${formattedDate}* jam *${booking.timeSlot}* belum dapat kami setujui karena:
"${reason || 'Jadwal studio pada waktu tersebut penuh / ada agenda internal studio'}".

Jika Kakak berkenan menjadwalkan ulang ke tanggal atau jam lain, kami dengan senang hati akan membantu mencarikan slot terbaik.

Salam hangat,
_Tim ${studioSettings.studioName}_`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const generateCustomerInquiryWhatsAppUrl = (
  booking: Booking,
  studioSettings: StudioSettings
): string => {
  const phone = formatPhoneNumber(studioSettings.whatsappNumber);
  const message = `Halo Admin ${studioSettings.studioName}, saya ${booking.customerName} (Kode Booking: #${booking.id}). Saya ingin menanyakan terkait jadwal sesi foto saya tanggal ${booking.date} jam ${booking.timeSlot}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const generateDriveDeliveryWhatsAppUrl = (
  booking: Booking,
  driveUrl: string,
  studioSettings: StudioSettings
): string => {
  const phone = formatPhoneNumber(booking.customerPhone);
  const message = `Halo Kak *${booking.customerName}*! ✨

Hasil sesi foto studio Anda bersama *${studioSettings.studioName}* (Kode Booking: #${booking.id}) sudah siap dan dapat diakses! 🎉📸

📁 *LINK GOOGLE DRIVE MASTER & EDIT:*
${driveUrl}

📌 *PETUNJUK:*
1. Disarankan download file menggunakan laptop/PC untuk menjaga resolusi asli tanpa kompresi.
2. Link aktif dan tersimpan aman di cloud kami selama 30 hari ke depan.

Terima kasih banyak telah mempercayakan momen Anda kepada ${studioSettings.studioName}. Kami tunggu di sesi berikutnya! 🖤

Salam hangat,
_Tim ${studioSettings.studioName}_`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const generateReminderHMin1WhatsAppUrl = (
  booking: Booking,
  studioSettings: StudioSettings
): string => {
  const phone = formatPhoneNumber(booking.customerPhone);
  const formattedDate = new Date(booking.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const message = `Halo Kak *${booking.customerName}*! 👋

Pengingat ramah dari *${studioSettings.studioName}* bahwa jadwal sesi foto Anda akan berlangsung besok:

📅 *WAKTU SESI:*
• Hari/Tgl: ${formattedDate}
• Jam: *${booking.timeSlot}*
• Layanan: ${booking.packageName}
• Kode: #${booking.id}

📍 *LOKASI STUDIO:*
${studioSettings.address}
Maps: https://maps.google.com/?q=${encodeURIComponent(studioSettings.studioName + ' ' + studioSettings.address)}

💡 *TIPS PERSIAPAN:*
- Tiba 15 menit lebih awal agar tidak memotong durasi pemotretan.
- Pastikan outfit disetrika rapi & makeup dasar sudah siap bila tidak ambil opsi MUA.
- Bawa referensi gaya/pose favorit jika ada.

Sampai jumpa besok di studio! ✨
_Tim ${studioSettings.studioName}_`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const generatePaymentReminderWhatsAppUrl = (
  booking: Booking,
  studioSettings: StudioSettings
): string => {
  const phone = formatPhoneNumber(booking.customerPhone);
  const sisaBayar = booking.totalPrice - booking.dpAmount;
  const formattedSisa = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(sisaBayar);

  const message = `Halo Kak *${booking.customerName}*, salam hangat dari *${studioSettings.studioName}*. 

Pengingat untuk sisa pelunasan sesi foto #${booking.id} (${booking.packageName}) sebesar *${formattedSisa}*.

💳 *REKENING PEMBAYARAN:*
• Bank: ${studioSettings.bankName}
• No. Rekening: *${studioSettings.bankAccountNumber}*
• Atas Nama: ${studioSettings.bankAccountHolder}

Bisa juga dilunasi langsung di kasir studio via QRIS/Transfer saat sesi foto. Terima kasih banyak Kak! 🙏✨`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const generateReviewRequestWhatsAppUrl = (
  booking: Booking,
  studioSettings: StudioSettings
): string => {
  const phone = formatPhoneNumber(booking.customerPhone);
  const message = `Halo Kak *${booking.customerName}*! ✨

Terima kasih banyak telah mempercayai *${studioSettings.studioName}* untuk mengabadikan momen berharga Anda. 

Bagaimana kesan dan pengalaman Kakak selama sesi foto bersama tim kami? Ulasan dan masukan dari Kakak sangat berarti untuk kami terus berkembang.

Jika berkenan, boleh bantu beri rating & review bintang 5 di Google Maps kami ya Kak:
⭐ https://maps.google.com/?q=${encodeURIComponent(studioSettings.studioName)}

Sampai jumpa di momen-momen spesial berikutnya! 📸🖤
_Tim ${studioSettings.studioName}_`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const generateCustomQuotationWhatsAppUrl = (
  clientName: string,
  clientPhone: string,
  packageName: string,
  breakdown: string[],
  totalPrice: number,
  studioSettings: StudioSettings
): string => {
  const phone = formatPhoneNumber(clientPhone);
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalPrice);

  const message = `Halo Kak *${clientName}*, salam hangat dari *${studioSettings.studioName}*! ✨

Berikut adalah *Rincian Penawaran Resmi (Custom Quotation)* untuk kebutuhan pemotretan studio Anda:

📋 *PAKET & SPESIFIKASI:*
• *Konsep Layanan:* ${packageName}
${breakdown.map((item) => `• ${item}`).join('\n')}

💰 *TOTAL BIAYA ESTIMASI:* *${formattedTotal}*
(DP Booking 50% untuk penguncian slot jadwal & studio run-sheet).

📅 Jadwal reservasi dapat disesuaikan dengan ketersediaan live seat bioskop kami.
Apakah konsep ini sudah sesuai dengan ekspektasi Kakak? Silakan kabari kami jika ingin penyesuaian ya! 🙏✨

Salam kreatif,
_${studioSettings.adminName || 'Admin'} - ${studioSettings.studioName}_`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// --- Web Audio API Sound Effects ---

class SoundManager {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Camera shutter click + film advance mechanical sound
  playShutterSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Click 1 (Mirror flip)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(600, t);
      osc1.frequency.exponentialRampToValueAtTime(100, t + 0.04);
      gain1.gain.setValueAtTime(0.35, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.05);

      // Click 2 (Shutter curtain snap)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(900, t + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(150, t + 0.12);
      gain2.gain.setValueAtTime(0.4, t + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.06);
      osc2.stop(t + 0.13);
    } catch {
      // Audio autoplay policies or unsupported browser
    }
  }

  // Crisp cinema seat select tick
  playSeatClickSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.03);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Ignore audio error
    }
  }

  // Notification alert chime (for new booking)
  playNotificationChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Note 1 (E5 - 659 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, t);
      gain1.gain.setValueAtTime(0.2, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.26);

      // Note 2 (B5 - 987 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, t + 0.12);
      gain2.gain.setValueAtTime(0.25, t + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.12);
      osc2.stop(t + 0.46);
    } catch {
      // Ignore audio error
    }
  }

  // Subtle error tone
  playErrorSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.15);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch {
      // Ignore audio error
    }
  }
}

export const sounds = new SoundManager();

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#e4e4e7', '#d97706'],
    });
  } catch {
    // Canvas confetti fallback
  }
};
