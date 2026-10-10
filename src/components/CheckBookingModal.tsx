import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Hourglass,
  XCircle,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, StudioSettings } from '../types';
import {
  generateCustomerInquiryWhatsAppUrl,
  sounds,
  searchCustomerBookingByQuery,
  formatReadableDate,
} from '../utils/storage';

interface CheckBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  studioSettings: StudioSettings;
}

export const CheckBookingModal: React.FC<CheckBookingModalProps> = ({
  isOpen,
  onClose,
  bookings,
  studioSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const cleanTerm = searchTerm.toLowerCase().trim();
  const sourceBookings = bookings.length > 0 ? bookings : searchCustomerBookingByQuery(cleanTerm);
  const foundBookings = cleanTerm
    ? sourceBookings.filter((b) => {
        const idMatch = b.id.toLowerCase().includes(cleanTerm);
        const nameMatch = b.customerName.toLowerCase().includes(cleanTerm);
        const phoneMatch = b.customerPhone.replace(/\D/g, '').includes(cleanTerm.replace(/\D/g, ''));
        return idMatch || nameMatch || phoneMatch;
      })
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSeatClickSound();
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-lg rounded-3xl bg-zinc-950/90 border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-semibold text-white">
              Cek Status Reservasi Anda
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Kode Booking (DFS-...) atau No. WA"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all cursor-pointer shadow-sm"
            >
              Cari
            </button>
          </form>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-3">
              {foundBookings.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border border-white/5 bg-white/[0.02]">
                  <p className="text-xs text-zinc-300 font-medium">Data booking tidak ditemukan</p>
                  <p className="text-[11px] text-zinc-500 mt-1 font-light">
                    Pastikan kode booking atau nomor WhatsApp Anda sudah sesuai.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {foundBookings.map((b) => {
                    const isApproved = b.status === 'APPROVED';
                    const isPending = b.status === 'PENDING';
                    const isRejected = b.status === 'REJECTED';
                    const isCompleted = b.status === 'COMPLETED';

                    return (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium text-orange-400">
                            #{b.id}
                          </span>
                          
                          {isApproved && (
                            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Disetujui Admin
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] font-medium text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Hourglass className="w-3 h-3 animate-spin" />
                              Menunggu Approval
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] font-medium text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Ditolak / Reschedule
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] font-medium text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Selesai
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-white">{b.packageName}</p>
                          <p className="text-xs text-zinc-400 font-light">Atas Nama: {b.customerName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5 text-zinc-300">
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Jadwal Sesi:</span>
                            <span className="font-medium text-orange-300">{formatReadableDate(b.date)}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Waktu:</span>
                            <span className="font-medium text-white">{b.timeSlot}</span>
                          </div>
                        </div>

                        <div className="pt-1.5">
                          <a
                            href={generateCustomerInquiryWhatsAppUrl(b, studioSettings)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Hubungi Admin via WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
