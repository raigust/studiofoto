import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Users,
  FileText,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, ServicePackage, TimeSlot, StudioSettings } from '../types';
import {
  sounds,
  triggerConfetti,
  generateCustomerInquiryWhatsAppUrl,
  formatReadableDate,
} from '../utils/storage';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  slot: TimeSlot | null;
  servicePackage: ServicePackage;
  studioSettings: StudioSettings;
  onSubmitBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'whatsappNotified' | 'status'>) => Booking;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  date,
  slot,
  servicePackage,
  studioSettings,
  onSubmitBooking,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState<number>(servicePackage.maxPeople > 1 ? 2 : 1);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);

  if (!isOpen || !slot) return null;

  const dpAmount = Math.round(servicePackage.price * 0.5);

  const readableDate = formatReadableDate(date);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) {
      errs.customerName = 'Nama pemesan wajib diisi';
    }
    if (!customerPhone.trim()) {
      errs.customerPhone = 'Nomor WhatsApp wajib diisi';
    } else {
      const clean = customerPhone.replace(/\D/g, '');
      if (clean.length < 9) {
        errs.customerPhone = 'Nomor WhatsApp minimal 9 digit';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    sounds.playShutterSound();

    const createdBooking = onSubmitBooking({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      category: servicePackage.category,
      packageId: servicePackage.id,
      packageName: servicePackage.name,
      date,
      timeSlot: slot.label,
      timeSlotId: slot.time,
      numberOfPeople,
      notes: notes.trim() || undefined,
      totalPrice: servicePackage.price,
      dpAmount,
      paymentStatus: 'DP_PAID',
    });

    triggerConfetti();
    setSubmittedBooking(createdBooking);
  };

  const handleModalClose = () => {
    setSubmittedBooking(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-xl rounded-3xl bg-zinc-950/90 border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <h3 className="text-base font-semibold text-white">
              {submittedBooking ? 'Reservasi Terkirim' : 'Form Booking Studio Diafera'}
            </h3>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedBooking ? (
          /* SUCCESS STATE */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.25)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 block mb-1">
                KODE BOOKING ANDA
              </span>
              <p className="text-2xl sm:text-3xl font-semibold font-mono text-white tracking-wide">
                #{submittedBooking.id}
              </p>
              <h3 className="text-xl font-semibold text-white mt-3">
                Pengajuan Sesi Telah Diterima!
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mt-2 font-light leading-relaxed">
                Slot Anda telah masuk ke sistem dan berstatus <strong className="text-blue-400 font-medium">Menunggu Approval Admin</strong>. 
                Pemberitahuan persetujuan resmi akan dikirim langsung ke WhatsApp Anda.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">Pemesan:</span>
                <span className="font-medium text-white">{submittedBooking.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">WhatsApp:</span>
                <span className="font-mono text-zinc-300">{submittedBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">Layanan:</span>
                <span className="text-zinc-200">{submittedBooking.packageName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500">Jadwal:</span>
                <span className="font-medium text-orange-300">{readableDate} ({submittedBooking.timeSlot})</span>
              </div>
              <div className="flex justify-between py-1 font-mono">
                <span className="text-zinc-500">Komitmen DP (50%):</span>
                <span className="font-bold text-white">
                  Rp {submittedBooking.dpAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={generateCustomerInquiryWhatsAppUrl(submittedBooking, studioSettings)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chat Admin Diaferastudio di WA</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleModalClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-medium transition-colors"
              >
                Tutup & Kembali
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {/* Slot recap bar */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium text-white">{readableDate}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-orange-300">{slot.label}</span>
              </div>
              <div className="text-zinc-200 font-medium">
                {servicePackage.name}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nama Lengkap Pemesan *</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Raihan Gusti"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors ${
                    errors.customerName ? 'border-rose-500' : 'border-white/10'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-[11px] text-rose-400">{errors.customerName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nomor WhatsApp Aktif *</span>
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 08128900xxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors ${
                    errors.customerPhone ? 'border-rose-500' : 'border-white/10'
                  }`}
                />
                {errors.customerPhone && (
                  <p className="text-[11px] text-rose-400">{errors.customerPhone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Email (Opsional)</span>
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Jumlah Peserta / Model</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(servicePackage.maxPeople, 10)}
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Catatan Khusus / Konsep Foto (Opsional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Bawa toga kampus, request background hitam pekat, atau bawa 2 wardrobe."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors resize-none font-light"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-zinc-400">Total Biaya Sesi:</span>
                <span className="font-mono font-medium text-white">Rp {servicePackage.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="font-medium text-blue-400">Komitmen DP (50%):</span>
                  <p className="text-[11px] text-zinc-500 font-light">Ditransfer setelah admin mengkonfirmasi slot</p>
                </div>
                <span className="font-mono text-sm font-semibold text-white tabular-nums">
                  Rp {dpAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="pt-2 text-[11px] text-zinc-400 flex items-center gap-2 border-t border-white/5">
                <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  Rekening Resmi: {studioSettings.bankName} - {studioSettings.bankAccountNumber} (a.n {studioSettings.bankAccountHolder})
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Kirim Pengajuan Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

      </motion.div>
    </div>
  );
};
