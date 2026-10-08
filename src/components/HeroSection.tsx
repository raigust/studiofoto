import React, { useState } from 'react';
import { Calendar, ArrowUpRight, ArrowRight, ImageIcon, X, Check, Link as LinkIcon, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HERO_STUDIO_IMAGE,
  WISUDA_PORTFOLIO_IMAGE,
  PERNIKAHAN_PORTFOLIO_IMAGE,
  PRODUK_PORTFOLIO_IMAGE,
  EVENT_PORTFOLIO_IMAGE,
} from '../data/mockData';
import { sounds } from '../utils/storage';

interface HeroSectionProps {
  onGoToBooking: () => void;
  onGoToPortfolio: () => void;
  backgroundImageUrl?: string;
  isAdmin?: boolean;
  onUpdateBackgroundImage?: (newUrl: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGoToBooking,
  onGoToPortfolio,
  backgroundImageUrl,
  isAdmin = false,
  onUpdateBackgroundImage,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bgUrlInput, setBgUrlInput] = useState(backgroundImageUrl || HERO_STUDIO_IMAGE);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentBgImage = backgroundImageUrl || HERO_STUDIO_IMAGE;

  const previewCards = [
    {
      title: 'Studio Space & Setup',
      concept: 'Private Room',
      image: HERO_STUDIO_IMAGE,
    },
    {
      title: 'Graduation Session',
      concept: 'Wisuda & Drapery',
      image: WISUDA_PORTFOLIO_IMAGE,
    },
    {
      title: 'Family & Group',
      concept: 'Minimalist Family',
      image: PERNIKAHAN_PORTFOLIO_IMAGE,
    },
    {
      title: 'Commercial & Editorial',
      concept: 'Still Life & Brand',
      image: PRODUK_PORTFOLIO_IMAGE,
    },
    {
      title: 'Personal & Portrait',
      concept: 'Fine Art Light',
      image: EVENT_PORTFOLIO_IMAGE,
    },
  ];

  const backgroundPresets = [
    { label: 'Studio Setup Asli', url: HERO_STUDIO_IMAGE },
    { label: 'Wisuda Drapery', url: WISUDA_PORTFOLIO_IMAGE },
    { label: 'Family Minimalist', url: PERNIKAHAN_PORTFOLIO_IMAGE },
    { label: 'Commercial Still', url: PRODUK_PORTFOLIO_IMAGE },
  ];

  const handleSaveBackground = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgUrlInput.trim()) return;
    sounds.playShutterSound();
    if (onUpdateBackgroundImage) {
      onUpdateBackgroundImage(bgUrlInput.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditModalOpen(false);
    }, 1200);
  };

  return (
    <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-white/10">
      
      {/* 4K ATMOSPHERIC BACKGROUND LAYER (Darkened as requested) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src={currentBgImage}
          alt="Diafera Studio 4K Backdrop"
          className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        {/* Deep matte dark film overlays (keeps background atmospheric while preserving text clarity) */}
        <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-[1.5px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/90 via-black/75 to-[#0a0a0c]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,12,0.85)_100%)]" />
      </div>

      {/* Floating Admin Trigger Button (ONLY VISIBLE FOR ADMIN: 'inget admin aja') */}
      {isAdmin && (
        <div className="absolute top-4 right-4 sm:right-6 z-20">
          <button
            type="button"
            onClick={() => {
              sounds.playSeatClickSound();
              setBgUrlInput(currentBgImage);
              setIsEditModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-black/80 hover:bg-white hover:text-black text-white text-[11px] font-mono border border-white/20 transition-all flex items-center gap-1.5 shadow-xl backdrop-blur-md cursor-pointer group"
            title="Ganti Background 4K Hero (Akses Khusus Admin)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400 group-hover:text-black" />
            <span>Ganti Background 4K (Admin)</span>
          </button>
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Main Hero Header */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[-0.04em] text-white leading-[0.98]">
              Diaféra Studio
            </h1>
          </motion.div>

          {/* Authentic, non-hyperbolic studio description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-2xl"
          >
            <p className="text-base sm:text-xl text-zinc-300 font-normal leading-relaxed">
              Studio fotografi berbasis di Bandung dengan konsep private session minimalis.
              Dirancang untuk kenyamanan keluarga, wisuda, portrait personal, maternity, dan sewa studio tanpa distraksi.
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playSeatClickSound();
                  onGoToBooking();
                }}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md group"
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>Reservasi Sesi Studio</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playShutterSound();
                  onGoToPortfolio();
                }}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
              >
                <span>Lihat Portofolio</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <a
                href="https://www.instagram.com/diaferastudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs transition-colors flex items-center gap-1.5 backdrop-blur-sm"
                title="Instagram @diaferastudio"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@diaferastudio</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Horizontal Row of 5 Preview Cards (00:01 - 00:03 in video) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 sm:mt-16"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-3.5">
            {previewCards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => {
                  sounds.playSeatClickSound();
                  onGoToPortfolio();
                }}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#121216]/90 aspect-[4/5] cursor-pointer shadow-lg transition-transform duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {card.concept}
                  </p>
                  <p className="text-xs font-semibold text-white leading-tight mt-0.5 truncate">
                    {card.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4-Column Metadata Status Bar (Unified framing: "sampai garis kotak itu satu bagian") */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 sm:mt-16 p-6 rounded-3xl bg-[#111114]/85 border border-white/10 backdrop-blur-md grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs shadow-2xl"
        >
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">KONSEP / RUANG</p>
            <p className="text-zinc-200 font-medium mt-1">Private Studio Session</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">LOKASI / BASE</p>
            <p className="text-zinc-200 font-medium mt-1">Bandung, Jawa Barat</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">PERALATAN UTAMA</p>
            <p className="text-zinc-200 font-medium mt-1">Sony 61MP & Profoto D2</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">KETERSEDIAAN</p>
            <p className="text-emerald-400 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Buka Reservasi Sesi</span>
            </p>
          </div>
        </motion.div>

      </div>

      {/* Admin Background Link Editor Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#121216] border border-white/15 p-6 shadow-2xl space-y-5"
            >
              {/* Modal Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Ganti Background 4K Hero</h3>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase">Khusus Admin Pengelola</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-zinc-300">Pratinjau Background Saat Ini:</p>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                  <img
                    src={bgUrlInput || currentBgImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = HERO_STUDIO_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono text-white/90 bg-black/60 px-3 py-1 rounded-full border border-white/15">
                      Pratinjau Gelap (Dark Filter Aktif)
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Link Input */}
              <form onSubmit={handleSaveBackground} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Masukkan URL Gambar 4K (Instagram / Web / CDN)</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={bgUrlInput}
                    onChange={(e) => setBgUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-blue-400"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Bisa salin tautan foto dari Instagram (klik kanan salin alamat gambar) atau link CDN 4K lainnya.
                  </p>
                </div>

                {/* Preset Choices */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase">Pilihan Preset Studio:</p>
                  <div className="flex flex-wrap gap-2">
                    {backgroundPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          sounds.playSeatClickSound();
                          setBgUrlInput(preset.url);
                        }}
                        className={`px-3 py-1 rounded-xl border text-[11px] transition-colors cursor-pointer ${
                          bgUrlInput === preset.url
                            ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {saveSuccess ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Background 4K berhasil disimpan & langsung aktif di beranda!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSeatClickSound();
                        setBgUrlInput(HERO_STUDIO_IMAGE);
                      }}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Kembalikan Default</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 rounded-full text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan Background</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
