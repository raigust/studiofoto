import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  Phone,
  ExternalLink,
  FileSpreadsheet,
  LogOut,
  Search,
  MessageCircle,
  Eye,
  Camera,
  Play,
  ArrowLeft,
  Sparkles,
  ArrowUpRight,
  Sun,
  Moon,
  CheckSquare,
  Square,
  FolderOpen,
  DollarSign,
  TrendingUp,
  Sliders,
  Send,
  UserCheck,
  Package,
  HardDrive,
  Share2,
  Wrench,
  BatteryCharging,
  Battery,
  Calculator,
  Copy,
  Check,
  Filter,
  Receipt,
  RefreshCw,
  Upload,
  AlertTriangle,
  Zap,
  Menu,
  X,
  Key,
  EyeOff,
  User,
  ShieldCheck,
  Image as ImageIcon,
  Link as LinkIcon,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { DiaferaLogo } from './DiaferaLogo';
import { motion, AnimatePresence } from 'motion/react';
import {
  Booking,
  DaySchedule,
  PortfolioItem,
  ServiceCategory,
  StudioSettings,
  TimeSlot,
  StudioTask,
  StudioGear,
  StudioExpense,
  AdminProfile,
  AdminSession,
} from '../types';
import {
  generateApprovalWhatsAppUrl,
  generateRejectionWhatsAppUrl,
  generateDriveDeliveryWhatsAppUrl,
  generateReminderHMin1WhatsAppUrl,
  generatePaymentReminderWhatsAppUrl,
  generateReviewRequestWhatsAppUrl,
  generateCustomQuotationWhatsAppUrl,
  getComputedSlotsForDate,
  getStoredTasks,
  saveStoredTasks,
  getStoredGear,
  saveStoredGear,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredAdminTheme,
  saveStoredAdminTheme,
  getStoredAdminProfile,
  saveStoredAdminProfile,
  getStoredAdminPassword,
  saveStoredAdminPassword,
  validateAdminPassword,
  verifyAdminSession,
  getAdminSession,
  refreshAdminSession,
  saveStoredSettings,
  DEFAULT_ADMIN_PROFILE,
  sounds,
  triggerConfetti,
  getTodayDateString,
  formatReadableDate,
} from '../utils/storage';
import {
  HERO_STUDIO_IMAGE,
  WISUDA_PORTFOLIO_IMAGE,
  PERNIKAHAN_PORTFOLIO_IMAGE,
  PRODUK_PORTFOLIO_IMAGE,
  EVENT_PORTFOLIO_IMAGE,
  SERVICE_PACKAGES,
  STUDIO_ADDONS,
  DEFAULT_HERO_CARDS,
} from '../data/mockData';

interface AdminBentoDashboardProps {
  bookings: Booking[];
  daySchedules: Record<string, DaySchedule>;
  portfolioItems: PortfolioItem[];
  studioSettings: StudioSettings;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason: string) => void;
  onUpdatePaymentStatus: (bookingId: string, newStatus: Booking['paymentStatus']) => void;
  onUpdateDaySchedule: (date: string, updates: Partial<DaySchedule>) => void;
  onAddPortfolio: (item: Omit<PortfolioItem, 'id'>) => void;
  onUpdatePortfolio: (id: string, updates: Partial<PortfolioItem>) => void;
  onDeletePortfolio: (id: string) => void;
  onUpdateSettings: (settings: StudioSettings) => void;
  onLogout: () => void;
  onBackToCustomerSite: () => void;
  onTriggerSimulatedBooking: () => void;
  onAddManualBooking?: (booking: Booking) => void;
  onUpdateBookingDelivery?: (bookingId: string, deliveryStatus?: Booking['deliveryStatus'], googleDriveUrl?: string) => void;
}

export const AdminBentoDashboard: React.FC<AdminBentoDashboardProps> = ({
  bookings,
  daySchedules,
  portfolioItems,
  studioSettings,
  onApproveBooking,
  onRejectBooking,
  onUpdatePaymentStatus,
  onUpdateDaySchedule,
  onAddPortfolio,
  onUpdatePortfolio,
  onDeletePortfolio,
  onUpdateSettings,
  onLogout,
  onBackToCustomerSite,
  onTriggerSimulatedBooking,
  onAddManualBooking,
  onUpdateBookingDelivery,
}) => {
  // Navigation inside Admin
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'calendar' | 'inventory' | 'delivery' | 'quote_calc' | 'tasks' | 'clients' | 'transactions' | 'portfolio' | 'profile' | 'settings'
  >('dashboard');

  // Theme inside Admin (Light vs Dark mode - matching the reference picture's Light/Dark switch!)
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(getStoredAdminTheme);

  const toggleTheme = (mode: 'light' | 'dark') => {
    sounds.playSeatClickSound();
    setAdminTheme(mode);
    saveStoredAdminTheme(mode);
  };

  // Security Middleware Verification Guard
  const isSessionValid = verifyAdminSession();

  // Watchdog timer inside Admin component (auto logout if session invalid)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!verifyAdminSession()) {
        onLogout();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [onLogout]);

  // Admin Profile & Security State
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(getStoredAdminProfile);
  const [profileForm, setProfileForm] = useState<AdminProfile>(getStoredAdminProfile);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileSuccessToast, setProfileSuccessToast] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [activeSession, setActiveSession] = useState<AdminSession | null>(getAdminSession);

  // Studio Tasks (Daily To-Do List - Gated: loaded only if authenticated)
  const [tasks, setTasks] = useState<StudioTask[]>(() => verifyAdminSession() ? getStoredTasks() : []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<StudioTask['category']>('editing');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  const toggleTask = (taskId: string) => {
    sounds.playSeatClickSound();
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    sounds.playSeatClickSound();
    const task: StudioTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      deadline: 'Hari ini',
      isCompleted: false,
      assignedTo: studioSettings.adminName || 'Admin',
    };
    setTasks([task, ...tasks]);
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Schedule management date selector (defaults to current calendar date)
  const [scheduleDate, setScheduleDate] = useState<string>(() => getTodayDateString(0));

  // Manual / Walk-in Booking Modal State
  const [manualBookingModalOpen, setManualBookingModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    packageId: SERVICE_PACKAGES[0].id,
    date: getTodayDateString(0),
    timeSlot: '09:00 - 10:30 WIB',
    timeSlotId: '09:00',
    numberOfPeople: 2,
    notes: 'Walk-in / Booking Manual via Admin',
    selectedAddons: [] as string[],
    isPaidFull: false,
  });

  // Rejection modal
  const [rejectModalBooking, setRejectModalBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Jadwal bentrok dengan agenda internal studio.');

  // Receipt modal
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  // Portfolio modal
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioFormData, setPortfolioFormData] = useState({
    title: '',
    category: 'wisuda' as ServiceCategory,
    clientName: '',
    imageUrl: HERO_STUDIO_IMAGE,
    description: '',
    tags: 'Studio, Editorial',
    camera: 'Sony A7R V',
    lens: 'FE 50mm f/1.2 GM',
    lighting: 'Profoto D2 + 120cm Octabox with Grid',
  });

  // Quick Photo Link Change State (Direct Instagram / Web URL edit)
  const [quickPhotoItem, setQuickPhotoItem] = useState<PortfolioItem | null>(null);
  const [quickPhotoUrl, setQuickPhotoUrl] = useState('');
  const [quickPhotoSuccess, setQuickPhotoSuccess] = useState(false);

  const handleSaveQuickPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhotoItem || !quickPhotoUrl.trim()) return;
    sounds.playShutterSound();
    onUpdatePortfolio(quickPhotoItem.id, { imageUrl: quickPhotoUrl.trim() });
    setQuickPhotoSuccess(true);
    setTimeout(() => {
      setQuickPhotoSuccess(false);
      setQuickPhotoItem(null);
    }, 1200);
  };

  // Settings form
  const [settingsForm, setSettingsForm] = useState<StudioSettings>({ ...studioSettings });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  useEffect(() => {
    setSettingsForm({ ...studioSettings });
  }, [studioSettings]);

  // --- ADMIN PROFILE & CREDENTIALS HANDLERS ---
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    // If changing password
    if (newPasswordInput.trim()) {
      if (newPasswordInput.trim().length < 4) {
        setProfileError('Password baru minimal harus 4 karakter.');
        sounds.playErrorSound?.();
        return;
      }
      if (newPasswordInput.trim() !== confirmPasswordInput.trim()) {
        setProfileError('Konfirmasi password tidak cocok dengan password baru.');
        sounds.playErrorSound?.();
        return;
      }
      if (currentPasswordInput && !validateAdminPassword(currentPasswordInput.trim())) {
        setProfileError('Password saat ini salah! Verifikasi gagal.');
        sounds.playErrorSound?.();
        return;
      }
      saveStoredAdminPassword(newPasswordInput.trim());
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setCurrentPasswordInput('');
    }

    const updatedProfile: AdminProfile = {
      ...profileForm,
      name: profileForm.name.trim() || 'Raihan Gusti',
      role: profileForm.role.trim() || 'Lead Photographer & Studio Director',
      email: profileForm.email.trim() || 'raihangusti066@gmail.com',
      phone: profileForm.phone.trim() || '6281289004512',
      avatarUrl: profileForm.avatarUrl.trim() || HERO_STUDIO_IMAGE,
      bio: profileForm.bio?.trim() || '',
      sessionTimeoutMinutes: Number(profileForm.sessionTimeoutMinutes) || 30,
    };

    saveStoredAdminProfile(updatedProfile);
    setAdminProfile(updatedProfile);
    setProfileForm(updatedProfile);

    // Synchronize studio settings
    onUpdateSettings({
      ...studioSettings,
      adminName: updatedProfile.name,
      adminRole: updatedProfile.role,
    });

    sounds.playShutterSound();
    triggerConfetti();
    setProfileSuccessToast(true);
    setTimeout(() => setProfileSuccessToast(false), 4000);
  };

  const handleResetDefaultProfile = () => {
    if (confirm('Kembalikan data profil admin ke pengaturan bawaan?')) {
      sounds.playSeatClickSound();
      saveStoredAdminProfile(DEFAULT_ADMIN_PROFILE);
      saveStoredAdminPassword('admin123');
      setAdminProfile(DEFAULT_ADMIN_PROFILE);
      setProfileForm(DEFAULT_ADMIN_PROFILE);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setProfileError('');
      onUpdateSettings({
        ...studioSettings,
        adminName: DEFAULT_ADMIN_PROFILE.name,
        adminRole: DEFAULT_ADMIN_PROFILE.role,
      });
      setProfileSuccessToast(true);
      setTimeout(() => setProfileSuccessToast(false), 3000);
    }
  };

  // --- STUDIO GEAR & INVENTORY STATE (Gated) ---
  const [gearList, setGearList] = useState<StudioGear[]>(() => verifyAdminSession() ? getStoredGear() : []);
  const [selectedGearCat, setSelectedGearCat] = useState<string>('all');
  const [showAddGearModal, setShowAddGearModal] = useState(false);
  const [newGearForm, setNewGearForm] = useState({
    name: '',
    category: 'camera' as StudioGear['category'],
    serialNumber: '',
    status: 'ready' as StudioGear['status'],
    batteryLevel: 95,
    location: 'Dry Cabinet Utama A1',
    notes: '',
  });

  useEffect(() => {
    saveStoredGear(gearList);
  }, [gearList]);

  const handleToggleGearStatus = (gearId: string, nextStatus: StudioGear['status']) => {
    sounds.playSeatClickSound();
    setGearList((prev) =>
      prev.map((g) => (g.id === gearId ? { ...g, status: nextStatus } : g))
    );
  };

  const handleDeleteGear = (gearId: string) => {
    if (confirm('Hapus peralatan ini dari daftar inventaris?')) {
      sounds.playSeatClickSound();
      setGearList((prev) => prev.filter((g) => g.id !== gearId));
    }
  };

  const handleAddNewGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearForm.name.trim()) return;
    sounds.playShutterSound();
    const item: StudioGear = {
      id: `gear-${Date.now()}`,
      name: newGearForm.name.trim(),
      category: newGearForm.category,
      serialNumber: newGearForm.serialNumber.trim() || undefined,
      status: newGearForm.status,
      batteryLevel: newGearForm.category === 'camera' || newGearForm.category === 'lighting' ? Number(newGearForm.batteryLevel) : undefined,
      location: newGearForm.location.trim() || 'Studio Room 1',
      notes: newGearForm.notes.trim() || undefined,
    };
    setGearList([item, ...gearList]);
    setShowAddGearModal(false);
    setNewGearForm({
      name: '',
      category: 'camera',
      serialNumber: '',
      status: 'ready',
      batteryLevel: 95,
      location: 'Dry Cabinet Utama A1',
      notes: '',
    });
  };

  // --- STUDIO EXPENSES & CASHFLOW STATE (Gated) ---
  const [expenses, setExpenses] = useState<StudioExpense[]>(() => verifyAdminSession() ? getStoredExpenses() : []);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpenseForm, setNewExpenseForm] = useState({
    title: '',
    category: 'freelance' as StudioExpense['category'],
    amount: 250000,
    date: new Date().toISOString().split('T')[0],
    paidBy: studioSettings.adminName || 'Studio Kas',
    notes: '',
  });

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  const handleAddNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseForm.title.trim() || newExpenseForm.amount <= 0) return;
    sounds.playSeatClickSound();
    const item: StudioExpense = {
      id: `exp-${Date.now()}`,
      title: newExpenseForm.title.trim(),
      category: newExpenseForm.category,
      amount: Number(newExpenseForm.amount),
      date: newExpenseForm.date,
      paidBy: newExpenseForm.paidBy.trim() || 'Studio Kas',
      notes: newExpenseForm.notes.trim() || undefined,
    };
    setExpenses([item, ...expenses]);
    setShowAddExpenseModal(false);
    setNewExpenseForm({
      title: '',
      category: 'freelance',
      amount: 250000,
      date: new Date().toISOString().split('T')[0],
      paidBy: studioSettings.adminName || 'Studio Kas',
      notes: '',
    });
  };

  const handleDeleteExpense = (expId: string) => {
    if (confirm('Hapus pencatatan pengeluaran ini?')) {
      sounds.playSeatClickSound();
      setExpenses((prev) => prev.filter((e) => e.id !== expId));
    }
  };

  // --- DELIVERY & GOOGLE DRIVE MANAGEMENT STATE ---
  const [deliveryFilter, setDeliveryFilter] = useState<string>('ALL');
  const [driveInputMap, setDriveInputMap] = useState<Record<string, string>>({});
  const [deliverySavedToast, setDeliverySavedToast] = useState<string | null>(null);

  const handleUpdateDeliveryStatus = (bookingId: string, status: Booking['deliveryStatus'], driveUrl?: string) => {
    sounds.playSeatClickSound();
    if (onUpdateBookingDelivery) {
      onUpdateBookingDelivery(bookingId, status, driveUrl);
    }
    setDeliverySavedToast(`Status delivery #${bookingId} diperbarui!`);
    setTimeout(() => setDeliverySavedToast(null), 3000);
  };

  // --- CUSTOM QUOTE CALCULATOR & WA BROADCAST STATE ---
  const [calcClientName, setCalcClientName] = useState('');
  const [calcClientPhone, setCalcClientPhone] = useState('');
  const [calcPackageId, setCalcPackageId] = useState(SERVICE_PACKAGES[0].id);
  const [calcExtraHours, setCalcExtraHours] = useState(0);
  const [calcExtraPeople, setCalcExtraPeople] = useState(0);
  const [calcSelectedAddons, setCalcSelectedAddons] = useState<string[]>([]);
  const [copiedQuoteToast, setCopiedQuoteToast] = useState(false);

  // Broadcast Template Modal
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTargetBooking, setBroadcastTargetBooking] = useState<Booking | null>(null);
  const [broadcastType, setBroadcastType] = useState<'H1' | 'PAYMENT' | 'REVIEW'>('H1');

  // Transactions search & filter
  const [trxSearch, setTrxSearch] = useState('');
  const [trxStatusFilter, setTrxStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [trxTab, setTrxTab] = useState<'bookings' | 'expenses'>('bookings');

  // Computed metrics
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'PENDING'), [bookings]);
  const approvedBookings = useMemo(() => bookings.filter((b) => b.status === 'APPROVED'), [bookings]);
  const totalRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'APPROVED' || b.status === 'COMPLETED')
      .reduce((acc, curr) => acc + (curr.paymentStatus === 'PAID_FULL' ? curr.totalPrice : curr.dpAmount), 0);
  }, [bookings]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const netProfit = useMemo(() => {
    return totalRevenue - totalExpenses;
  }, [totalRevenue, totalExpenses]);

  const { slots: adminSlots, dayInfo: activeDayInfo, activeApprovedCount } = useMemo(() => {
    return getComputedSlotsForDate(scheduleDate, bookings, daySchedules);
  }, [scheduleDate, bookings, daySchedules]);

  const todaysSessions = useMemo(() => {
    return bookings
      .filter((b) => b.date === scheduleDate && (b.status === 'APPROVED' || b.status === 'PENDING'))
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [bookings, scheduleDate]);

  // Client Directory (CRM) aggregation
  const clientDirectory = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; email?: string; bookingsCount: number; totalSpent: number; lastDate: string }>();
    bookings.forEach((b) => {
      const key = b.customerPhone;
      const existing = map.get(key);
      if (existing) {
        existing.bookingsCount += 1;
        existing.totalSpent += b.totalPrice;
        if (b.date > existing.lastDate) existing.lastDate = b.date;
      } else {
        map.set(key, {
          name: b.customerName,
          phone: b.customerPhone,
          email: b.customerEmail,
          bookingsCount: 1,
          totalSpent: b.totalPrice,
          lastDate: b.date,
        });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  // Handlers
  const handleApprove = (booking: Booking) => {
    sounds.playShutterSound();
    onApproveBooking(booking.id);
    triggerConfetti();

    const waUrl = generateApprovalWhatsAppUrl(booking, studioSettings);
    window.open(waUrl, '_blank');
  };

  const handleOpenReject = (booking: Booking) => {
    setRejectModalBooking(booking);
    setRejectionReason('Slot jadwal bertabrakan / kuota studio pada tanggal tersebut sudah maksimal.');
  };

  const handleConfirmReject = () => {
    if (!rejectModalBooking) return;
    onRejectBooking(rejectModalBooking.id, rejectionReason);
    const waUrl = generateRejectionWhatsAppUrl(rejectModalBooking, studioSettings, rejectionReason);
    setRejectModalBooking(null);
    window.open(waUrl, '_blank');
  };

  const handleToggleDayLock = () => {
    const isCurrentlyClosed = activeDayInfo.isClosed;
    onUpdateDaySchedule(scheduleDate, {
      isClosed: !isCurrentlyClosed,
      closeReason: !isCurrentlyClosed ? 'Studio dinonaktifkan oleh Admin' : undefined,
    });
  };

  const handleToggleSingleCustomerMode = () => {
    const isSingle = activeDayInfo.maxCapacity === 1;
    onUpdateDaySchedule(scheduleDate, {
      maxCapacity: isSingle ? 5 : 1,
      customNotes: !isSingle ? 'Mode Single Customer Prioritas Aktif' : undefined,
    });
  };

  const handleToggleSlotLock = (slotTime: string) => {
    const lockedList = activeDayInfo.manuallyLockedSlots || [];
    const isLocked = lockedList.includes(slotTime);
    const updated = isLocked
      ? lockedList.filter((t) => t !== slotTime)
      : [...lockedList, slotTime];

    onUpdateDaySchedule(scheduleDate, {
      manuallyLockedSlots: updated,
    });
  };

  // Submit Manual Walk-in Booking
  const handleSaveManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.customerName.trim() || !manualForm.customerPhone.trim()) return;

    sounds.playShutterSound();
    const pkg = SERVICE_PACKAGES.find((p) => p.id === manualForm.packageId) || SERVICE_PACKAGES[0];
    
    // Addon price calculation
    const selectedAddonObjects = STUDIO_ADDONS.filter((a) => manualForm.selectedAddons.includes(a.id));
    const addonsTotal = selectedAddonObjects.reduce((acc, a) => acc + a.price, 0);
    const totalPrice = pkg.price + addonsTotal;
    const dpAmount = manualForm.isPaidFull ? totalPrice : Math.round(totalPrice * 0.5);

    const newBooking: Booking = {
      id: `DFS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 899) + 100)}`,
      customerName: manualForm.customerName.trim(),
      customerPhone: manualForm.customerPhone.trim(),
      category: pkg.category,
      packageId: pkg.id,
      packageName: pkg.name,
      date: manualForm.date,
      timeSlot: manualForm.timeSlot,
      timeSlotId: manualForm.timeSlotId,
      numberOfPeople: manualForm.numberOfPeople,
      notes: manualForm.notes,
      totalPrice,
      dpAmount,
      paymentStatus: manualForm.isPaidFull ? 'PAID_FULL' : 'DP_PAID',
      status: 'APPROVED', // Direct approved by admin
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      whatsappNotified: false,
    };

    // Trigger local state update in bookings
    onApproveBooking(newBooking.id);
    setManualBookingModalOpen(false);
    triggerConfetti();

    // Open WhatsApp confirmation for the client
    const waUrl = generateApprovalWhatsAppUrl(newBooking, studioSettings);
    window.open(waUrl, '_blank');
  };

  const handleExportCSV = () => {
    sounds.playSeatClickSound();
    const headers = ['ID Booking', 'Nama Pelanggan', 'WhatsApp', 'Layanan', 'Tanggal Sesi', 'Jam', 'Status Booking', 'Status Bayar', 'Total (IDR)'];
    const rows = bookings.map((b) => [
      b.id,
      `"${b.customerName}"`,
      b.customerPhone,
      `"${b.packageName}"`,
      b.date,
      `"${b.timeSlot}"`,
      b.status,
      b.paymentStatus,
      b.totalPrice,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Diaferastudio_Laporan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioFormData.title.trim()) return;

    sounds.playShutterSound();
    const tagsArray = portfolioFormData.tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingPortfolioId) {
      onUpdatePortfolio(editingPortfolioId, {
        title: portfolioFormData.title,
        category: portfolioFormData.category,
        clientName: portfolioFormData.clientName,
        imageUrl: portfolioFormData.imageUrl,
        description: portfolioFormData.description,
        tags: tagsArray,
        gearInfo: {
          camera: portfolioFormData.camera,
          lens: portfolioFormData.lens,
          lighting: portfolioFormData.lighting,
        },
      });
    } else {
      onAddPortfolio({
        title: portfolioFormData.title,
        category: portfolioFormData.category,
        clientName: portfolioFormData.clientName,
        imageUrl: portfolioFormData.imageUrl,
        description: portfolioFormData.description,
        tags: tagsArray,
        date: new Date().toISOString().slice(0, 10),
        gearInfo: {
          camera: portfolioFormData.camera,
          lens: portfolioFormData.lens,
          lighting: portfolioFormData.lighting,
        },
      });
    }

    setPortfolioModalOpen(false);
    setEditingPortfolioId(null);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        !trxSearch ||
        b.id.toLowerCase().includes(trxSearch.toLowerCase()) ||
        b.customerName.toLowerCase().includes(trxSearch.toLowerCase()) ||
        b.customerPhone.includes(trxSearch) ||
        b.packageName.toLowerCase().includes(trxSearch.toLowerCase());

      const matchStatus = trxStatusFilter === 'ALL' || b.status === trxStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, trxSearch, trxStatusFilter]);

  // --- PAGINATION STATES & DERIVED DATA ---
  const [trxPage, setTrxPage] = useState(1);
  const trxPerPage = 8;
  const totalTrxPages = Math.ceil(filteredBookings.length / trxPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice((trxPage - 1) * trxPerPage, trxPage * trxPerPage);
  }, [filteredBookings, trxPage, trxPerPage]);

  const [expensePage, setExpensePage] = useState(1);
  const expensePerPage = 6;
  const totalExpensePages = Math.ceil(expenses.length / expensePerPage) || 1;
  const paginatedExpenses = useMemo(() => {
    return expenses.slice((expensePage - 1) * expensePerPage, expensePage * expensePerPage);
  }, [expenses, expensePage, expensePerPage]);

  const [clientPage, setClientPage] = useState(1);
  const clientPerPage = 7;
  const totalClientPages = Math.ceil(clientDirectory.length / clientPerPage) || 1;
  const paginatedClients = useMemo(() => {
    return clientDirectory.slice((clientPage - 1) * clientPerPage, clientPage * clientPerPage);
  }, [clientDirectory, clientPage, clientPerPage]);

  const [deliveryPage, setDeliveryPage] = useState(1);
  const deliveryPerPage = 4;
  const deliveryList = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'APPROVED' || b.status === 'COMPLETED')
      .filter((b) => deliveryFilter === 'ALL' || (b.deliveryStatus || 'PENDING_SHOOT') === deliveryFilter);
  }, [bookings, deliveryFilter]);
  const totalDeliveryPages = Math.ceil(deliveryList.length / deliveryPerPage) || 1;
  const paginatedDelivery = useMemo(() => {
    return deliveryList.slice((deliveryPage - 1) * deliveryPerPage, deliveryPage * deliveryPerPage);
  }, [deliveryList, deliveryPage, deliveryPerPage]);

  const [gearPage, setGearPage] = useState(1);
  const gearPerPage = 6;
  const filteredGearList = useMemo(() => {
    return gearList.filter((g) => selectedGearCat === 'all' || g.category === selectedGearCat);
  }, [gearList, selectedGearCat]);
  const totalGearPages = Math.ceil(filteredGearList.length / gearPerPage) || 1;
  const paginatedGear = useMemo(() => {
    return filteredGearList.slice((gearPage - 1) * gearPerPage, gearPage * gearPerPage);
  }, [filteredGearList, gearPage, gearPerPage]);

  const [portfolioPage, setPortfolioPage] = useState(1);
  const portfolioPerPage = 6;
  const totalPortfolioPages = Math.ceil(portfolioItems.length / portfolioPerPage) || 1;
  const paginatedPortfolio = useMemo(() => {
    return portfolioItems.slice((portfolioPage - 1) * portfolioPerPage, portfolioPage * portfolioPerPage);
  }, [portfolioItems, portfolioPage, portfolioPerPage]);

  const [pendingPage, setPendingPage] = useState(1);
  const pendingPerPage = 3;
  const totalPendingPages = Math.ceil(pendingBookings.length / pendingPerPage) || 1;
  const paginatedPendingBookings = useMemo(() => {
    return pendingBookings.slice((pendingPage - 1) * pendingPerPage, pendingPage * pendingPerPage);
  }, [pendingBookings, pendingPage, pendingPerPage]);

  const [taskPage, setTaskPage] = useState(1);
  const taskPerPage = 6;
  const totalTaskPages = Math.ceil(tasks.length / taskPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    return tasks.slice((taskPage - 1) * taskPerPage, taskPage * taskPerPage);
  }, [tasks, taskPage, taskPerPage]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Reset pages on filter changes
  useEffect(() => {
    setTrxPage(1);
  }, [trxSearch, trxStatusFilter]);

  useEffect(() => {
    setDeliveryPage(1);
  }, [deliveryFilter]);

  useEffect(() => {
    setGearPage(1);
  }, [selectedGearCat]);

  useEffect(() => {
    if (pendingPage > totalPendingPages) setPendingPage(Math.max(1, totalPendingPages));
  }, [pendingBookings.length, totalPendingPages, pendingPage]);

  useEffect(() => {
    if (taskPage > totalTaskPages) setTaskPage(Math.max(1, totalTaskPages));
  }, [tasks.length, totalTaskPages, taskPage]);

  // Theme styling helpers based on adminTheme ('light' vs 'dark')
  const isLight = adminTheme === 'light';
  const containerBg = isLight ? 'bg-[#f4f5f7] text-[#18181b]' : 'bg-[#09090b] text-[#f4f4f5]';
  const cardBg = isLight ? 'bg-white border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : 'bg-zinc-900/60 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]';
  const sidebarBg = isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-950/80 border-white/10';
  const textMuted = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const inputBg = isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-900' : 'bg-white/[0.04] border-white/10 text-white';

  // Helper Pagination Component
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number,
    onPageChange: (p: number) => void,
    label: string
  ) => {
    if (totalItems <= itemsPerPage && totalPages <= 1) return null;
    const startIdx = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-200/60 dark:border-white/10 text-xs">
        <div className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
          Menampilkan <span className="font-bold text-zinc-900 dark:text-white">{startIdx}–{endIdx}</span> dari{' '}
          <span className="font-bold text-zinc-900 dark:text-white">{totalItems}</span> {label}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playSeatClickSound();
              onPageChange(Math.max(1, currentPage - 1));
            }}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight
                ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
            }`}
          >
            &larr; Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (
                totalPages > 6 &&
                p !== 1 &&
                p !== totalPages &&
                Math.abs(p - currentPage) > 1
              ) {
                if (p === 2 || p === totalPages - 1) {
                  return (
                    <span key={p} className="px-1 text-zinc-400 text-xs font-mono">
                      &bull;
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    sounds.playSeatClickSound();
                    onPageChange(p);
                  }}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === p
                      ? 'bg-lime-300 text-zinc-950 shadow-sm font-extrabold'
                      : isLight
                      ? 'text-zinc-600 hover:bg-zinc-100'
                      : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playSeatClickSound();
              onPageChange(Math.min(totalPages, currentPage + 1));
            }}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight
                ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
            }`}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    );
  };

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Top Header & Admin Profile (Fixed at top) */}
      <div className="space-y-3 shrink-0 pb-3 border-b border-zinc-200/60 dark:border-white/10">
        {/* Logo / Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-lime-300 flex items-center justify-center text-black font-extrabold shadow-sm">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className={`font-serif text-lg font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Diafera
              </span>
              <span className="text-[10px] font-mono tracking-widest text-lime-600 dark:text-lime-400 font-bold ml-1">
                PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Back to customer site */}
            <button
              type="button"
              onClick={onBackToCustomerSite}
              title="Kembali ke Web Customer"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isLight ? 'border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {/* Mobile close drawer button */}
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isLight ? 'border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Admin Profile Card (Interactive: Opens Profile Editor) */}
        <div
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('profile');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`p-2.5 sm:p-3 rounded-2xl border flex items-center gap-3 ${cardBg} cursor-pointer hover:border-lime-400/50 transition-all group`}
          title="Klik untuk ubah profil, data & keamanan admin"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-lime-400/80 shrink-0 bg-zinc-800 relative">
            <img
              src={adminProfile.avatarUrl || HERO_STUDIO_IMAGE}
              alt="Admin Profile"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center justify-between">
              <p className={`text-xs font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {adminProfile.name || studioSettings.adminName || 'Raihan Gusti'}
              </p>
              <Edit2 className="w-3 h-3 text-lime-500 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
            <p className={`text-[10px] truncate ${textMuted}`}>
              {adminProfile.role || studioSettings.adminRole || 'Lead Photographer'}
            </p>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online &bull; Edit Profil
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Scrollable Nav Items (Scrolls internally if viewport is small, header and logout button stay 100% pinned!) */}
      <nav className="flex-1 overflow-y-auto min-h-0 space-y-1 text-xs font-medium py-2.5 pr-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('dashboard');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'dashboard'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4" />
            <span>Dashboard</span>
          </div>
          {pendingBookings.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-orange-500 text-white">
              {pendingBookings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('calendar');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'calendar'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4" />
            <span>Jadwal & Kuota Bioskop</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('inventory');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'inventory'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Wrench className="w-4 h-4" />
            <span>Inventaris Alat & Gear</span>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-white/10 text-zinc-400'}`}>
            {gearList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('delivery');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'delivery'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4" />
            <span>Delivery & Drive Link</span>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-sky-500 text-white">
            Drive
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('quote_calc');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'quote_calc'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Calculator className="w-4 h-4" />
            <span>Kalkulator & WA Broadcast</span>
          </div>
          <span className="text-[10px] font-mono text-lime-500 font-bold">Auto</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('tasks');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'tasks'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4" />
            <span>Studio To-Do List</span>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-white/10 text-zinc-400'}`}>
            {tasks.filter((t) => !t.isCompleted).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('clients');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'clients'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4" />
            <span>Direktori Klien (CRM)</span>
          </div>
          <span className={`text-[10px] font-mono ${textMuted}`}>{clientDirectory.length}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('transactions');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'transactions'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Laporan & Kas Studio</span>
          </div>
          <span className={`text-[10px] font-mono text-emerald-500 font-bold`}>
            Rp {(netProfit / 1000).toLocaleString('id-ID')}k
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('portfolio');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'portfolio'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-4 h-4" />
            <span>CRUD Portofolio</span>
          </div>
          <span className={`text-[10px] font-mono ${textMuted}`}>{portfolioItems.length}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('profile');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'profile'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4" />
            <span>Profil & Keamanan Admin</span>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-lime-400/20 text-lime-600 dark:text-lime-400 font-mono">
            Owner
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playSeatClickSound();
            setActiveNav('settings');
            if (isMobile) setMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'settings'
              ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm'
              : isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4" />
            <span>Pengaturan Studio</span>
          </div>
        </button>
      </nav>

      {/* Bottom Pinned Controls (ALWAYS VISIBLE & PINNED AT BOTTOM, ZERO SCROLLING NEEDED!) */}
      <div className="space-y-2 pt-2.5 shrink-0 border-t border-zinc-200/60 dark:border-white/10 mt-auto">
        <div className={`px-3 py-2 rounded-xl ${cardBg} flex items-center justify-between text-[11px]`}>
          <span className="font-semibold flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-lime-500" />
            <span>Drive Cloud Sync</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <button
          type="button"
          onClick={onLogout}
          className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isLight
              ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300'
              : 'border-rose-500/30 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/50'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Akun Admin</span>
        </button>
      </div>
    </>
  );

  if (!isSessionValid) {
    return (
      <div className={`h-screen w-full ${containerBg} flex items-center justify-center p-6 text-center font-sans`}>
        <div className={`max-w-md w-full p-8 rounded-3xl border ${cardBg} shadow-2xl space-y-5 border-rose-500/30`}>
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-rose-500 uppercase">
              SISTEM KEAMANAN DIAFERA PRO
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
              Akses Ditolak: Autentikasi Diperlukan
            </h2>
            <p className={`text-xs ${textMuted} mt-2 leading-relaxed`}>
              Data operasional, keuangan, klien, dan reservasi studio terkunci demi keamanan. Silakan login terlebih dahulu menggunakan kredensial pengelola resmi.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onLogout();
                window.location.hash = '#admin';
              }}
              className="w-full py-3 rounded-full bg-lime-300 hover:bg-lime-200 text-zinc-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Masuk Sebagai Admin
            </button>
            <button
              type="button"
              onClick={onBackToCustomerSite}
              className={`w-full py-2.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                isLight ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100' : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Kembali ke Web Customer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full ${containerBg} transition-colors duration-300 flex flex-col md:flex-row overflow-hidden font-sans`}>
      
      {/* MOBILE TOP BAR (For small screens: Hamburger + Brand + Quick Logout) */}
      <header className={`md:hidden px-4 py-3 border-b flex items-center justify-between shrink-0 z-30 ${sidebarBg}`}>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className={`p-2 rounded-xl border cursor-pointer ${
              isLight ? 'border-zinc-200 bg-zinc-100 text-zinc-800' : 'border-white/10 bg-white/5 text-white'
            }`}
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-lime-300 flex items-center justify-center text-black font-extrabold text-xs">
              <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <span className={`font-serif text-sm font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Diafera
              </span>
              <span className="text-[9px] font-mono tracking-widest text-lime-600 dark:text-lime-400 font-bold ml-1">
                PRO
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToCustomerSite}
            title="Kembali ke Web Customer"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLight ? 'border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            title="Keluar Akun Admin"
            className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside
            className={`relative w-72 max-w-[85vw] h-full flex flex-col justify-between p-4 z-10 shadow-2xl border-r border-zinc-200 dark:border-white/10 ${sidebarBg}`}
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* DESKTOP FIXED SIDEBAR (Permanently fixed height, left side, bottom logout always visible!) */}
      <aside className={`hidden md:flex h-full w-64 lg:w-72 border-r flex-col justify-between p-4 lg:p-5 shrink-0 overflow-hidden z-20 select-none ${sidebarBg}`}>
        {renderSidebarContent(false)}
      </aside>

      {/* 
        MAIN CONTENT WORKSPACE (Right Panel independently scrollable)
      */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-7 scrollbar-thin">
        
        {/* Top App Bar inside Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Service quick chips (UX/UI design, Illustration, Typography in the photo) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['Semua Layanan', 'Wisuda', 'Produk', 'Pernikahan', 'Event & Portrait'].map((chip, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  i === 0
                    ? isLight
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white text-zinc-900 font-semibold'
                    : isLight
                    ? 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                    : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white'
                }`}
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Controls: Search, Light/Dark Switch, Add Walk-in button */}
          <div className="flex items-center gap-3">
            {/* Search command input */}
            <div className="relative w-48 sm:w-64">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                placeholder="Cari atau ketik perintah..."
                value={trxSearch}
                onChange={(e) => setTrxSearch(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none transition-colors ${inputBg}`}
              />
            </div>

            {/* Light / Dark Mode Toggle Pill (Matching reference photo exactly!) */}
            <div className={`p-1 rounded-full border flex items-center gap-1 ${cardBg}`}>
              <button
                onClick={() => toggleTheme('light')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                  isLight ? 'bg-lime-300 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
              <button
                onClick={() => toggleTheme('dark')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                  !isLight ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
            </div>

            {/* Add Walk-in / Manual Booking Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setManualBookingModalOpen(true)}
              className="px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Tambah Booking Walk-in</span>
              <span className="sm:hidden">Booking</span>
            </motion.button>
          </div>
        </div>

        {/* ================= VIEW: MAIN DASHBOARD ================= */}
        {activeNav === 'dashboard' && (
          <div className="space-y-7">
            
            {/* Top Greeting Headline (Matching reference "Hi, Michael! What do you want to learn today?") */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Hi, {studioSettings.adminName?.split(' ')[0] || 'Raihan'}! 👋
                </h1>
                <p className={`text-sm ${textMuted} mt-1 font-light`}>
                  Apa yang ingin Anda kelola di Diaferastudio hari ini?
                </p>
              </div>

              {/* Quick simulated test button */}
              <button
                onClick={onTriggerSimulatedBooking}
                className="px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 self-start transition-colors bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                title="Simulasi masuk booking baru untuk mengetes notifikasi & approval"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Test Booking Masuk</span>
              </button>
            </div>

            {/* Service Categories Quick Showcase (4 cards from reference image) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: 'Foto Wisuda', cat: 'wisuda', img: WISUDA_PORTFOLIO_IMAGE, count: bookings.filter((b) => b.category === 'wisuda').length },
                { title: 'Foto Produk', cat: 'produk', img: PRODUK_PORTFOLIO_IMAGE, count: bookings.filter((b) => b.category === 'produk').length },
                { title: 'Pernikahan Noir', cat: 'pernikahan', img: PERNIKAHAN_PORTFOLIO_IMAGE, count: bookings.filter((b) => b.category === 'pernikahan').length },
                { title: 'Event & Portrait', cat: 'portrait', img: EVENT_PORTFOLIO_IMAGE, count: bookings.filter((b) => b.category === 'portrait' || b.category === 'event').length },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-3xl border flex items-center gap-3.5 transition-all ${cardBg}`}
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-black/10">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {item.title}
                    </p>
                    <p className={`text-[10px] ${textMuted} mt-0.5`}>
                      {item.count} Sesi Terjadwal
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Gauge Circles (40% Marketing, 60% Typography, 30% Colors in reference photo) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-5 rounded-3xl border ${cardBg} flex items-center justify-between`}>
                <div>
                  <span className="text-[10px] font-mono uppercase text-orange-500 font-bold">KAPASITAS HARI INI</span>
                  <p className={`text-xl font-extrabold mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    {todaysSessions.length} / {activeDayInfo.maxCapacity || 5} Slot
                  </p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>
                    {activeDayInfo.isClosed ? 'Studio Ditutup' : activeDayInfo.maxCapacity === 1 ? 'Mode 1 Customer Aktif' : 'Operasional Reguler'}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-lime-400 flex items-center justify-center font-bold text-sm">
                  {Math.round((todaysSessions.length / (activeDayInfo.maxCapacity || 5)) * 100)}%
                </div>
              </div>

              <div className={`p-5 rounded-3xl border ${cardBg} flex items-center justify-between`}>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-500 font-bold">ESTIMASI OMSET VALID</span>
                  <p className={`text-xl font-extrabold mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Rp {(totalRevenue / 1000).toLocaleString('id-ID')}k
                  </p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>
                    Dari {approvedBookings.length} booking terkonfirmasi
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-emerald-400 flex items-center justify-center font-bold text-sm">
                  85%
                </div>
              </div>

              <div className={`p-5 rounded-3xl border ${cardBg} flex items-center justify-between`}>
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-500 font-bold">DELIVERY GOOGLE DRIVE</span>
                  <p className={`text-xl font-extrabold mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    100% Ontime
                  </p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>
                    Seluruh file mentah terdistribusi
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-sky-400 flex items-center justify-center font-bold text-sm">
                  100%
                </div>
              </div>
            </div>

            {/* Split Content: Main To-Do & Assignments (Left) vs Mini Calendar & Notifications (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              
              {/* LEFT 7-COL: To Do List & Live Incoming Bookings */}
              <div className="lg:col-span-7 space-y-7">
                
                {/* To-Do List Box (Exact feature from reference photo "To do list") */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-base font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        Studio To-Do List & Checklist Harian
                      </h2>
                      <p className={`text-xs ${textMuted}`}>
                        Manajemen gear, color grading, dan jadwal delivery ke klien.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      className="px-3 py-1.5 rounded-full bg-lime-300 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Task</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          task.isCompleted
                            ? isLight ? 'bg-zinc-100/60 border-zinc-200 opacity-60' : 'bg-black/30 border-white/5 opacity-50'
                            : isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/[0.02] border-white/8'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="cursor-pointer text-lime-500 hover:scale-110 transition-transform"
                          >
                            {task.isCompleted ? (
                              <CheckSquare className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <p className={`text-xs font-semibold ${task.isCompleted ? 'line-through' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5">
                              <span className="uppercase text-orange-400">[{task.category}]</span>
                              <span>&bull;</span>
                              <span>Deadline: {task.deadline}</span>
                              {task.assignedTo && <span>&bull; PIC: {task.assignedTo}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-zinc-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Incoming Approvals Queue (WhatsApp Automation) */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-base font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        Antrean Approval Masuk ({pendingBookings.length})
                      </h2>
                      <p className={`text-xs ${textMuted}`}>
                        Setujui untuk otomatis mengunci slot kursi bioskop & kirim konfirmasi WhatsApp.
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">
                      Live Queue
                    </span>
                  </div>

                  {pendingBookings.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-white/10">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-medium">Semua antrean booking telah diproses!</p>
                      <p className={`text-[11px] ${textMuted} mt-0.5`}>
                        Klik tombol "+ Test Booking Masuk" di atas jika ingin menguji simulasi alur masuk.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paginatedPendingBookings.map((b) => (
                        <div
                          key={b.id}
                          className={`p-4 rounded-2xl border space-y-3 ${
                            isLight ? 'bg-zinc-50 border-orange-200' : 'bg-white/[0.03] border-orange-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-orange-500">#{b.id}</span>
                              <span className="font-bold text-xs">{b.customerName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {new Date(b.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-black/5 dark:bg-black/30 p-2.5 rounded-xl">
                            <div>
                              <span className="text-[10px] text-zinc-400 block">Layanan:</span>
                              <span className="font-medium">{b.packageName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-400 block">Jadwal Sesi:</span>
                              <span className="font-medium text-orange-500">{b.date} ({b.timeSlot})</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-400 block">DP Masuk:</span>
                              <span className="font-medium">Rp {b.dpAmount.toLocaleString('id-ID')}</span>
                            </div>
                          </div>

                          {b.notes && (
                            <p className="text-xs italic text-zinc-500 font-light">"{b.notes}"</p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-white/5">
                            <span className="text-xs font-mono text-zinc-500">{b.customerPhone}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenReject(b)}
                                className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-medium cursor-pointer"
                              >
                                Tolak
                              </button>
                              <button
                                onClick={() => handleApprove(b)}
                                className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui & Buka WA</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pagination for pending queue */}
                      {renderPagination(
                        pendingPage,
                        totalPendingPages,
                        pendingBookings.length,
                        pendingPerPage,
                        setPendingPage,
                        'antrean booking'
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT 5-COL: Mini Calendar & Today's Schedule Timeline (Matching reference layout right side) */}
              <div className="lg:col-span-5 space-y-7">
                
                {/* Mini Calendar Card with Days of Week */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-base font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        Jadwal Sesi Hari Ini
                      </h3>
                      <p className={`text-xs ${textMuted}`}>{formatReadableDate(scheduleDate)} ({scheduleDate})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleDayLock}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          activeDayInfo.isClosed ? 'bg-rose-500 text-white' : 'bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {activeDayInfo.isClosed ? 'Buka Hari' : 'Kunci Hari'}
                      </button>
                    </div>
                  </div>

                  {/* Sessions timeline */}
                  <div className="space-y-3 pt-2">
                    {todaysSessions.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl border border-zinc-200 dark:border-white/5">
                        <CalendarIcon className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
                        <p className="text-xs text-zinc-400">Belum ada sesi approved untuk tanggal ini.</p>
                      </div>
                    ) : (
                      todaysSessions.map((s) => (
                        <div
                          key={s.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/[0.02] border-white/5'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="font-bold text-xs">{s.timeSlot}</span>
                            </div>
                            <p className="text-xs font-medium mt-0.5">{s.customerName}</p>
                            <p className={`text-[10px] ${textMuted}`}>{s.packageName}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setReceiptBooking(s)}
                              className="p-1.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300"
                              title="Invoice"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`https://wa.me/${s.customerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full bg-emerald-500 text-black"
                              title="Chat WA"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Studio Health & Quick Controls */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <h3 className={`text-base font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Kontrol Cepat Studio
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-100 dark:bg-white/5">
                      <div>
                        <p className="font-semibold">Mode Eksklusif 1 Customer</p>
                        <p className={`text-[11px] ${textMuted}`}>Kunci sisa slot setelah 1 booking approved</p>
                      </div>
                      <button
                        onClick={handleToggleSingleCustomerMode}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          activeDayInfo.maxCapacity === 1 ? 'bg-orange-500 text-white' : 'bg-zinc-300 dark:bg-white/10'
                        }`}
                      >
                        {activeDayInfo.maxCapacity === 1 ? 'Aktif' : 'Off'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-100 dark:bg-white/5">
                      <div>
                        <p className="font-semibold">Ekspor Laporan Keuangan</p>
                        <p className={`text-[11px] ${textMuted}`}>Download spreadsheet CSV transaksi</p>
                      </div>
                      <button
                        onClick={handleExportCSV}
                        className="px-3 py-1 rounded-full bg-emerald-500 text-black font-bold text-xs"
                      >
                        CSV
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================= VIEW: JADWAL & KUOTA BIOSKOP ================= */}
        {activeNav === 'calendar' && (
          <div className={`p-6 rounded-3xl border ${cardBg} space-y-6`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">Kelola Jadwal & Kuota Bioskop Studio</h2>
                <p className={`text-xs ${textMuted}`}>Atur penonaktifan hari, mode 1 customer, atau kunci slot individu.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleDate(getTodayDateString(0))}
                  className="px-2.5 py-1 text-xs font-mono rounded-xl border border-orange-500/30 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleDate(getTodayDateString(1))}
                  className="px-2.5 py-1 text-xs font-mono rounded-xl border border-white/10 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Besok
                </button>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono focus:outline-none ${inputBg}`}
                />
              </div>
            </div>

            {/* Matrix slot editor */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {adminSlots.map((slot) => {
                const isManuallyLocked = activeDayInfo.manuallyLockedSlots?.includes(slot.time);
                const isBooked = slot.status === 'booked';
                const isPending = slot.status === 'pending';

                return (
                  <button
                    key={slot.id}
                    onClick={() => handleToggleSlotLock(slot.time)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isBooked
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                        : isPending
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                        : isManuallyLocked
                        ? 'bg-zinc-200 dark:bg-black border-zinc-300 dark:border-white/5 opacity-50 line-through'
                        : isLight
                        ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-sm">{slot.time}</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{slot.label}</p>
                    </div>

                    <div>
                      {isBooked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">Booked</span>
                      ) : isPending ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">Pending</span>
                      ) : isManuallyLocked ? (
                        <Lock className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW: INVENTARIS GEAR & ALAT STUDIO ================= */}
        {activeNav === 'inventory' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-white/10">
                <div>
                  <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Inventaris Gear & Peralatan Studio
                  </h2>
                  <p className={`text-xs ${textMuted}`}>
                    Manajemen kamera, lensa premium, lighting strobo, modifier, dan status ketersediaan live.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddGearModal(true)}
                  className="px-4 py-2 rounded-full bg-lime-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Peralatan Baru</span>
                </button>
              </div>

              {/* KPI Status Alat */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/[0.02] border-white/8'}`}>
                  <span className="text-[10px] font-mono uppercase text-zinc-400">TOTAL PERALATAN</span>
                  <p className="text-xl font-bold mt-1">{gearList.length} Item</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-emerald-500/10 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">READY / SIAP PAKAI</span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {gearList.filter((g) => g.status === 'ready').length} Item
                  </p>
                </div>
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-amber-500/10 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                  <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold">SEDANG DIGUNAKAN</span>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {gearList.filter((g) => g.status === 'in_use').length} Item
                  </p>
                </div>
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-sky-500/10 border-sky-200' : 'bg-sky-500/10 border-sky-500/20'}`}>
                  <span className="text-[10px] font-mono uppercase text-sky-600 dark:text-sky-400 font-bold">CHARGING / SERVIS</span>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                    {gearList.filter((g) => g.status === 'charging' || g.status === 'maintenance').length} Item
                  </p>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'Semua Alat' },
                  { id: 'camera', label: 'Kamera' },
                  { id: 'lens', label: 'Lensa' },
                  { id: 'lighting', label: 'Lighting / Strobo' },
                  { id: 'modifier', label: 'Modifier & Softbox' },
                  { id: 'backdrop', label: 'Backdrop' },
                  { id: 'props', label: 'Aksesoris & Props' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedGearCat(cat.id)}
                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedGearCat === cat.id
                        ? isLight
                          ? 'bg-zinc-900 text-white font-bold'
                          : 'bg-white text-zinc-950 font-bold'
                        : isLight
                        ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gear Items Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedGear.map((gear) => (
                <div
                  key={gear.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${cardBg}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-orange-500 font-bold">
                        [{gear.category}]
                      </span>
                      
                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          gear.status === 'ready'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : gear.status === 'in_use'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : gear.status === 'charging'
                            ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {gear.status === 'ready'
                          ? 'Ready'
                          : gear.status === 'in_use'
                          ? 'In-Use'
                          : gear.status === 'charging'
                          ? 'Charging'
                          : 'Maintenance'}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {gear.name}
                    </h3>

                    <div className="space-y-1 text-xs text-zinc-400">
                      {gear.serialNumber && (
                        <p className="font-mono text-[11px]">SN: {gear.serialNumber}</p>
                      )}
                      <p className="text-[11px] flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-zinc-500" />
                        <span>{gear.location}</span>
                      </p>
                    </div>

                    {/* Battery Indicator if present */}
                    {gear.batteryLevel !== undefined && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="flex items-center gap-1 text-zinc-400">
                            <BatteryCharging className="w-3 h-3 text-lime-500" />
                            <span>Baterai</span>
                          </span>
                          <span className="font-bold">{gear.batteryLevel}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              gear.batteryLevel > 50
                                ? 'bg-emerald-500'
                                : gear.batteryLevel > 20
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${gear.batteryLevel}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Current Session Note */}
                    {gear.currentSession && (
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px]">
                        ⚡ {gear.currentSession}
                      </div>
                    )}

                    {gear.notes && (
                      <p className={`text-[11px] ${textMuted} italic`}>{gear.notes}</p>
                    )}
                  </div>

                  {/* Quick Status Action Controls */}
                  <div className="pt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleGearStatus(gear.id, 'ready')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          gear.status === 'ready'
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-200 dark:bg-white/5 text-zinc-500 hover:text-white'
                        }`}
                      >
                        Ready
                      </button>
                      <button
                        onClick={() => handleToggleGearStatus(gear.id, 'in_use')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          gear.status === 'in_use'
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-200 dark:bg-white/5 text-zinc-500 hover:text-white'
                        }`}
                      >
                        In-Use
                      </button>
                      <button
                        onClick={() => handleToggleGearStatus(gear.id, 'charging')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          gear.status === 'charging'
                            ? 'bg-sky-500 text-white'
                            : 'bg-zinc-200 dark:bg-white/5 text-zinc-500 hover:text-white'
                        }`}
                      >
                        Charge
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteGear(gear.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 cursor-pointer"
                      title="Hapus Alat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Gear */}
            {renderPagination(
              gearPage,
              totalGearPages,
              filteredGearList.length,
              gearPerPage,
              setGearPage,
              'peralatan'
            )}
          </div>
        )}

        {/* ================= VIEW: DELIVERY & GOOGLE DRIVE LINK MANAGER ================= */}
        {activeNav === 'delivery' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-white/10">
                <div>
                  <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Portal Distribusi & Google Drive Link Manager
                  </h2>
                  <p className={`text-xs ${textMuted}`}>
                    Kelola link folder cloud, update progres editing, dan kirim hasil foto ke WhatsApp klien.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">
                    {approvedBookings.length} Sesi Terkonfirmasi
                  </span>
                </div>
              </div>

              {/* Delivery Toast Alert */}
              {deliverySavedToast && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{deliverySavedToast}</span>
                </div>
              )}

              {/* Status Filter */}
              <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
                {[
                  { id: 'ALL', label: 'Semua Booking' },
                  { id: 'PENDING_SHOOT', label: 'Menunggu Pemotretan' },
                  { id: 'RAW_SENT', label: 'RAW Negatives Dikirim' },
                  { id: 'EDITING', label: 'Sedang Editing' },
                  { id: 'READY_DELIVERY', label: 'File Final Siap' },
                  { id: 'COMPLETED', label: 'Selesai Sempurna' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDeliveryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      deliveryFilter === tab.id
                        ? isLight
                          ? 'bg-zinc-900 text-white font-bold'
                          : 'bg-white text-zinc-950 font-bold'
                        : isLight
                        ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Delivery List */}
            <div className="space-y-4">
              {paginatedDelivery.map((b) => {
                const currentDriveUrl = driveInputMap[b.id] !== undefined ? driveInputMap[b.id] : (b.googleDriveUrl || '');
                const currentStatus = b.deliveryStatus || 'PENDING_SHOOT';

                return (
                  <div
                    key={b.id}
                    className={`p-6 rounded-3xl border space-y-4 ${cardBg}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-orange-500">#{b.id}</span>
                          <span className="font-bold text-sm">{b.customerName}</span>
                          <span className="text-xs text-zinc-400">&bull; {b.packageName}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Jadwal: {b.date} ({b.timeSlot}) &bull; WA: <span className="font-mono">{b.customerPhone}</span>
                        </p>
                      </div>

                      {/* Delivery Stage Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {[
                          { key: 'PENDING_SHOOT', label: '1. Antrean Sesi' },
                          { key: 'RAW_SENT', label: '2. RAW Drive' },
                          { key: 'EDITING', label: '3. Retouching' },
                          { key: 'READY_DELIVERY', label: '4. Final Siap' },
                          { key: 'COMPLETED', label: '5. Selesai' },
                        ].map((st) => (
                          <button
                            key={st.key}
                            onClick={() => handleUpdateDeliveryStatus(b.id, st.key as any, currentDriveUrl)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-colors ${
                              currentStatus === st.key
                                ? 'bg-lime-300 text-zinc-950 shadow-sm'
                                : isLight
                                ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                : 'bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Google Drive Link Form */}
                    <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-zinc-200 dark:border-white/5 space-y-3">
                      <label className="text-xs font-bold flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-lime-500" />
                        <span>Link Folder Google Drive Klien:</span>
                      </label>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="url"
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={currentDriveUrl}
                          onChange={(e) => setDriveInputMap({ ...driveInputMap, [b.id]: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono ${inputBg}`}
                        />
                        <button
                          onClick={() => handleUpdateDeliveryStatus(b.id, currentStatus, currentDriveUrl)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs whitespace-nowrap cursor-pointer"
                        >
                          Simpan Link
                        </button>
                      </div>
                    </div>

                    {/* Bottom action: Send Link via WhatsApp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <span className="text-[11px] text-zinc-400">
                        {currentDriveUrl ? '✅ Link Drive terpasang dan siap dikirim.' : '⚠️ Masukkan link Drive sebelum broadcast ke WhatsApp.'}
                      </span>

                      <div className="flex items-center gap-2">
                        {currentDriveUrl && (
                          <a
                            href={currentDriveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-white/10 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka Folder Drive</span>
                          </a>
                        )}

                        <a
                          href={generateDriveDeliveryWhatsAppUrl(b, currentDriveUrl || 'https://drive.google.com', studioSettings)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sounds.playShutterSound()}
                          className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Kirim Link ke WA Klien</span>
                          <Send className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination for Delivery Sessions */}
            {renderPagination(
              deliveryPage,
              totalDeliveryPages,
              deliveryList.length,
              deliveryPerPage,
              setDeliveryPage,
              'sesi delivery'
            )}
          </div>
        )}

        {/* ================= VIEW: KALKULATOR PENAWARAN & WA BROADCAST ================= */}
        {activeNav === 'quote_calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            
            {/* LEFT 7-COL: Custom Quote Calculator */}
            <div className={`lg:col-span-7 p-6 rounded-3xl border space-y-6 ${cardBg}`}>
              <div className="pb-4 border-b border-zinc-200 dark:border-white/10">
                <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Kalkulator Penawaran Kustom (Custom Quotation)
                </h2>
                <p className={`text-xs ${textMuted}`}>
                  Hitung biaya custom photoshoot (extra jam, MUA, cetak kanvas, file RAW) dan buat penawaran resmi instan.
                </p>
              </div>

              {copiedQuoteToast && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Teks penawaran berhasil disalin ke clipboard!</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* Client info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold">Nama Prospek / Klien</label>
                    <input
                      type="text"
                      placeholder="Contoh: Sarah Angelina"
                      value={calcClientName}
                      onChange={(e) => setCalcClientName(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Nomor WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="0812xxxx"
                      value={calcClientPhone}
                      onChange={(e) => setCalcClientPhone(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl font-mono ${inputBg}`}
                    />
                  </div>
                </div>

                {/* Base Package */}
                <div>
                  <label className="block mb-1 font-semibold">Pilih Paket Dasar</label>
                  <select
                    value={calcPackageId}
                    onChange={(e) => setCalcPackageId(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  >
                    {SERVICE_PACKAGES.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} — Rp {pkg.price.toLocaleString('id-ID')} ({pkg.durationMinutes} mnt)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Adjusters: Extra Hours & Extra People */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 border border-zinc-200 dark:border-white/5 space-y-1.5">
                    <span className="font-semibold block">Extra Durasi (+Rp 250k/jam):</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCalcExtraHours((prev) => Math.max(0, prev - 1))}
                        className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm">{calcExtraHours} Jam</span>
                      <button
                        type="button"
                        onClick={() => setCalcExtraHours((prev) => prev + 1)}
                        className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 border border-zinc-200 dark:border-white/5 space-y-1.5">
                    <span className="font-semibold block">Tambahan Orang (+Rp 50k/org):</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCalcExtraPeople((prev) => Math.max(0, prev - 1))}
                        className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm">{calcExtraPeople} Orang</span>
                      <button
                        type="button"
                        onClick={() => setCalcExtraPeople((prev) => prev + 1)}
                        className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add-ons selection */}
                <div>
                  <label className="block mb-1.5 font-semibold">Pilih Layanan Tambahan (Add-ons):</label>
                  <div className="space-y-2 p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 border border-zinc-200 dark:border-white/5">
                    {[
                      { id: 'mua', name: 'Professional MUA & Hairdo Session', price: 450000 },
                      { id: 'express', name: 'Retouching Kilat Ekspres 24 Jam', price: 200000 },
                      { id: 'kanvas', name: 'Cetak Kanvas 60x90cm dengan Frame Kayu Jati', price: 450000 },
                      { id: 'photobook', name: 'Photobook Linen Hardcover 20 Halaman', price: 450000 },
                      { id: 'flashdisk', name: 'Flashdisk Kayu Grafir Studio Exclusive', price: 120000 },
                    ].map((addon) => {
                      const isChecked = calcSelectedAddons.includes(addon.id);
                      return (
                        <label key={addon.id} className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setCalcSelectedAddons((prev) =>
                                  isChecked ? prev.filter((x) => x !== addon.id) : [...prev, addon.id]
                                );
                              }}
                            />
                            <span>{addon.name}</span>
                          </div>
                          <span className="font-mono font-semibold">+Rp {addon.price.toLocaleString('id-ID')}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Calculation Total Summary */}
                {(() => {
                  const basePkg = SERVICE_PACKAGES.find((p) => p.id === calcPackageId) || SERVICE_PACKAGES[0];
                  const extraHoursPrice = calcExtraHours * 250000;
                  const extraPeoplePrice = calcExtraPeople * 50000;
                  const addonsList = [
                    { id: 'mua', name: 'Professional MUA & Hairdo Session', price: 450000 },
                    { id: 'express', name: 'Retouching Kilat Ekspres 24 Jam', price: 200000 },
                    { id: 'kanvas', name: 'Cetak Kanvas 60x90cm dengan Frame Kayu Jati', price: 450000 },
                    { id: 'photobook', name: 'Photobook Linen Hardcover 20 Halaman', price: 450000 },
                    { id: 'flashdisk', name: 'Flashdisk Kayu Grafir Studio Exclusive', price: 120000 },
                  ];
                  const addonsPrice = addonsList
                    .filter((a) => calcSelectedAddons.includes(a.id))
                    .reduce((sum, a) => sum + a.price, 0);

                  const grandTotal = basePkg.price + extraHoursPrice + extraPeoplePrice + addonsPrice;
                  const dp50 = Math.round(grandTotal * 0.5);

                  const breakdownItems = [
                    `Paket Dasar: ${basePkg.name} (Rp ${basePkg.price.toLocaleString('id-ID')})`,
                    ...(calcExtraHours > 0 ? [`Tambahan Waktu: ${calcExtraHours} Jam (+Rp ${extraHoursPrice.toLocaleString('id-ID')})`] : []),
                    ...(calcExtraPeople > 0 ? [`Tambahan Peserta: ${calcExtraPeople} Orang (+Rp ${extraPeoplePrice.toLocaleString('id-ID')})`] : []),
                    ...addonsList.filter((a) => calcSelectedAddons.includes(a.id)).map((a) => `${a.name} (+Rp ${a.price.toLocaleString('id-ID')})`),
                  ];

                  const copyQuoteText = () => {
                    const text = `Halo Kak ${calcClientName || 'Pelanggan'},\n\nBerikut Rincian Penawaran Resmi Studio Diaferastudio:\n${breakdownItems.map((b) => `• ${b}`).join('\n')}\n\nTOTAL ESTIMASI: Rp ${grandTotal.toLocaleString('id-ID')}\nDP 50%: Rp ${dp50.toLocaleString('id-ID')}\n\nTerima kasih! ✨`;
                    navigator.clipboard.writeText(text);
                    setCopiedQuoteToast(true);
                    setTimeout(() => setCopiedQuoteToast(false), 3000);
                  };

                  return (
                    <div className="pt-4 border-t border-zinc-200 dark:border-white/10 space-y-4">
                      <div className="p-4 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-lime-600 dark:text-lime-400 font-bold">
                            TOTAL PENAWARAN (ESTIMASI)
                          </span>
                          <p className="text-2xl font-black text-lime-600 dark:text-lime-400 mt-0.5">
                            Rp {grandTotal.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            DP 50% Penguncian Slot: Rp {dp50.toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={copyQuoteText}
                            className="px-3.5 py-1.5 rounded-full border border-zinc-300 dark:border-white/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Teks</span>
                          </button>

                          <a
                            href={generateCustomQuotationWhatsAppUrl(
                              calcClientName || 'Pelanggan',
                              calcClientPhone || studioSettings.whatsappNumber,
                              basePkg.name,
                              breakdownItems,
                              grandTotal,
                              studioSettings
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => sounds.playShutterSound()}
                            className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* RIGHT 5-COL: Studio WhatsApp Quick Broadcast & Reminder Center */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border space-y-6 ${cardBg}`}>
              <div className="pb-4 border-b border-zinc-200 dark:border-white/10">
                <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Template Broadcast WhatsApp Studio
                </h2>
                <p className={`text-xs ${textMuted}`}>
                  Kirim pengingat jadwal H-1, tagihan sisa pelunasan, atau minta rating ulasan bintang 5 dengan 1 klik.
                </p>
              </div>

              {/* Template Type Selector */}
              <div className="space-y-2 text-xs">
                <label className="block font-semibold">Pilih Jenis Template:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'H1', label: 'Pengingat H-1' },
                    { id: 'PAYMENT', label: 'Sisa Pelunasan' },
                    { id: 'REVIEW', label: 'Review Bintang 5' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setBroadcastType(tpl.id as any)}
                      className={`py-2 px-2 rounded-xl font-bold text-center text-[11px] transition-colors cursor-pointer ${
                        broadcastType === tpl.id
                          ? 'bg-lime-300 text-zinc-950 font-bold'
                          : isLight
                          ? 'bg-zinc-100 text-zinc-600'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Target Selector */}
              <div className="space-y-2 text-xs">
                <label className="block font-semibold">Pilih Klien Tujuan:</label>
                <select
                  value={broadcastTargetBooking?.id || ''}
                  onChange={(e) => {
                    const found = bookings.find((b) => b.id === e.target.value);
                    setBroadcastTargetBooking(found || null);
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                >
                  <option value="">-- Pilih dari booking aktif --</option>
                  {approvedBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.id} — {b.customerName} ({b.date} / {b.timeSlot})
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Live Preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 block">Pratinjau Pesan yang Akan Dikirim:</span>
                <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/40 border border-zinc-200 dark:border-white/5 text-xs text-zinc-300 font-mono whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                  {broadcastTargetBooking ? (
                    broadcastType === 'H1' ? (
                      `Halo Kak *${broadcastTargetBooking.customerName}*!\n\nPengingat ramah dari *${studioSettings.studioName}* bahwa jadwal sesi foto Anda akan berlangsung besok:\n• Tanggal: ${broadcastTargetBooking.date}\n• Jam: *${broadcastTargetBooking.timeSlot}*\n• Layanan: ${broadcastTargetBooking.packageName}\n\n📍 Alamat Studio: ${studioSettings.address}\n\nMohon tiba 15 menit lebih awal. Sampai jumpa besok! ✨`
                    ) : broadcastType === 'PAYMENT' ? (
                      `Halo Kak *${broadcastTargetBooking.customerName}*,\n\nPengingat sisa pelunasan sesi foto #${broadcastTargetBooking.id} sebesar *Rp ${(broadcastTargetBooking.totalPrice - broadcastTargetBooking.dpAmount).toLocaleString('id-ID')}*.\n\nRekening: ${studioSettings.bankName} - ${studioSettings.bankAccountNumber} a/n ${studioSettings.bankAccountHolder}.\nTerima kasih banyak! 🙏`
                    ) : (
                      `Halo Kak *${broadcastTargetBooking.customerName}*!\n\nTerima kasih telah mempercayai ${studioSettings.studioName}. Jika berkenan, mohon bantu beri review bintang 5 di Google Maps kami ya Kak. Ulasan Kakak sangat berarti bagi kami! 🖤`
                    )
                  ) : (
                    'Pilih klien di atas untuk melihat pratinjau pesan otomatis...'
                  )}
                </div>
              </div>

              {/* Launch WhatsApp Button */}
              {broadcastTargetBooking && (
                <a
                  href={
                    broadcastType === 'H1'
                      ? generateReminderHMin1WhatsAppUrl(broadcastTargetBooking, studioSettings)
                      : broadcastType === 'PAYMENT'
                      ? generatePaymentReminderWhatsAppUrl(broadcastTargetBooking, studioSettings)
                      : generateReviewRequestWhatsAppUrl(broadcastTargetBooking, studioSettings)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sounds.playShutterSound()}
                  className="w-full py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Buka WhatsApp & Kirim Pesan Sekarang</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

          </div>
        )}

        {/* ================= VIEW: STUDIO TO-DO LIST ================= */}
        {activeNav === 'tasks' && (
          <div className={`p-6 rounded-3xl border ${cardBg} space-y-6`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">Studio Operational To-Do List</h2>
                <p className={`text-xs ${textMuted}`}>Daftar pekerjaan harian fotografer & kru Diaferastudio.</p>
              </div>

              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-4 py-2 rounded-full bg-lime-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pekerjaan Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paginatedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between ${
                    task.isCompleted ? 'opacity-50 line-through' : ''
                  } ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/[0.02] border-white/10'}`}
                >
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleTask(task.id)} className="mt-0.5 cursor-pointer text-lime-500">
                      {task.isCompleted ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5" />}
                    </button>
                    <div>
                      <p className="text-xs font-semibold">{task.title}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-1">
                        <span className="uppercase text-orange-500 font-bold">[{task.category}]</span>
                        <span>Deadline: {task.deadline}</span>
                        {task.assignedTo && <span>PIC: {task.assignedTo}</span>}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => deleteTask(task.id)} className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination for tasks */}
            {renderPagination(
              taskPage,
              totalTaskPages,
              tasks.length,
              taskPerPage,
              setTaskPage,
              'pekerjaan'
            )}
          </div>
        )}

        {/* ================= VIEW: DIREKTORI KLIEN (CRM) ================= */}
        {activeNav === 'clients' && (
          <div className={`p-6 rounded-3xl border ${cardBg} space-y-6`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">Direktori Klien Studio (CRM)</h2>
                <p className={`text-xs ${textMuted}`}>Daftar pelanggan, riwayat pemotretan, dan direct WhatsApp CRM chat.</p>
              </div>
              <span className={`text-xs font-mono ${textMuted}`}>{clientDirectory.length} Total Klien</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className={`text-[11px] font-mono uppercase border-b ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                  <tr>
                    <th className="py-3 px-4">NAMA KLIEN</th>
                    <th className="py-3 px-4">WHATSAPP</th>
                    <th className="py-3 px-4">TOTAL BOOKING</th>
                    <th className="py-3 px-4">LTV (TOTAL BELANJA)</th>
                    <th className="py-3 px-4">TERAKHIR SESI</th>
                    <th className="py-3 px-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                  {paginatedClients.map((client, idx) => (
                    <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-semibold">{client.name}</td>
                      <td className="py-3 px-4 font-mono">{client.phone}</td>
                      <td className="py-3 px-4 font-mono font-bold">{client.bookingsCount} Sesi</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Rp {client.totalSpent.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono">{client.lastDate}</td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-full bg-emerald-500 text-black font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Chat WA</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for CRM Clients */}
            {renderPagination(
              clientPage,
              totalClientPages,
              clientDirectory.length,
              clientPerPage,
              setClientPage,
              'klien'
            )}
          </div>
        )}

        {/* ================= VIEW: TRANSAKSI & PEMBUKUAN KAS STUDIO ================= */}
        {activeNav === 'transactions' && (
          <div className="space-y-6">
            {/* Financial Summary Top Bento Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-5 rounded-3xl border ${cardBg}`}>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">TOTAL OMZET PEMASUKAN</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </p>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Dari booking DP & Pelunasan valid
                </p>
              </div>

              <div className={`p-5 rounded-3xl border ${cardBg}`}>
                <span className="text-[10px] font-mono uppercase text-rose-500 font-bold">BIAYA OPERASIONAL / PENGELUARAN</span>
                <p className="text-2xl font-black text-rose-500 mt-1">
                  Rp {totalExpenses.toLocaleString('id-ID')}
                </p>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Honor editor, cetak lab, listrik & perlengkapan
                </p>
              </div>

              <div className={`p-5 rounded-3xl border ${cardBg}`}>
                <span className="text-[10px] font-mono uppercase text-lime-600 dark:text-lime-400 font-bold">ESTIMASI LABA BERSIH (NET PROFIT)</span>
                <p className="text-2xl font-black text-lime-600 dark:text-lime-400 mt-1">
                  Rp {netProfit.toLocaleString('id-ID')}
                </p>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Margin keuntungan bersih studio
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border ${cardBg} space-y-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-white/10">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold">Laporan & Pembukuan Kas Studio</h2>
                  
                  {/* Tab Switcher: Bookings vs Expenses */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTrxTab('bookings')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        trxTab === 'bookings'
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                          : isLight
                          ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Pemasukan Booking ({filteredBookings.length})
                    </button>
                    <button
                      onClick={() => setTrxTab('expenses')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        trxTab === 'expenses'
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                          : isLight
                          ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Pengeluaran Kas ({expenses.length})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {trxTab === 'expenses' && (
                    <button
                      onClick={() => setShowAddExpenseModal(true)}
                      className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Catat Pengeluaran</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download File CSV</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: BOOKING REVENUE */}
              {trxTab === 'bookings' && (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className={`text-[11px] font-mono uppercase border-b ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                      <tr>
                        <th className="py-3 px-4">ID BOOKING</th>
                        <th className="py-3 px-4">PELANGGAN</th>
                        <th className="py-3 px-4">LAYANAN</th>
                        <th className="py-3 px-4">JADWAL</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4">PEMBAYARAN</th>
                        <th className="py-3 px-4">TOTAL</th>
                        <th className="py-3 px-4 text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                      {paginatedBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-black/5 dark:hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono font-bold text-orange-500">#{b.id}</td>
                          <td className="py-3 px-4 font-semibold">{b.customerName}</td>
                          <td className="py-3 px-4">{b.packageName}</td>
                          <td className="py-3 px-4 font-mono">{b.date} ({b.timeSlot})</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {b.paymentStatus === 'PAID_FULL' ? 'LUNAS (100%)' : `DP (Rp ${b.dpAmount.toLocaleString('id-ID')})`}
                            {b.paymentStatus === 'DP_PAID' && (
                              <button
                                onClick={() => onUpdatePaymentStatus(b.id, 'PAID_FULL')}
                                className="ml-2 text-[10px] text-orange-500 underline cursor-pointer"
                              >
                                [Lunas]
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">Rp {b.totalPrice.toLocaleString('id-ID')}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setReceiptBooking(b)}
                              className="p-1.5 rounded-full bg-zinc-200 dark:bg-white/10 cursor-pointer"
                              title="Invoice Kwitansi"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination for Bookings */}
                  {renderPagination(
                    trxPage,
                    totalTrxPages,
                    filteredBookings.length,
                    trxPerPage,
                    setTrxPage,
                    'transaksi booking'
                  )}
                </div>
              )}

              {/* TAB 2: EXPENSES / PENGELUARAN KAS */}
              {trxTab === 'expenses' && (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/10 p-2">
                  <table className="w-full text-left text-xs">
                    <thead className={`text-[11px] font-mono uppercase border-b ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                      <tr>
                        <th className="py-3 px-4">TANGGAL</th>
                        <th className="py-3 px-4">KETERANGAN / DESKRIPSI</th>
                        <th className="py-3 px-4">KATEGORI</th>
                        <th className="py-3 px-4">DIBAYAR OLEH</th>
                        <th className="py-3 px-4">NOMINAL</th>
                        <th className="py-3 px-4 text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                      {paginatedExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-black/5 dark:hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono text-zinc-400">{exp.date}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold block">{exp.title}</span>
                            {exp.notes && <span className={`text-[10px] ${textMuted} italic`}>{exp.notes}</span>}
                          </td>
                          <td className="py-3 px-4 font-mono uppercase text-orange-500 font-bold text-[10px]">
                            [{exp.category}]
                          </td>
                          <td className="py-3 px-4">{exp.paidBy}</td>
                          <td className="py-3 px-4 font-mono font-bold text-rose-500">
                            - Rp {exp.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-500 cursor-pointer"
                              title="Hapus Pengeluaran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination for Expenses */}
                  {renderPagination(
                    expensePage,
                    totalExpensePages,
                    expenses.length,
                    expensePerPage,
                    setExpensePage,
                    'pengeluaran kas'
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW: PORTOFOLIO CRUD ================= */}
        {activeNav === 'portfolio' && (
          <div className={`p-6 rounded-3xl border ${cardBg} space-y-6`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">Kelola Galeri Portofolio Studio</h2>
                <p className={`text-xs ${textMuted}`}>Tambah karya, update deskripsi teknis, atau hapus item dari galeri web.</p>
              </div>

              <button
                onClick={() => {
                  setEditingPortfolioId(null);
                  setPortfolioFormData({
                    title: '',
                    category: 'wisuda',
                    clientName: '',
                    imageUrl: HERO_STUDIO_IMAGE,
                    description: '',
                    tags: 'Studio, Editorial',
                    camera: 'Sony A7R V',
                    lens: 'FE 50mm f/1.2 GM',
                    lighting: 'Profoto D2 + 120cm Octabox with Grid',
                  });
                  setPortfolioModalOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Karya Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {paginatedPortfolio.map((item) => (
                <div key={item.id} className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col justify-between">
                  <div className="aspect-[16/10] bg-black">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-orange-500 font-bold">[{item.category}]</span>
                    <h3 className="font-bold text-sm truncate">{item.title}</h3>
                    <p className={`text-xs ${textMuted} line-clamp-2`}>{item.description}</p>
                  </div>
                  <div className="p-3 border-t border-zinc-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSeatClickSound();
                        setQuickPhotoItem(item);
                        setQuickPhotoUrl(item.imageUrl);
                      }}
                      className="px-3 py-1 rounded-full bg-lime-300 hover:bg-lime-200 text-zinc-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      title="Ganti URL gambar dari Instagram / Web"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Ganti Link Foto</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPortfolioId(item.id);
                          setPortfolioFormData({
                            title: item.title,
                            category: item.category,
                            clientName: item.clientName || '',
                            imageUrl: item.imageUrl,
                            description: item.description,
                            tags: item.tags.join(', '),
                            camera: item.gearInfo?.camera || '',
                            lens: item.gearInfo?.lens || '',
                            lighting: item.gearInfo?.lighting || '',
                          });
                          setPortfolioModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-white/10 text-xs font-medium cursor-pointer hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus karya "${item.title}"?`)) onDeletePortfolio(item.id);
                        }}
                        className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 text-xs font-medium cursor-pointer hover:bg-rose-500/30 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Portfolio */}
            {renderPagination(
              portfolioPage,
              totalPortfolioPages,
              portfolioItems.length,
              portfolioPerPage,
              setPortfolioPage,
              'karya portofolio'
            )}
          </div>
        )}

        {/* ================= VIEW: PENGATURAN STUDIO ================= */}
        {activeNav === 'settings' && (
          <div className={`p-6 rounded-3xl border ${cardBg} space-y-6 max-w-2xl`}>
            <div className="pb-4 border-b border-zinc-200 dark:border-white/10">
              <h2 className="text-lg font-bold">Pengaturan Studio & Akun</h2>
              <p className={`text-xs ${textMuted}`}>Perbarui nama studio, WhatsApp kontak, dan rekening bank.</p>
            </div>

            {/* Quick Link Card to Admin Profile & Security */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'} flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-zinc-900 dark:text-white">Profil & Keamanan Pengelola Admin</p>
                  <p className={`text-[11px] ${textMuted}`}>Ubah nama, peran, kontak, foto profil, dan password / PIN masuk admin.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playSeatClickSound();
                  setActiveNav('profile');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-zinc-950 font-bold text-xs transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                Ubah Profil & PIN
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sounds.playShutterSound();
                onUpdateSettings(settingsForm);
                saveStoredSettings(settingsForm);
                setSettingsSavedToast(true);
                setTimeout(() => setSettingsSavedToast(false), 3000);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold">Nama Studio</label>
                <input
                  type="text"
                  value={settingsForm.studioName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, studioName: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Nomor WhatsApp Studio</label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl font-mono ${inputBg}`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Alamat Lengkap</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Bank Penerima DP</label>
                  <input
                    type="text"
                    value={settingsForm.bankName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Nomor Rekening</label>
                  <input
                    type="text"
                    value={settingsForm.bankAccountNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountNumber: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl font-mono ${inputBg}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-white/10">
                <label className="font-bold flex items-center justify-between">
                  <span>URL Gambar Background 4K Hero Beranda</span>
                  <span className="text-[10px] font-mono text-zinc-400">Resolusi Tinggi / 4K</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... atau /images/..."
                    value={settingsForm.heroBackgroundImageUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBackgroundImageUrl: e.target.value })}
                    className={`flex-1 px-3.5 py-2 rounded-xl font-mono text-[11px] ${inputBg}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!settingsForm.heroBackgroundImageUrl?.trim()) return;
                      sounds.playShutterSound();
                      onUpdateSettings(settingsForm);
                      saveStoredSettings(settingsForm);
                      setSettingsSavedToast(true);
                      setTimeout(() => setSettingsSavedToast(false), 3000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Terapkan Sekarang
                  </button>
                </div>
                <p className={`text-[10px] ${textMuted}`}>
                  Latar belakang atmosferik di bagian atas beranda belakang tulisan Diaféra Studio. Masukkan direct image link dari Instagram, CDN, atau web (4K).
                </p>

                {/* Quick 4K Presets */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase">Pilihan Preset 4K Cepat:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Cinematic Dark Studio 4K', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop' },
                      { label: 'Minimalist Architectural 4K', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop' },
                      { label: 'Studio Setup Asli', url: '/images/diafera_hero_studio_1791366216457.jpg' },
                      { label: 'Wisuda Drapery', url: '/images/diafera_portfolio_wisuda_1791366242072.jpg' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          sounds.playSeatClickSound();
                          setSettingsForm({ ...settingsForm, heroBackgroundImageUrl: preset.url });
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] transition-colors cursor-pointer ${
                          settingsForm.heroBackgroundImageUrl === preset.url
                            ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                            : isLight
                            ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {settingsForm.heroBackgroundImageUrl && (
                  <div className="w-full sm:w-72 h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 relative mt-2 bg-black shadow-inner">
                    <img
                      src={settingsForm.heroBackgroundImageUrl}
                      alt="Thumbnail Hero 4K"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/diafera_hero_studio_1791366216457.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/90 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm truncate">
                      Pratinjau Hero: {settingsForm.heroBackgroundImageUrl}
                    </div>
                  </div>
                )}
              </div>

              {/* Kelola 5 Foto Showcase Beranda (Preview Cards 4K) */}
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-xs flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>5 Foto Showcase Beranda (Preview Cards 4K)</span>
                    </label>
                    <p className={`text-[10px] ${textMuted} mt-0.5`}>
                      Ubah tautan 5 foto kartu di bagian awal beranda (mendukung direct link Instagram, CDN, Unsplash, atau link web apa pun).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSeatClickSound();
                      setSettingsForm({ ...settingsForm, heroCards: DEFAULT_HERO_CARDS });
                    }}
                    className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default 4K</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(settingsForm.heroCards || DEFAULT_HERO_CARDS).map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/10'
                      }`}
                    >
                      <div className="w-12 h-14 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10 shrink-0 bg-black relative">
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_HERO_CARDS[idx]?.imageUrl || HERO_STUDIO_IMAGE;
                          }}
                        />
                      </div>
                      <div className="flex-1 w-full min-w-0 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold truncate">#{idx + 1} {card.title}</span>
                          <span className={`text-[9px] font-mono ${textMuted}`}>{card.concept}</span>
                        </div>
                        <input
                          type="text"
                          value={card.imageUrl}
                          onChange={(e) => {
                            const current = [...(settingsForm.heroCards || DEFAULT_HERO_CARDS)];
                            current[idx] = { ...current[idx], imageUrl: e.target.value };
                            setSettingsForm({ ...settingsForm, heroCards: current });
                          }}
                          placeholder="https://..."
                          className={`w-full px-2.5 py-1 rounded-lg font-mono text-[10px] ${inputBg}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {settingsSavedToast && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
                  Pengaturan berhasil disimpan!
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-sm"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        )}

        {/* ================= VIEW: PROFIL & DATA ADMIN (SUPERADMIN) ================= */}
        {activeNav === 'profile' && (
          <div className="space-y-6 max-w-4xl pb-10">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-lime-500" />
                  <h2 className="text-xl font-bold tracking-tight">Profil & Keamanan Pengelola</h2>
                </div>
                <p className={`text-xs ${textMuted} mt-1`}>
                  Kelola data identitas resmi admin, foto profil, kontak, kredensial password, dan keamanan sesi Diafera Studio.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaultProfile}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isLight
                      ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  Reset ke Default
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Kunci / Logout</span>
                </button>
              </div>
            </div>

            {/* Admin Overview & Avatar Banner */}
            <div className={`p-6 rounded-3xl border ${cardBg} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-lime-400 shadow-xl bg-zinc-800">
                    <img
                      src={profileForm.avatarUrl || HERO_STUDIO_IMAGE}
                      alt={profileForm.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-lime-400 text-zinc-950 font-bold shadow">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-600 dark:text-lime-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                      Superadmin &bull; Owner
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Sesi Terautentikasi Aktif
                    </span>
                  </div>

                  <h3 className="text-xl font-bold">{adminProfile.name || 'Raihan Gusti'}</h3>
                  <p className={`text-xs ${textMuted}`}>{adminProfile.role || 'Lead Photographer & Studio Director'}</p>

                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Phone className="w-3.5 h-3.5 text-lime-500" />
                      <span>{adminProfile.phone || '0812-8900-4512'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Login: {adminProfile.lastLoginAt ? new Date(adminProfile.lastLoginAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Aktif'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Avatar Presets */}
              <div className="mt-6 pt-5 border-t border-zinc-200/60 dark:border-white/10">
                <p className="text-[11px] font-bold mb-3 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-lime-500" />
                  <span>Pilih Preset Foto Profil Admin:</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: 'Lead Director', url: HERO_STUDIO_IMAGE },
                    { label: 'Wisuda Artist', url: WISUDA_PORTFOLIO_IMAGE },
                    { label: 'Wedding Visualist', url: PERNIKAHAN_PORTFOLIO_IMAGE },
                    { label: 'Commercial Prod', url: PRODUK_PORTFOLIO_IMAGE },
                    { label: 'Event & Concert', url: EVENT_PORTFOLIO_IMAGE },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        sounds.playSeatClickSound();
                        setProfileForm((prev) => ({ ...prev, avatarUrl: preset.url }));
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                        profileForm.avatarUrl === preset.url
                          ? 'border-lime-400 bg-lime-400/20 text-lime-600 dark:text-lime-300 font-bold'
                          : isLight
                          ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                          : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </div>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {profileSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-3 font-medium"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-bold text-sm">Profil & Kredensial Berhasil Disimpan!</p>
                  <p className="text-[11px] opacity-90">Data profil admin dan hak akses sistem telah diperbarui dan langsung aktif.</p>
                </div>
              </motion.div>
            )}

            {profileError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3 font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <div>
                  <p className="font-bold text-sm">Gagal Menyimpan</p>
                  <p className="text-[11px]">{profileError}</p>
                </div>
              </motion.div>
            )}

            {/* Profile Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Card: Identitas Profil Admin */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
                  <div className="pb-3 border-b border-zinc-200/60 dark:border-white/10 flex items-center gap-2">
                    <User className="w-4 h-4 text-lime-500" />
                    <h4 className="font-bold text-sm">Data Identitas Admin</h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Nama Lengkap Admin <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Contoh: Raihan Gusti"
                        className={`w-full px-3.5 py-2.5 rounded-xl ${inputBg}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Jabatan / Peran di Studio <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.role}
                        onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                        placeholder="Contoh: Lead Photographer & Studio Director"
                        className={`w-full px-3.5 py-2.5 rounded-xl ${inputBg}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Nomor WhatsApp / HP Admin <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Contoh: 081289004512"
                        className={`w-full px-3.5 py-2.5 rounded-xl font-mono ${inputBg}`}
                      />
                      <p className={`text-[10px] ${textMuted}`}>Digunakan untuk notifikasi admin & kontak resmi broadcast studio.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Alamat Email Resmi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="Contoh: raihangusti066@gmail.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl ${inputBg}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Custom URL Foto Avatar
                      </label>
                      <input
                        type="url"
                        value={profileForm.avatarUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                        placeholder="https://..."
                        className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-[11px] ${inputBg}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">
                        Bio Singkat / Visi Artistik
                      </label>
                      <textarea
                        rows={2}
                        value={profileForm.bio || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Deskripsi singkat profil fotografer..."
                        className={`w-full px-3.5 py-2 rounded-xl resize-none ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Card: Kredensial Keamanan & Sesi */}
                <div className={`p-6 rounded-3xl border ${cardBg} space-y-4 flex flex-col justify-between`}>
                  <div>
                    <div className="pb-3 border-b border-zinc-200/60 dark:border-white/10 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-sm">Keamanan & Password Admin</h4>
                    </div>

                    <div className="space-y-3.5 text-xs pt-3">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2">
                        <Key className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <div>
                          <p className="font-bold">Ubah Password / PIN Masuk</p>
                          <p className="mt-0.5 opacity-90 leading-relaxed">
                            Kosongkan kolom password baru jika tidak ingin mengubah PIN admin saat ini (Default: <strong className="font-mono">admin123</strong>).
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-700 dark:text-zinc-300">
                          Password Saat Ini (Untuk Verifikasi)
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPasswordInput}
                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                            placeholder="Masukkan password saat ini..."
                            className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl ${inputBg}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 cursor-pointer"
                          >
                            {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-700 dark:text-zinc-300">
                          Password / PIN Baru
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="Minimal 4 karakter..."
                            className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl ${inputBg}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-700 dark:text-zinc-300">
                          Konfirmasi Password Baru
                        </label>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder="Ulangi password baru..."
                          className={`w-full px-3.5 py-2.5 rounded-xl ${inputBg}`}
                        />
                      </div>

                      <div className="space-y-1 pt-2">
                        <label className="font-bold text-zinc-700 dark:text-zinc-300">
                          Durasi Timeout Sesi Otomatis
                        </label>
                        <select
                          value={profileForm.sessionTimeoutMinutes || 30}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              sessionTimeoutMinutes: Number(e.target.value),
                            })
                          }
                          className={`w-full px-3.5 py-2.5 rounded-xl ${inputBg}`}
                        >
                          <option value={15}>15 Menit (Sangat Ketat)</option>
                          <option value={30}>30 Menit (Standar Rekomendasi)</option>
                          <option value={60}>1 Jam</option>
                          <option value={120}>2 Jam</option>
                          <option value={240}>4 Jam (Maksimal)</option>
                        </select>
                        <p className={`text-[10px] ${textMuted}`}>
                          Sesi admin akan otomatis terkunci jika tidak ada aktivitas dalam durasi ini.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Status Box */}
                  <div className={`p-3.5 rounded-2xl border text-[11px] space-y-2 mt-4 ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-white/[0.03] border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Brute Force Limiter</span>
                      </span>
                      <span className="text-emerald-500 font-bold font-mono">Aktif (5x max)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-lime-500" />
                        <span>Token Sesi</span>
                      </span>
                      <span className="font-mono text-[10px] truncate max-w-[140px] text-zinc-400">
                        {activeSession?.token || 'diafera_active'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className={`text-[11px] ${textMuted}`}>
                  Pembaruan data admin otomatis tersinkronisasi ke seluruh kuitansi, watermark cetak, dan pengaturan studio.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-lime-300 hover:bg-lime-200 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Perubahan Profil & Keamanan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ================= MODAL: ADD TASK ================= */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`p-6 rounded-3xl border w-full max-w-md space-y-4 ${cardBg}`}>
            <h3 className="font-bold text-base">Tambah Studio To-Do</h3>
            <form onSubmit={handleAddNewTask} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium">Judul Pekerjaan</label>
                <input
                  type="text"
                  placeholder="Misal: Siapkan softbox 120cm..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  autoFocus
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Kategori</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                >
                  <option value="editing">Editing & Retouching</option>
                  <option value="gear">Gear & Lighting Prep</option>
                  <option value="delivery">Delivery Link Google Drive</option>
                  <option value="client">Client Brief & Wardrobe</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-300 dark:border-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-lime-300 text-zinc-950 font-bold"
                >
                  Simpan Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANUAL WALK-IN BOOKING ================= */}
      {manualBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className={`p-6 rounded-3xl border w-full max-w-lg space-y-4 my-8 ${cardBg}`}>
            <div className="flex justify-between items-center border-b pb-3 border-zinc-200 dark:border-white/10">
              <h3 className="font-bold text-base">+ Tambah Booking Manual / Walk-in</h3>
              <button onClick={() => setManualBookingModalOpen(false)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualBooking} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">Nama Pelanggan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap"
                    value={manualForm.customerName}
                    onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0812xxxx"
                    value={manualForm.customerPhone}
                    onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">Pilih Paket Sesi</label>
                  <select
                    value={manualForm.packageId}
                    onChange={(e) => setManualForm({ ...manualForm, packageId: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  >
                    {SERVICE_PACKAGES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} - Rp {p.price.toLocaleString('id-ID')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Tanggal</label>
                  <input
                    type="date"
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Pilih Slot Jam</label>
                <select
                  value={manualForm.timeSlotId}
                  onChange={(e) => {
                    const found = adminSlots.find((s) => s.time === e.target.value);
                    setManualForm({
                      ...manualForm,
                      timeSlotId: e.target.value,
                      timeSlot: found ? found.label : `${e.target.value} WIB`,
                    });
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                >
                  {adminSlots.map((s) => (
                    <option key={s.id} value={s.time}>{s.label} ({s.status})</option>
                  ))}
                </select>
              </div>

              {/* Addons Selection (Sangat berguna untuk studio!) */}
              <div>
                <label className="block mb-1 font-medium">Layanan Tambahan (Add-ons):</label>
                <div className="space-y-1.5 p-3 rounded-2xl bg-black/5 dark:bg-black/30">
                  {STUDIO_ADDONS.map((addon) => {
                    const isChecked = manualForm.selectedAddons.includes(addon.id);
                    return (
                      <label key={addon.id} className="flex items-center justify-between cursor-pointer text-xs">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const updated = isChecked
                                ? manualForm.selectedAddons.filter((id) => id !== addon.id)
                                : [...manualForm.selectedAddons, addon.id];
                              setManualForm({ ...manualForm, selectedAddons: updated });
                            }}
                          />
                          <span>{addon.name}</span>
                        </div>
                        <span className="font-mono font-medium">+Rp {addon.price.toLocaleString('id-ID')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="paidFullCheck"
                  checked={manualForm.isPaidFull}
                  onChange={(e) => setManualForm({ ...manualForm, isPaidFull: e.target.checked })}
                />
                <label htmlFor="paidFullCheck" className="cursor-pointer font-medium">
                  Langsung Bayar Lunas di Studio (100%)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setManualBookingModalOpen(false)}
                  className="px-4 py-2 rounded-full border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-lime-300 text-zinc-950 font-bold"
                >
                  Simpan & Kunci Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECEIPT INVOICE ================= */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`p-6 rounded-3xl border w-full max-w-md space-y-4 ${cardBg}`}>
            <div className="flex justify-between items-center border-b pb-3 border-zinc-200 dark:border-white/10">
              <h3 className="font-bold text-base">Invoice #{receiptBooking.id}</h3>
              <button onClick={() => setReceiptBooking(null)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={textMuted}>Klien:</span>
                <span className="font-bold">{receiptBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className={textMuted}>WhatsApp:</span>
                <span className="font-mono">{receiptBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className={textMuted}>Layanan:</span>
                <span className="font-medium">{receiptBooking.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className={textMuted}>Jadwal:</span>
                <span className="font-medium text-orange-500">{receiptBooking.date} ({receiptBooking.timeSlot})</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-mono">
                <span>Total Biaya:</span>
                <span className="font-bold">Rp {receiptBooking.totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Status Bayar:</span>
                <span className="font-bold text-emerald-500">
                  {receiptBooking.paymentStatus === 'PAID_FULL' ? 'LUNAS (100%)' : `DP (Rp ${receiptBooking.dpAmount.toLocaleString('id-ID')})`}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs"
              >
                Cetak Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REJECT ================= */}
      {rejectModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`p-6 rounded-3xl border w-full max-w-md space-y-4 ${cardBg}`}>
            <h3 className="font-bold text-base text-rose-500">Tolak Booking #{rejectModalBooking.id}</h3>
            <p className="text-xs">Klien: {rejectModalBooking.customerName} ({rejectModalBooking.date})</p>
            <div>
              <label className="text-xs font-medium block mb-1">Alasan Penolakan:</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full p-3 rounded-xl text-xs ${inputBg}`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalBooking(null)}
                className="px-4 py-2 rounded-full border text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-full bg-rose-500 text-white font-bold text-xs"
              >
                Tolak & Buka WA Klien
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PORTFOLIO CRUD ================= */}
      {portfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className={`p-6 rounded-3xl border w-full max-w-lg space-y-4 my-8 ${cardBg}`}>
            <div className="flex justify-between items-center border-b pb-3 border-zinc-200 dark:border-white/10">
              <h3 className="font-bold text-base">{editingPortfolioId ? 'Edit Portofolio' : 'Tambah Portofolio'}</h3>
              <button onClick={() => setPortfolioModalOpen(false)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePortfolio} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium">Judul Karya *</label>
                <input
                  type="text"
                  required
                  value={portfolioFormData.title}
                  onChange={(e) => setPortfolioFormData({ ...portfolioFormData, title: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                />
              </div>

              {/* Image URL Input & Live Preview (Instagram / Cloud / Web link) */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-xs">
                    Link Foto / URL Gambar (Bisa dari Instagram / Cloud / Web) *
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">JPG / PNG / WebP</span>
                </div>
                
                <input
                  type="url"
                  required
                  placeholder="https://... tempel link foto dari Instagram atau web di sini"
                  value={portfolioFormData.imageUrl}
                  onChange={(e) => setPortfolioFormData({ ...portfolioFormData, imageUrl: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl font-mono text-xs ${inputBg}`}
                />

                {/* Live Preview Box */}
                {portfolioFormData.imageUrl && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10 shrink-0 bg-black">
                      <img
                        src={portfolioFormData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.opacity = '0.3';
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      <p className="font-semibold text-white">Live Preview Foto</p>
                      <p className="text-[10px] truncate max-w-xs">{portfolioFormData.imageUrl}</p>
                    </div>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-[10px]">
                  <span className="text-zinc-500">Preset contoh:</span>
                  {[
                    { name: 'Wisuda', url: WISUDA_PORTFOLIO_IMAGE },
                    { name: 'Pernikahan', url: PERNIKAHAN_PORTFOLIO_IMAGE },
                    { name: 'Produk', url: PRODUK_PORTFOLIO_IMAGE },
                    { name: 'Studio', url: HERO_STUDIO_IMAGE },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setPortfolioFormData({ ...portfolioFormData, imageUrl: preset.url })}
                      className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:text-white"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">Kategori</label>
                  <select
                    value={portfolioFormData.category}
                    onChange={(e) => setPortfolioFormData({ ...portfolioFormData, category: e.target.value as any })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  >
                    <option value="wisuda">Wisuda / Graduation</option>
                    <option value="family">Family Session</option>
                    <option value="portrait">Personal & Pas Foto</option>
                    <option value="pernikahan">Pernikahan & Maternity</option>
                    <option value="studio">Studio Space & Rent</option>
                    <option value="produk">Produk & Commercial</option>
                    <option value="event">Event Khusus</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Klien / Subjek</label>
                  <input
                    type="text"
                    value={portfolioFormData.clientName}
                    onChange={(e) => setPortfolioFormData({ ...portfolioFormData, clientName: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Deskripsi</label>
                <textarea
                  rows={2}
                  value={portfolioFormData.description}
                  onChange={(e) => setPortfolioFormData({ ...portfolioFormData, description: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Kamera</label>
                  <input
                    type="text"
                    value={portfolioFormData.camera}
                    onChange={(e) => setPortfolioFormData({ ...portfolioFormData, camera: e.target.value })}
                    className={`w-full p-2 rounded-lg ${inputBg}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Lensa</label>
                  <input
                    type="text"
                    value={portfolioFormData.lens}
                    onChange={(e) => setPortfolioFormData({ ...portfolioFormData, lens: e.target.value })}
                    className={`w-full p-2 rounded-lg ${inputBg}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Lighting</label>
                  <input
                    type="text"
                    value={portfolioFormData.lighting}
                    onChange={(e) => setPortfolioFormData({ ...portfolioFormData, lighting: e.target.value })}
                    className={`w-full p-2 rounded-lg ${inputBg}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPortfolioModalOpen(false)}
                  className="px-4 py-2 rounded-full border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-lime-300 text-zinc-950 font-bold"
                >
                  Simpan Karya
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK PHOTO LINK CHANGE (1-KLIK INSTAGRAM / WEB URL) ================= */}
      {quickPhotoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`p-6 rounded-3xl border w-full max-w-md space-y-4 ${cardBg} shadow-2xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-lime-400" />
                <h3 className="font-bold text-sm">Ganti Link Foto Portofolio</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickPhotoItem(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPhoto} className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">{quickPhotoItem.title}</p>
                <p className={`text-[11px] ${textMuted}`}>Kategori: {quickPhotoItem.category}</p>
              </div>

              {/* Image Preview */}
              <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-black relative">
                <img
                  src={quickPhotoUrl || quickPhotoItem.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.3';
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">
                  Tempel URL Gambar / Link Foto Instagram:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://... masukkan link foto dari Instagram atau web"
                  value={quickPhotoUrl}
                  onChange={(e) => setQuickPhotoUrl(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono ${inputBg}`}
                  autoFocus
                />
                <p className={`text-[10px] ${textMuted}`}>
                  Tips: Anda bisa menyalin alamat gambar (Copy Image Address) dari postingan Instagram atau link hosting foto apa saja.
                </p>
              </div>

              {quickPhotoSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-center">
                  Foto berhasil diperbarui dan tersimpan!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPhotoItem(null)}
                  className="px-4 py-2 rounded-full border text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-lime-300 hover:bg-lime-200 text-zinc-950 font-bold text-xs shadow-sm cursor-pointer"
                >
                  Simpan & Tampilkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STUDIO GEAR ================= */}
      {showAddGearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`p-6 rounded-3xl border w-full max-w-md space-y-4 ${cardBg}`}>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-lime-500" />
              <span>Tambah Alat / Gear Studio</span>
            </h3>

            <form onSubmit={handleAddNewGear} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Nama Alat / Lensa / Strobo *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Profoto B10X Plus TTL..."
                  value={newGearForm.name}
                  onChange={(e) => setNewGearForm({ ...newGearForm, name: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Kategori</label>
                  <select
                    value={newGearForm.category}
                    onChange={(e) => setNewGearForm({ ...newGearForm, category: e.target.value as any })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  >
                    <option value="camera">Kamera</option>
                    <option value="lens">Lensa</option>
                    <option value="lighting">Lighting / Strobo</option>
                    <option value="modifier">Modifier / Softbox</option>
                    <option value="backdrop">Backdrop</option>
                    <option value="props">Aksesoris / Props</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Status Awal</label>
                  <select
                    value={newGearForm.status}
                    onChange={(e) => setNewGearForm({ ...newGearForm, status: e.target.value as any })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  >
                    <option value="ready">Ready (Siap Pakai)</option>
                    <option value="in_use">In-Use (Dipakai)</option>
                    <option value="charging">Charging</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Serial Number</label>
                  <input
                    type="text"
                    placeholder="SN-XXXX"
                    value={newGearForm.serialNumber}
                    onChange={(e) => setNewGearForm({ ...newGearForm, serialNumber: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl font-mono ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Lokasi Simpan</label>
                  <input
                    type="text"
                    placeholder="Dry Cabinet A1 / Set 1"
                    value={newGearForm.location}
                    onChange={(e) => setNewGearForm({ ...newGearForm, location: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  />
                </div>
              </div>

              {(newGearForm.category === 'camera' || newGearForm.category === 'lighting') && (
                <div>
                  <label className="block mb-1 font-semibold">Level Baterai ({newGearForm.batteryLevel}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newGearForm.batteryLevel}
                    onChange={(e) => setNewGearForm({ ...newGearForm, batteryLevel: Number(e.target.value) })}
                    className="w-full accent-lime-400"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 font-semibold">Catatan Kondisi</label>
                <input
                  type="text"
                  placeholder="Kondisi optik, kelengkapan kabel, dll"
                  value={newGearForm.notes}
                  onChange={(e) => setNewGearForm({ ...newGearForm, notes: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddGearModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-300 dark:border-white/10 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-lime-300 text-zinc-950 font-bold cursor-pointer"
                >
                  Simpan Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STUDIO EXPENSE ================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`p-6 rounded-3xl border w-full max-w-md space-y-4 ${cardBg}`}>
            <h3 className="font-bold text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-500" />
              <span>Catat Pengeluaran Kas Studio</span>
            </h3>

            <form onSubmit={handleAddNewExpense} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Deskripsi Pengeluaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Honor Retoucher freelance, cetak canvas..."
                  value={newExpenseForm.title}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, title: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Kategori</label>
                  <select
                    value={newExpenseForm.category}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, category: e.target.value as any })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  >
                    <option value="freelance">Honor Tim / Freelance</option>
                    <option value="equipment">Alat & Maintenance</option>
                    <option value="operational">Operasional / Listrik</option>
                    <option value="printing">Biaya Cetak Lab</option>
                    <option value="marketing">Marketing / Promosi</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="5000"
                    value={newExpenseForm.amount}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 rounded-xl font-mono ${inputBg}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Tanggal</label>
                  <input
                    type="date"
                    value={newExpenseForm.date}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, date: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Dibayar Oleh</label>
                  <input
                    type="text"
                    value={newExpenseForm.paidBy}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, paidBy: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Catatan / Bukti Bon</label>
                <input
                  type="text"
                  placeholder="No invoice vendor / keterangan tambahan..."
                  value={newExpenseForm.notes}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, notes: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl ${inputBg}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-300 dark:border-white/10 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold cursor-pointer"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
