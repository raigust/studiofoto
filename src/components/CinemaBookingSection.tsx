import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Lock,
  Hourglass,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Booking,
  DaySchedule,
  ServicePackage,
  TimeSlot,
  ServiceCategory,
} from '../types';
import {
  getComputedSlotsForDate,
  sounds,
  getTodayDateString,
  formatReadableDate,
  parseDateString,
} from '../utils/storage';
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
  // Real-time calendar date detection: reads actual system calendar right now
  const todayStr = useMemo(() => getTodayDateString(0), []);

  const upcomingDays = useMemo(() => {
    const list: {
      dateString: string;
      dayName: string;
      dayNumber: string;
      monthName: string;
      isToday: boolean;
      isTomorrow: boolean;
    }[] = [];

    const now = new Date();
    // Midnight normalized for date additions
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

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
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return list;
  }, [todayStr]);

  // Selected date defaults to TODAY in real-time
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString(0));
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>('11:00');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    preselectedCategory
      ? SERVICE_PACKAGES.find((p) => p.category === preselectedCategory)?.id || SERVICE_PACKAGES[0].id
      : SERVICE_PACKAGES[0].id
  );

  // Safety watchdog: Past dates can NEVER be selected
  useEffect(() => {
    if (selectedDate < todayStr) {
      setSelectedDate(todayStr);
    }
  }, [selectedDate, todayStr]);

  const { slots, dayInfo, isFullyBookedOrClosed, activeApprovedCount } = useMemo(() => {
    return getComputedSlotsForDate(selectedDate, bookings, daySchedules);
  }, [selectedDate, bookings, daySchedules]);

  const selectedPackage = useMemo(() => {
    return SERVICE_PACKAGES.find((p) => p.id === selectedPackageId) || SERVICE_PACKAGES[0];
  }, [selectedPackageId]);

  const currentSelectedSlot = useMemo(() => {
    if (!selectedSlotTime) return null;
    return slots.find((s) => s.time === selectedSlotTime && s.status === 'available') || null;
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
    return formatReadableDate(selectedDate);
  }, [selectedDate]);

  const readableToday = useMemo(() => {
    return formatReadableDate(todayStr);
  }, [todayStr]);

  const isSelectedDateInUpcoming = useMemo(() => {
    return upcomingDays.some((d) => d.dateString === selectedDate);
  }, [upcomingDays, selectedDate]);

  return (
    <section id="booking" className="py-20 sm:py-28 bg-[#0a0a0c] border-t border-white/10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Real-time calendar indicator badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Kalender Real-time Aktif</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>Hari ini: <strong className="text-white font-semibold">{readableToday}</strong></span>
          </div>
        </div>

        {/* Section Header */}
        <div className="space-y-4 mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            JADWAL & LIVE SLOT
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-white">
                Pilih tanggal & slot sesi Anda.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl font-normal">
                Visual slot real-time sinkron dengan kalender hari ini. Tanggal yang telah berlalu otomatis dinonaktifkan.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Date Selector Strip */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="font-semibold text-white tracking-wider">1. TENTUKAN TANGGAL SESI</span>
              <span className="text-[11px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                Mulai Hari Ini ({upcomingDays.length} Hari)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Native Calendar Picker with min={todayStr} */}
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1a1a20] border border-white/10 hover:border-white/20 text-xs text-zinc-300 cursor-pointer transition-colors shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span>Pilih di Kalender</span>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    if (e.target.value < todayStr) {
                      setSelectedDate(todayStr);
                      return;
                    }
                    sounds.playSeatClickSound();
                    setSelectedDate(e.target.value);
                    setSelectedSlotTime(null);
                  }}
                  className="sr-only"
                />
              </label>

              {selectedDate !== todayStr && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playSeatClickSound();
                    setSelectedDate(todayStr);
                    setSelectedSlotTime(null);
                  }}
                  className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition-colors cursor-pointer"
                  title="Kembali ke Hari Ini"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Hari Ini</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {/* If user picked custom date beyond upcomingDays */}
            {!isSelectedDateInUpcoming && (
              <button
                type="button"
                className="relative flex flex-col items-center justify-between min-w-[84px] sm:min-w-[92px] h-[86px] p-2 rounded-2xl border transition-all cursor-pointer shrink-0 bg-white text-black border-white shadow-lg"
              >
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500 text-white">
                  PILIHAN ANDA
                </span>
                <span className="text-xl font-bold tabular-nums text-black">
                  {selectedDate.split('-')[2]}
                </span>
                <span className="text-[10px] font-mono uppercase text-zinc-700">
                  {formatReadableDate(selectedDate).split(' ')[1]}
                </span>
              </button>
            )}

            {upcomingDays.map((item) => {
              const isSelected = selectedDate === item.dateString;
              const dateMeta = daySchedules[item.dateString];
              const isClosed = dateMeta?.isClosed;

              return (
                <button
                  key={item.dateString}
                  type="button"
                  onClick={() => {
                    sounds.playSeatClickSound();
                    setSelectedDate(item.dateString);
                    setSelectedSlotTime(null);
                  }}
                  className={`relative flex flex-col items-center justify-between min-w-[78px] sm:min-w-[88px] h-[86px] p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-xl scale-[1.02]'
                      : isClosed
                      ? 'bg-[#111114] border-white/5 text-zinc-600 opacity-40'
                      : 'bg-[#121215] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {/* Badge Hari Ini / Besok */}
                  {item.isToday && (
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      HARI INI
                    </span>
                  )}
                  {item.isTomorrow && (
                    <span className={`text-[8px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-zinc-800 text-white' : 'bg-white/10 text-zinc-300'
                    }`}>
                      BESOK
                    </span>
                  )}
                  {!item.isToday && !item.isTomorrow && (
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                      {item.dayName}
                    </span>
                  )}

                  <span className={`text-xl font-bold tabular-nums ${isSelected ? 'text-black' : 'text-white'}`}>
                    {item.dayNumber}
                  </span>
                  <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                    {isClosed ? 'Tutup' : item.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Package Selector */}
        <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-[#121215] border border-white/10">
          <div className="flex items-center justify-between mb-4 text-xs font-mono text-zinc-400">
            <span>2. PILIH PAKET SESI</span>
            <span className="text-zinc-500">DP 50%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {SERVICE_PACKAGES.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    sounds.playSeatClickSound();
                    setSelectedPackageId(pkg.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 border-white text-white shadow-sm'
                      : 'bg-[#0e0e11] border-white/5 hover:border-white/15 text-zinc-300'
                  }`}
                >
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    {pkg.category}
                  </p>
                  <p className="text-xs font-bold text-white mt-1 leading-snug line-clamp-1">
                    {pkg.name}
                  </p>
                  <p className="text-xs font-mono font-semibold text-white mt-2 tabular-nums">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Cinema Theater Screen & Slot Grid */}
        <div className="rounded-3xl bg-[#111114] border border-white/10 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          
          {/* Subtle Stage Bar */}
          <div className="relative max-w-md mx-auto mb-8 text-center">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 mt-2.5">
              RUANG PEMOTRETAN PRIVAT DIAFÉRA
            </p>
          </div>

          {/* Admin Schedule Alerts */}
          {dayInfo.isClosed ? (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-300">Studio Ditutup oleh Admin pada Tanggal Ini</p>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  {dayInfo.closeReason || 'Jadwal hari ini sedang dinonaktifkan untuk agenda khusus studio.'}
                </p>
              </div>
            </div>
          ) : dayInfo.maxCapacity > 0 && activeApprovedCount >= dayInfo.maxCapacity ? (
            <div className="mb-6 p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">
                  Batas Kuota Eksklusif Terpenuhi ({activeApprovedCount}/{dayInfo.maxCapacity} Customer)
                </p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Hari ini telah terisi penuh demi menjaga privasi dan ketenangan sesi.
                </p>
              </div>
            </div>
          ) : null}

          {/* Slots Grid */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlotTime === slot.time && slot.status === 'available';
                const isAvailable = slot.status === 'available';
                const isBooked = slot.status === 'booked';
                const isPending = slot.status === 'pending';
                const isBlocked = slot.status === 'blocked';

                return (
                  <div
                    key={slot.id}
                    onClick={() => isAvailable && handleSelectSlot(slot)}
                    className={`relative rounded-2xl border p-4 transition-all flex flex-col justify-between select-none ${
                      isAvailable
                        ? isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md cursor-pointer'
                          : 'bg-[#15151a] border-white/10 hover:border-white/20 text-zinc-200 cursor-pointer'
                        : isBooked
                        ? 'bg-[#0f0f12] border-white/5 text-zinc-600 cursor-not-allowed opacity-60'
                        : isPending
                        ? 'bg-[#0f0f12] border-amber-500/20 text-amber-400/80 cursor-not-allowed opacity-75'
                        : 'bg-[#0f0f12] border-white/5 text-zinc-600 cursor-not-allowed opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase mb-1.5">
                      <span className={isSelected ? 'text-blue-100 font-semibold' : 'text-zinc-500'}>
                        {slot.period}
                      </span>

                      {isAvailable && (
                        isSelected ? (
                          <span className="flex items-center gap-1 font-bold text-white text-[10px]">
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
                        <span className="flex items-center gap-1 text-rose-400 text-[10px]">
                          <Lock className="w-3 h-3" />
                          TERISI
                        </span>
                      )}

                      {isPending && (
                        <span className="flex items-center gap-1 text-amber-400 text-[10px]">
                          <Hourglass className="w-3 h-3 animate-spin" />
                          REVIEW
                        </span>
                      )}

                      {isBlocked && (
                        <span className="text-zinc-600 text-[10px]">
                          DITUTUP
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <div className="flex items-baseline gap-2">
                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                        <span className={`text-lg font-bold font-mono tabular-nums ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {slot.time}
                        </span>
                        <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-zinc-500'}`}>
                          s/d {slot.endTime}
                        </span>
                      </div>
                    </div>

                    <div className={`pt-2 border-t text-[11px] ${isSelected ? 'border-blue-400/30 text-blue-100' : 'border-white/5 text-zinc-500'}`}>
                      {isBooked ? (
                        <span>Slot Telah Dibooking</span>
                      ) : isPending ? (
                        <span>Menunggu Konfirmasi</span>
                      ) : isBlocked ? (
                        <span>{slot.blockReason || 'Jadwal Ditutup'}</span>
                      ) : (
                        <span>{isSelected ? '✓ Terpilih' : 'Klik untuk memilih'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-5 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Tersedia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Dipilih</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Terisi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span>Ditutup</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Selection Floating Bar */}
        <div className="mt-6 rounded-2xl bg-[#121215] border border-white/10 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full md:w-auto">
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Jadwal Sesi:</p>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {currentSelectedSlot ? (
                  <span>
                    {readableSelectedDate} &bull; <span className="text-blue-400 font-mono">{currentSelectedSlot.label}</span>
                  </span>
                ) : (
                  <span className="text-zinc-500 font-normal">Pilih slot waktu di atas</span>
                )}
              </p>
            </div>

            <div className="hidden sm:block h-6 w-px bg-white/10" />

            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Layanan:</p>
              <p className="text-xs sm:text-sm font-medium text-zinc-200">
                {selectedPackage.name}
              </p>
            </div>

            <div className="hidden sm:block h-6 w-px bg-white/10" />

            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Total Biaya:</p>
              <p className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">
                Rp {selectedPackage.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!currentSelectedSlot}
            onClick={handleProceed}
            className={`w-full md:w-auto px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
              currentSelectedSlot
                ? 'bg-white hover:bg-zinc-200 text-black'
                : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>Isi Data Reservasi</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
