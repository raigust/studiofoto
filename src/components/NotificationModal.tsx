import React from 'react';
import { X, Bell, Check, Sparkles, Clock, ArrowRight, Play } from 'lucide-react';
import { AdminNotification } from '../types';
import { sounds } from '../utils/storage';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdminNotification[];
  onMarkAllRead: () => void;
  onTriggerSimulatedBooking: () => void;
  onSelectBookingNotification?: (bookingId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onTriggerSimulatedBooking,
  onSelectBookingNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif text-lg font-bold text-white">
              Pusat Notifikasi Studio
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <button
              onClick={() => {
                sounds.playSeatClickSound();
                onMarkAllRead();
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tandai Semua Sudah Dibaca</span>
            </button>

            {/* Test incoming booking button */}
            <button
              onClick={() => {
                onTriggerSimulatedBooking();
              }}
              className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Coba simulasi ada customer baru melakukan booking"
            >
              <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Test Simulasi Booking Masuk</span>
            </button>
          </div>

          {/* Notification Items */}
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Belum ada notifikasi aktivitas terbaru.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.bookingId && onSelectBookingNotification) {
                      onSelectBookingNotification(n.bookingId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    n.read
                      ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400'
                      : 'bg-zinc-900 border-amber-500/30 text-zinc-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                      )}
                      {n.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{n.message}</p>
                  {n.bookingId && (
                    <div className="mt-2 text-right">
                      <span className="text-amber-400 hover:underline font-mono text-[11px] inline-flex items-center gap-1">
                        Lihat Rincian #{n.bookingId} &rarr;
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
