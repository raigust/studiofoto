import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Key, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import {
  sounds,
  getStoredAdminProfile,
  validateAdminPassword,
  createAdminSession,
  getLoginAttemptsStatus,
  recordLoginAttempt,
} from '../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attemptsStatus, setAttemptsStatus] = useState(() => getLoginAttemptsStatus());
  const [lockCountdown, setLockCountdown] = useState(0);

  const profile = getStoredAdminProfile();

  // Handle countdown timer if locked out
  useEffect(() => {
    if (!isOpen) return;
    const status = getLoginAttemptsStatus();
    setAttemptsStatus(status);
    if (!status.allowed && status.lockTimeRemainingSec > 0) {
      setLockCountdown(status.lockTimeRemainingSec);
    }
  }, [isOpen]);

  useEffect(() => {
    if (lockCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAttemptsStatus(getLoginAttemptsStatus());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockCountdown]);

  if (!isOpen) return null;

  const isLockedOut = !attemptsStatus.allowed || lockCountdown > 0;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    if (!password.trim()) {
      setError('Masukkan password admin terlebih dahulu.');
      return;
    }

    const isValid = validateAdminPassword(password.trim());

    if (isValid) {
      recordLoginAttempt(true);
      createAdminSession(profile);
      sounds.playSeatClickSound();
      setError('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      const attemptRes = recordLoginAttempt(false);
      setAttemptsStatus(attemptRes);
      sounds.playErrorSound?.();

      if (!attemptRes.allowed) {
        setLockCountdown(attemptRes.lockTimeRemainingSec);
        setError(`Akses diblokir sementara karena 5x salah password. Tunggu ${attemptRes.lockTimeRemainingSec} detik.`);
      } else {
        setError(`Password salah! Sisa kesempatan: ${attemptRes.remainingAttempts} kali.`);
      }
    }
  };

  const handleQuickDemoLogin = () => {
    if (isLockedOut) return;
    recordLoginAttempt(true);
    createAdminSession(profile);
    sounds.playSeatClickSound();
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-md rounded-3xl bg-zinc-950/95 border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-lime-400" />
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-white">
              SISTEM AUTENTIKASI PENGELOLA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          
          {/* Admin Avatar Banner */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-lime-400 shrink-0 bg-zinc-800">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden flex-1">
              <span className="text-[10px] font-mono uppercase text-lime-400 font-bold block">
                AKUN TERVERIFIKASI
              </span>
              <p className="font-bold text-sm text-white truncate">{profile.name}</p>
              <p className="text-[11px] text-zinc-400 truncate">{profile.role}</p>
            </div>
          </div>

          {/* Lockout banner if active */}
          {isLockedOut && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-rose-400 animate-spin" />
              <div>
                <p className="font-bold text-white">Akses Ditangguhkan Sementara</p>
                <p className="mt-0.5 text-[11px]">
                  Terlalu banyak percobaan gagal. Silakan tunggu{' '}
                  <span className="font-mono font-bold text-amber-300">{lockCountdown} detik</span> sebelum mencoba lagi.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-lime-400" />
                <span>Password / PIN Admin</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                Sisa kesempatan: <span className="font-bold text-zinc-300">{attemptsStatus.remainingAttempts}</span>/5
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password admin..."
                value={password}
                disabled={isLockedOut}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-lime-400/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {error ? (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 pt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            ) : (
              <p className="text-[10px] text-zinc-500 flex items-center justify-between pt-0.5">
                <span>Default PIN: <strong className="font-mono text-lime-400">admin123</strong></span>
                <span className="italic">Bisa diubah di menu Pengaturan Studio</span>
              </p>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isLockedOut}
              className="w-full py-2.5 rounded-full bg-lime-300 hover:bg-lime-200 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Verifikasi & Masuk Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={isLockedOut}
              onClick={handleQuickDemoLogin}
              className="w-full py-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demo Login 1-Klik (Khusus Pengembang)</span>
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
};
