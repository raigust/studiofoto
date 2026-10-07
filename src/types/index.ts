export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type PaymentStatus = 'UNPAID' | 'DP_PAID' | 'PAID_FULL' | 'REFUNDED';

export type ServiceCategory = 'wisuda' | 'produk' | 'pernikahan' | 'event' | 'portrait';

export interface ServicePackage {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  maxPeople: number;
  description: string;
  includes: string[];
  recommendedFor: string;
  image: string;
}

export type SlotPeriod = 'pagi' | 'siang' | 'sore' | 'malam';

export interface TimeSlot {
  id: string;
  time: string; // e.g. "10:00"
  endTime: string; // e.g. "11:30"
  label: string; // e.g. "10:00 - 11:30 WIB"
  period: SlotPeriod;
  status: 'available' | 'booked' | 'pending' | 'blocked';
  bookingId?: string;
  customerName?: string;
  packageName?: string;
  blockReason?: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  isClosed: boolean; // Admin deactivated whole day
  closeReason?: string;
  maxCapacity: number; // e.g. 1 if admin only wants 1 customer today!
  customNotes?: string;
  manuallyLockedSlots?: string[]; // array of slot times e.g. ["10:00"]
}

export interface StudioTask {
  id: string;
  title: string;
  category: 'editing' | 'gear' | 'delivery' | 'client';
  deadline: string;
  isCompleted: boolean;
  assignedTo?: string;
  bookingId?: string;
}

export interface BookingAddon {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface Booking {
  id: string; // e.g. "DFS-202610-001"
  customerName: string;
  customerPhone: string; // WhatsApp e.g. "081234567890" or "6281234567890"
  customerEmail?: string;
  category: ServiceCategory;
  packageId: string;
  packageName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 - 11:30 WIB"
  timeSlotId: string;
  numberOfPeople: number;
  notes?: string;
  totalPrice: number;
  dpAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  deliveryStatus?: 'PENDING_SHOOT' | 'RAW_SENT' | 'EDITING' | 'READY_DELIVERY' | 'COMPLETED';
  googleDriveUrl?: string;
  addons?: { name: string; price: number; qty: number }[];
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  whatsappNotified: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: ServiceCategory;
  clientName?: string;
  imageUrl: string;
  description: string;
  tags: string[];
  gearInfo?: {
    camera?: string;
    lens?: string;
    lighting?: string;
  };
  date: string;
  featured?: boolean;
}

export interface AdminNotification {
  id: string;
  type: 'NEW_BOOKING' | 'STATUS_CHANGE' | 'SCHEDULE_UPDATE';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  bookingId?: string;
}

export interface StudioSettings {
  studioName: string;
  tagline: string;
  whatsappNumber: string;
  email: string;
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  defaultMaxDailyCapacity: number;
  autoCloseWhenQuotaReached: boolean;
  adminName?: string;
  adminRole?: string;
}

export type GearCategory = 'camera' | 'lens' | 'lighting' | 'modifier' | 'backdrop' | 'props';
export type GearStatus = 'ready' | 'in_use' | 'maintenance' | 'charging';

export interface StudioGear {
  id: string;
  name: string;
  category: GearCategory;
  serialNumber?: string;
  status: GearStatus;
  batteryLevel?: number; // 0-100%
  location: string;
  currentSession?: string;
  notes?: string;
}

export type ExpenseCategory = 'freelance' | 'equipment' | 'operational' | 'printing' | 'marketing';

export interface StudioExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidBy: string;
  notes?: string;
}

export interface AdminProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio?: string;
  password?: string;
  sessionTimeoutMinutes: number;
  lastLoginAt?: string;
  twoFactorEnabled?: boolean;
}

export interface AdminSession {
  token: string;
  loginTime: number;
  expiresAt: number;
  adminName: string;
  adminEmail: string;
}
