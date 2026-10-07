import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Lock,
  Hourglass,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Booking,
  DaySchedule,
  ServicePackage,
  TimeSlot,
  ServiceCategory,
} from '../types';
import { getComputedSlotsForDate, sounds } from '../utils/storage';
import { SERVICE_PACKAGES } from '../data/mockData';

interface CinemaBookingSectionProps {
  bookings: Booking[];
  daySchedules: Record<string, DaySchedule>;
  onSelectSlotAndProceed: (date: string, slot: TimeSlot, selectedPackage: ServicePackage) => void;
  preselectedCategory?: ServiceCategory;
}

export const CinemaBookingSection: React.FC<CinemaBookingSectionProps> = ({
  bookings,
  daySchedules,
  onSelectSlotAndProceed,
  preselectedCategory,
}) => {
  const baseDate = new Date(2026, 9, 7); // Oct 7, 2026

  const upcomingDays = useMemo(() => {
    const list: { dateString: string; dayName: string; dayNumber: string; monthName: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;

      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNumber = d.getDate().toString();
      const monthName = d.toLocaleDateString('id-ID', { month: 'short' });

      list.push({
        dateString,
        dayName,
        dayNumber,
        monthName,
      });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-08');
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>('11:00');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    preselectedCategory
      ? SERVICE_PACKAGES.find((p) => p.category === preselectedCategory)?.id || SERVICE_PACKAGES[0].id
      : SERVICE_PACKAGES[0].id
  );

  const { slots, dayInfo, isFullyBookedOrClosed, activeApprovedCount } = useMemo(() => {
    return getComputedSlotsForDate(selectedDate, bookings, daySchedules);
  }, [selectedDate, bookings, daySchedules]);

  const selectedPackage = useMemo(() => {
    return SERVICE_PACKAGES.find((p) => p.id === selectedPackageId) || SERVICE_PACKAGES[0];
  }, [selectedPackageId]);

  const currentSelectedSlot = useMemo(() => {
    return slots.find((s) => s.time === selectedSlotTime && s.status === 'available');
  }, [slots, selectedSlotTime]);

  const handleSelectSlot = (slot: TimeSlot) => {
    if (slot.status !== 'available') return;
    sounds.playSeatClickSound();
    setSelectedSlotTime(slot.time);
  };

  const handleProceed = () => {
    if (!currentSelectedSlot) return;
    sounds.playSeatClickSound();
    onSelectSlotAndProceed(selectedDate, currentSelectedSlot, selectedPackage);
  };

  const readableSelectedDate = useMemo(() => {
    const d = new Date(selectedDate);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <section id="booking" className="py-16 sm:py-24 relative overflow-hidden bg-[#070709] border-t border-white/5">
      {/* Delicate background ambient spotlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-orange-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>CINEMA-STYLE RESERVATION ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
            Pilih Tanggal & Kursi Sesi Anda
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 font-light">
            Transparansi penuh seperti di bioskop. Pilih slot yang masih kosong, 
            pantau status terisi secara real-time, dan nikmati approval instan.
          </p>
        </motion.div>

        {/* 1. Date Selector Strip (Minimalist Glass Cards) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3.5 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">1. Tentukan Tanggal Sesi</span>
            <span className="font-mono text-zinc-500">12 Hari Ke Depan</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {upcomingDays.map((item) => {
              const isSelected = selectedDate === item.dateString;
              const dateMeta = daySchedules[item.dateString];
              const isClosed = dateMeta?.isClosed;
              const isCapacity1 = dateMeta?.maxCapacity === 1;

              return (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={item.dateString}
                  onClick={() => {
                    sounds.playSeatClickSound();
                    setSelectedDate(item.dateString);
                    setSelectedSlotTime(null);
                  }}
                  className={`flex flex-col items-center justify-between min-w-[80px] sm:min-w-[90px] h-24 p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-b from-white/15 to-white/5 border-white/30 text-white shadow-[0_4px_24px_rgba(255,255,255,0.08)]'
                      : isClosed
                      ? 'bg-zinc-950/40 border-white/5 text-zinc-600 opacity-50'
                      : 'bg-zinc-900/40 border-white/8 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400">
                    {item.dayName}
                  </span>
                  <span className={`text-xl font-semibold tabular-nums ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                    {item.dayNumber}
                  </span>
                  <div className="w-full">
                    {isClosed ? (
                      <span className="text-[10px] text-rose-400 font-mono block truncate">Tutup</span>
                    ) : isCapacity1 ? (
                      <span className="text-[10px] text-orange-400 font-mono block truncate">Eksklusif</span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono block truncate uppercase">
                        {item.monthName}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 2. Package Selector (Apple Minimalist Glass Cards) */}
        <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-zinc-950/60 border border-white/8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">2. Pilih Layanan Sesi Foto</span>
            <span className="text-orange-400 font-mono">DP: 50%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {SERVICE_PACKAGES.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              return (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  key={pkg.id}
                  onClick={() => {
                    sounds.playSeatClickSound();
                    setSelectedPackageId(pkg.id);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white/[0.08] border-orange-500/60 shadow-[0_0_24px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/30'
                      : 'bg-zinc-900/30 border-white/5 hover:border-white/15 text-zinc-300 hover:bg-zinc-900/50'
                  }`}
                >
                  <p className="text-[10px] font-mono uppercase tracking-wider text-orange-400/90 font-medium">
                    {pkg.category}
                  </p>
                  <p className={`text-sm font-semibold mt-1 leading-snug line-clamp-1 ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                    {pkg.name}
                  </p>
                  <p className="text-xs font-mono font-bold text-white mt-2 tabular-nums">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-light">
                    {pkg.durationMinutes} mnt &bull; maks {pkg.maxPeople} org
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 3. The Cinema Theater Curve & Glass Seat Grid */}
        <div className="rounded-3xl bg-zinc-950/80 border border-white/10 p-6 sm:p-10 relative overflow-hidden backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          
          {/* Curved Cinema Screen Representation */}
          <div className="relative max-w-xl mx-auto mb-10 text-center">
            {/* Luminous light spill */}
            <div className="w-3/4 h-12 mx-auto bg-gradient-to-b from-white/15 via-white/5 to-transparent blur-xl pointer-events-none" />
            
            <div className="relative">
              <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
            </div>

            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 mt-3">
              &bull; STUDIO BACKDROP & FLOATING LIGHTING RIG &bull;
            </p>
            <p className="text-xs text-zinc-500 mt-0.5 font-light">
              Area pemotretan privat terfokus ke arah sini
            </p>
          </div>

          {/* Admin Schedule Alerts (Closed / 1 Customer Limit) */}
          {dayInfo.isClosed ? (
            <div className="mb-8 p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-300">Studio Ditutup oleh Admin pada Tanggal Ini</p>
                <p className="text-xs text-rose-300/80 mt-0.5 font-light">
                  {dayInfo.closeReason || 'Jadwal hari ini sedang dinonaktifkan untuk agenda khusus/pemeliharaan studio.'}
                </p>
              </div>
            </div>
          ) : dayInfo.maxCapacity > 0 && activeApprovedCount >= dayInfo.maxCapacity ? (
            <div className="mb-8 p-4 rounded-2xl bg-orange-950/30 border border-orange-800/40 text-orange-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-300">
                  Batas Kuota Eksklusif Terpenuhi ({activeApprovedCount}/{dayInfo.maxCapacity} Customer)
                </p>
                <p className="text-xs text-orange-300/80 mt-0.5 font-light">
                  Admin membatasi hari ini hanya untuk 1 customer prioritas. Sisa slot terkunci demi privasi penuh.
                </p>
              </div>
            </div>
          ) : null}

          {/* Cinema Seats/Slots Grid */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <span className="text-xs font-mono text-zinc-400">
                Jadwal Hari: <span className="text-white font-medium">{readableSelectedDate}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {slots.map((slot) => {
                const isSelected = selectedSlotTime === slot.time && slot.status === 'available';
                const isAvailable = slot.status === 'available';
                const isBooked = slot.status === 'booked';
                const isPending = slot.status === 'pending';
                const isBlocked = slot.status === 'blocked';

                return (
                  <motion.div
                    whileHover={isAvailable ? { y: -2 } : {}}
                    whileTap={isAvailable ? { scale: 0.98 } : {}}
                    key={slot.id}
                    onClick={() => isAvailable && handleSelectSlot(slot)}
                    className={`relative rounded-2xl border p-4 transition-all flex flex-col justify-between select-none ${
                      isAvailable
                        ? isSelected
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-black border-transparent shadow-[0_8px_32px_rgba(249,115,22,0.35)] cursor-pointer'
                          : 'bg-zinc-900/50 border-white/8 hover:border-white/20 hover:bg-zinc-900/80 text-zinc-200 cursor-pointer shadow-sm'
                        : isBooked
                        ? 'bg-zinc-950/70 border-white/5 text-zinc-600 cursor-not-allowed opacity-75'
                        : isPending
                        ? 'bg-zinc-950/70 border-amber-500/20 text-amber-400/80 cursor-not-allowed opacity-85'
                        : 'bg-zinc-950/50 border-white/5 text-zinc-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {/* Period header */}
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase mb-2">
                      <span className={isSelected ? 'text-black/80 font-semibold' : 'text-zinc-500'}>
                        {slot.period}
                      </span>

                      {/* Status Indicator */}
                      {isAvailable && (
                        isSelected ? (
                          <span className="flex items-center gap-1 font-bold text-black text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            DIPILIH
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            TERSEDIA
                          </span>
                        )
                      )}

                      {isBooked && (
                        <span className="flex items-center gap-1 text-rose-400 font-medium text-[10px]">
                          <Lock className="w-3 h-3" />
                          TERISI
                        </span>
                      )}

                      {isPending && (
                        <span className="flex items-center gap-1 text-amber-300 text-[10px]">
                          <Hourglass className="w-3 h-3 animate-spin" />
                          MENUNGGU
                        </span>
                      )}

                      {isBlocked && (
                        <span className="flex items-center gap-1 text-zinc-500 text-[10px]">
                          <Lock className="w-3 h-3" />
                          DITUTUP
                        </span>
                      )}
                    </div>

                    {/* Time Display */}
                    <div className="py-2">
                      <div className="flex items-baseline gap-2">
                        <Clock className={`w-4 h-4 ${isSelected ? 'text-black' : isAvailable ? 'text-zinc-400' : 'text-zinc-600'}`} />
                        <span className={`text-lg font-bold font-mono tabular-nums ${isSelected ? 'text-black' : isAvailable ? 'text-white' : 'text-zinc-500'}`}>
                          {slot.time}
                        </span>
                        <span className={`text-xs ${isSelected ? 'text-black/80 font-mono' : 'text-zinc-500'}`}>
                          s/d {slot.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className={`pt-2 border-t text-[11px] ${isSelected ? 'border-black/20 text-black/80 font-medium' : 'border-white/5 text-zinc-500'}`}>
                      {isBooked && (
                        <span className="text-zinc-400 block truncate">
                          Sesi: {slot.packageName || 'Terkonfirmasi'}
                        </span>
                      )}
                      {isPending && (
                        <span className="text-amber-300/80 block truncate">
                          Review Antrean Admin
                        </span>
                      )}
                      {isBlocked && (
                        <span className="text-zinc-500 block truncate" title={slot.blockReason}>
                          {slot.blockReason || 'Nonaktif Studio'}
                        </span>
                      )}
                      {isAvailable && (
                        <span className={isSelected ? 'text-black font-semibold' : 'text-zinc-400'}>
                          {isSelected ? '✓ Siap Dikonfirmasi' : 'Klik untuk memilih'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Cinema Legend Bar */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-800 border border-white/20" />
                <span>Tersedia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                <span>Dipilih</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-900 border border-rose-500/40 text-rose-400" />
                <span>Terisi (Booked)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500" />
                <span>Menunggu Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-950 border border-zinc-800" />
                <span>Ditutup Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Selection Floating Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl bg-zinc-950/70 border border-white/10 p-4 sm:p-6 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full md:w-auto">
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Jadwal Sesi:</p>
              <p className="text-sm sm:text-base font-semibold text-white">
                {currentSelectedSlot ? (
                  <span>
                    {readableSelectedDate} &bull; <span className="text-orange-400 font-mono">{currentSelectedSlot.label}</span>
                  </span>
                ) : (
                  <span className="text-zinc-500 font-normal">Pilih kursi slot di atas</span>
                )}
              </p>
            </div>

            <div className="hidden sm:block h-8 w-px bg-white/10" />

            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Layanan:</p>
              <p className="text-sm sm:text-base font-medium text-zinc-200">
                {selectedPackage.name}
              </p>
            </div>

            <div className="hidden sm:block h-8 w-px bg-white/10" />

            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Total Biaya:</p>
              <p className="text-sm sm:text-base font-bold font-mono text-white tabular-nums">
                Rp {selectedPackage.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={currentSelectedSlot ? { scale: 1.02 } : {}}
            whileTap={currentSelectedSlot ? { scale: 0.98 } : {}}
            disabled={!currentSelectedSlot}
            onClick={handleProceed}
            className={`w-full md:w-auto px-7 py-3 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
              currentSelectedSlot
                ? 'bg-white hover:bg-zinc-200 text-black shadow-[0_8px_24px_rgba(255,255,255,0.2)]'
                : 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>Lanjut ke Form Booking</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};
