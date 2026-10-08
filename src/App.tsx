/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Booking,
  DaySchedule,
  PortfolioItem,
  AdminNotification,
  StudioSettings,
  TimeSlot,
  ServicePackage,
  ServiceCategory,
} from './types';
import {
  getStoredBookings,
  saveStoredBookings,
  getPublicBookingsAvailability,
  getStoredPortfolio,
  saveStoredPortfolio,
  getStoredDaySchedules,
  saveStoredDaySchedules,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredSettings,
  saveStoredSettings,
  getAdminAuthStatus,
  setAdminAuthStatus,
  verifyAdminSession,
  clearAdminSession,
  refreshAdminSession,
  sounds,
} from './utils/storage';
import { SERVICE_PACKAGES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CinemaBookingSection } from './components/CinemaBookingSection';
import { BookingFormModal } from './components/BookingFormModal';
import { PortfolioSection } from './components/PortfolioSection';
import { ServicesPricingSection } from './components/ServicesPricingSection';
import { CheckBookingModal } from './components/CheckBookingModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminBentoDashboard } from './components/AdminBentoDashboard';
import { Footer } from './components/Footer';
import { Bell, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'portfolio' | 'services'>('home');
  
  // Gated Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => verifyAdminSession());
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    const hash = window.location.hash.toLowerCase();
    return (hash === '#admin' || hash === '#/admin') && verifyAdminSession();
  });

  // SENSITIVE ADMIN DATA: ISOLATED AND LOADED ONLY IF AUTHENTICATED
  // If user is unauthenticated, sensitive bookings & notifications are strictly empty in client memory!
  const [bookings, setBookings] = useState<Booking[]>(() => {
    return verifyAdminSession() ? getStoredBookings() : [];
  });
  const [publicSlotBookings, setPublicSlotBookings] = useState<Booking[]>(getPublicBookingsAvailability);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(getStoredPortfolio);
  const [daySchedules, setDaySchedules] = useState<Record<string, DaySchedule>>(getStoredDaySchedules);
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    return verifyAdminSession() ? getStoredNotifications() : [];
  });
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(getStoredSettings);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>('2026-10-08');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage>(SERVICE_PACKAGES[0]);

  const [checkBookingModalOpen, setCheckBookingModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);

  const [preselectedCategory, setPreselectedCategory] = useState<ServiceCategory | undefined>(undefined);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string } | null>(null);

  // Security Middleware: Hydrate data upon valid authentication, wipe upon logout
  useEffect(() => {
    if (isAdminLoggedIn) {
      setBookings(getStoredBookings());
      setNotifications(getStoredNotifications());
      refreshAdminSession();
    } else {
      setBookings([]);
      setNotifications([]);
      clearAdminSession();
    }
  }, [isAdminLoggedIn]);

  // Session Timeout Watchdog (Checks session token every 10 seconds)
  useEffect(() => {
    if (!isAdminLoggedIn) return;
    const interval = setInterval(() => {
      if (!verifyAdminSession()) {
        setIsAdminLoggedIn(false);
        setIsAdminView(false);
        setBookings([]);
        setNotifications([]);
        window.location.hash = '';
        setActiveToast({
          id: 'session-timeout',
          title: 'Sesi Admin Berakhir',
          message: 'Sesi login Anda telah kedaluwarsa demi keamanan. Silakan login kembali.',
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isAdminLoggedIn]);

  // Security Gatekeeper: Check URL hash/path for private admin endpoint
  const checkAdminUrl = useCallback(() => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();

    if (hash === '#admin' || hash === '#/admin' || path === '/admin') {
      if (verifyAdminSession()) {
        setIsAdminLoggedIn(true);
        setIsAdminView(true);
        setBookings(getStoredBookings());
        setNotifications(getStoredNotifications());
      } else {
        // Block access, keep data wiped, open authentication challenge modal
        setIsAdminLoggedIn(false);
        setIsAdminView(false);
        setBookings([]);
        setNotifications([]);
        setAdminLoginModalOpen(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else {
      // Normal customer view
      setIsAdminView(false);
    }
  }, []);

  useEffect(() => {
    checkAdminUrl();
    window.addEventListener('hashchange', checkAdminUrl);
    window.addEventListener('popstate', checkAdminUrl);
    return () => {
      window.removeEventListener('hashchange', checkAdminUrl);
      window.removeEventListener('popstate', checkAdminUrl);
    };
  }, [checkAdminUrl]);

  // Secret admin trigger
  const handleSecretAdminTrigger = () => {
    window.location.hash = '#admin';
    if (verifyAdminSession()) {
      setIsAdminLoggedIn(true);
      setIsAdminView(true);
      setBookings(getStoredBookings());
      setNotifications(getStoredNotifications());
    } else {
      setIsAdminLoggedIn(false);
      setIsAdminView(false);
      setBookings([]);
      setNotifications([]);
      setAdminLoginModalOpen(true);
    }
  };

  // Persist state updates (bookings saved ONLY when authenticated and populated)
  useEffect(() => {
    if (isAdminLoggedIn && bookings.length > 0) {
      saveStoredBookings(bookings);
    }
  }, [bookings, isAdminLoggedIn]);

  useEffect(() => {
    saveStoredPortfolio(portfolioItems);
  }, [portfolioItems]);

  useEffect(() => {
    saveStoredDaySchedules(daySchedules);
  }, [daySchedules]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveStoredSettings(studioSettings);
  }, [studioSettings]);

  useEffect(() => {
    setAdminAuthStatus(isAdminLoggedIn);
  }, [isAdminLoggedIn]);

  // Trigger simulated incoming booking
  const handleTriggerSimulatedBooking = () => {
    sounds.playNotificationChime();

    const sampleCustomers = [
      { name: 'Nabila Syakira', phone: '081298811223', pkg: SERVICE_PACKAGES[0], time: '11:00', label: '11:00 - 12:30 WIB' },
      { name: 'Fikri Haikal & Tim', phone: '085712399887', pkg: SERVICE_PACKAGES[2], time: '13:30', label: '13:30 - 15:00 WIB' },
      { name: 'Dr. Vania Anindita', phone: '081388776655', pkg: SERVICE_PACKAGES[4], time: '17:30', label: '17:30 - 19:00 WIB' },
    ];
    const pick = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const targetDate = '2026-10-10';
    const newId = `DFS-202610-${String(Math.floor(Math.random() * 900) + 100)}`;

    const newBooking: Booking = {
      id: newId,
      customerName: pick.name,
      customerPhone: pick.phone,
      category: pick.pkg.category,
      packageId: pick.pkg.id,
      packageName: pick.pkg.name,
      date: targetDate,
      timeSlot: pick.label,
      timeSlotId: pick.time,
      numberOfPeople: 2,
      notes: 'Simulasi booking otomatis masuk melalui web.',
      totalPrice: pick.pkg.price,
      dpAmount: Math.round(pick.pkg.price * 0.5),
      paymentStatus: 'DP_PAID',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      whatsappNotified: false,
    };

    setBookings((prev) => [newBooking, ...prev]);

    const newNotification: AdminNotification = {
      id: `notif-${Date.now()}`,
      type: 'NEW_BOOKING',
      title: 'Pengajuan Booking Baru Masuk!',
      message: `${pick.name} baru saja mengajukan booking ${pick.pkg.name} untuk tanggal ${targetDate}.`,
      timestamp: new Date().toISOString(),
      read: false,
      bookingId: newId,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    setActiveToast({
      id: newNotification.id,
      title: newNotification.title,
      message: newNotification.message,
    });

    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotification.id ? null : current));
    }, 6000);
  };

  // Customer submit new booking
  const handleSubmitBooking = (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'whatsappNotified' | 'status'>
  ): Booking => {
    const newId = `DFS-202610-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      whatsappNotified: false,
    };

    // Always persist to secure storage
    const currentStored = getStoredBookings();
    const updatedBookings = [newBooking, ...currentStored];
    saveStoredBookings(updatedBookings);

    // Update public sanitized slot availability
    setPublicSlotBookings(getPublicBookingsAvailability());

    // If admin is active in session, update live state and notification
    if (isAdminLoggedIn) {
      setBookings(updatedBookings);
    }

    const newNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      type: 'NEW_BOOKING',
      title: 'Pengajuan Booking Baru Masuk!',
      message: `${bookingData.customerName} mengajukan booking ${bookingData.packageName} (${bookingData.date} - ${bookingData.timeSlot}).`,
      timestamp: new Date().toISOString(),
      read: false,
      bookingId: newId,
    };

    const currentNotifs = getStoredNotifications();
    const updatedNotifs = [newNotif, ...currentNotifs];
    saveStoredNotifications(updatedNotifs);

    if (isAdminLoggedIn) {
      setNotifications(updatedNotifs);
      setActiveToast({
        id: newNotif.id,
        title: newNotif.title,
        message: newNotif.message,
      });
    }

    return newBooking;
  };

  // Admin approves booking
  const handleApproveBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'APPROVED',
            approvedAt: new Date().toISOString(),
            whatsappNotified: true,
          };
        }
        return b;
      })
    );
  };

  // Admin rejects booking
  const handleRejectBooking = (bookingId: string, reason: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'REJECTED',
            rejectionReason: reason,
          };
        }
        return b;
      })
    );
  };

  // Admin updates payment status
  const handleUpdatePaymentStatus = (bookingId: string, newStatus: Booking['paymentStatus']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, paymentStatus: newStatus } : b))
    );
  };

  // Admin updates day schedule
  const handleUpdateDaySchedule = (date: string, updates: Partial<DaySchedule>) => {
    setDaySchedules((prev) => {
      const existing = prev[date] || {
        date,
        isClosed: false,
        maxCapacity: 5,
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          ...updates,
        },
      };
    });
  };

  // Portfolio CRUD
  const handleAddPortfolio = (item: Omit<PortfolioItem, 'id'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: `port-${Date.now()}`,
    };
    setPortfolioItems((prev) => [newItem, ...prev]);
  };

  const handleUpdatePortfolio = (id: string, updates: Partial<PortfolioItem>) => {
    setPortfolioItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const onDeletePortfolio = (id: string) => {
    setPortfolioItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateBookingDelivery = (
    bookingId: string,
    deliveryStatus?: Booking['deliveryStatus'],
    googleDriveUrl?: string
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            ...(deliveryStatus ? { deliveryStatus } : {}),
            ...(googleDriveUrl !== undefined ? { googleDriveUrl } : {}),
          };
        }
        return b;
      })
    );
  };

  const handleAddManualBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#f4f4f6] flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* 
        ADMIN VIEW (Rendered ONLY at private endpoint /#admin or /admin)
        Regular users do NOT see this.
      */}
      {isAdminView && isAdminLoggedIn ? (
        <AdminBentoDashboard
          bookings={bookings}
          daySchedules={daySchedules}
          portfolioItems={portfolioItems}
          studioSettings={studioSettings}
          onApproveBooking={handleApproveBooking}
          onRejectBooking={handleRejectBooking}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onUpdateDaySchedule={handleUpdateDaySchedule}
          onAddPortfolio={handleAddPortfolio}
          onUpdatePortfolio={handleUpdatePortfolio}
          onDeletePortfolio={onDeletePortfolio}
          onUpdateSettings={setStudioSettings}
          onLogout={() => {
            setIsAdminLoggedIn(false);
            setIsAdminView(false);
            window.location.hash = '';
          }}
          onBackToCustomerSite={() => {
            setIsAdminView(false);
            window.location.hash = '';
          }}
          onTriggerSimulatedBooking={handleTriggerSimulatedBooking}
          onAddManualBooking={handleAddManualBooking}
          onUpdateBookingDelivery={handleUpdateBookingDelivery}
        />
      ) : (
        /* PUBLIC CUSTOMER VIEW */
        <>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCheckBooking={() => setCheckBookingModalOpen(true)}
            onSecretAdminTrigger={handleSecretAdminTrigger}
          />

          <main className="flex-1">
            {activeTab === 'home' && (
              <>
                <HeroSection
                  onGoToBooking={() => {
                    const el = document.getElementById('booking');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onGoToPortfolio={() => {
                    const el = document.getElementById('portfolio');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* Cinema Booking Section */}
                <CinemaBookingSection
                  bookings={bookings}
                  daySchedules={daySchedules}
                  preselectedCategory={preselectedCategory}
                  onSelectSlotAndProceed={(date, slot, pkg) => {
                    setSelectedBookingDate(date);
                    setSelectedSlot(slot);
                    setSelectedPackage(pkg);
                    setBookingModalOpen(true);
                  }}
                />

                {/* Portfolio Section */}
                <PortfolioSection
                  portfolioItems={portfolioItems}
                  isAdmin={isAdminLoggedIn}
                  onUpdatePortfolioPhoto={(id, newUrl) =>
                    handleUpdatePortfolio(id, { imageUrl: newUrl })
                  }
                  onSelectCategoryForBooking={(cat) => {
                    setPreselectedCategory(cat);
                  }}
                />

                {/* Services & Pricing Tier Section */}
                <ServicesPricingSection
                  onSelectCategoryAndScroll={(cat) => {
                    setPreselectedCategory(cat);
                    const el = document.getElementById('booking');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </>
            )}

            {activeTab === 'booking' && (
              <CinemaBookingSection
                bookings={bookings}
                daySchedules={daySchedules}
                preselectedCategory={preselectedCategory}
                onSelectSlotAndProceed={(date, slot, pkg) => {
                  setSelectedBookingDate(date);
                  setSelectedSlot(slot);
                  setSelectedPackage(pkg);
                  setBookingModalOpen(true);
                }}
              />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioSection
                portfolioItems={portfolioItems}
                isAdmin={isAdminLoggedIn}
                onUpdatePortfolioPhoto={(id, newUrl) =>
                  handleUpdatePortfolio(id, { imageUrl: newUrl })
                }
                onSelectCategoryForBooking={(cat) => {
                  setPreselectedCategory(cat);
                  setActiveTab('booking');
                }}
              />
            )}

            {activeTab === 'services' && (
              <ServicesPricingSection
                onSelectCategoryAndScroll={(cat) => {
                  setPreselectedCategory(cat);
                  setActiveTab('booking');
                }}
              />
            )}
          </main>

          <Footer
            studioSettings={studioSettings}
            onSecretAdminTrigger={handleSecretAdminTrigger}
          />
        </>
      )}

      {/* Floating Incoming Notification Alert Toast (shown if admin is in session) */}
      <AnimatePresence>
        {isAdminLoggedIn && activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full rounded-2xl bg-zinc-950/90 border border-orange-500/40 p-4 shadow-2xl backdrop-blur-2xl flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
              <Bell className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-white">{activeToast.title}</p>
              <p className="text-zinc-400 mt-0.5 leading-snug font-light">{activeToast.message}</p>
              <button
                onClick={() => {
                  setActiveToast(null);
                  setIsAdminView(true);
                  window.location.hash = '#admin';
                }}
                className="mt-2 text-orange-400 font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Bento Admin</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Booking Form Modal */}
      <BookingFormModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        date={selectedBookingDate}
        slot={selectedSlot}
        servicePackage={selectedPackage}
        studioSettings={studioSettings}
        onSubmitBooking={handleSubmitBooking}
      />

      {/* Check Booking Status Modal (Customer Facing) */}
      <CheckBookingModal
        isOpen={checkBookingModalOpen}
        onClose={() => setCheckBookingModalOpen(false)}
        bookings={bookings}
        studioSettings={studioSettings}
      />

      {/* Private Admin Login Modal (Triggered by /#admin or secret shortcut) */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => {
          setAdminLoginModalOpen(false);
          if (!isAdminLoggedIn) {
            window.location.hash = '';
          }
        }}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminView(true);
          window.location.hash = '#admin';
        }}
      />

    </div>
  );
}
