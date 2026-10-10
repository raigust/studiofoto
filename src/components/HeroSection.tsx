import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ArrowUpRight,
  ArrowRight,
  ImageIcon,
  X,
  Check,
  Link as LinkIcon,
  RotateCcw,
  Edit2,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroCardItem } from '../types';
import {
  HERO_STUDIO_IMAGE,
  DEFAULT_HERO_CARDS,
} from '../data/mockData';
import { sounds } from '../utils/storage';

interface HeroSectionProps {
  onGoToBooking: () => void;
  onGoToPortfolio: () => void;
  backgroundImageUrl?: string;
  heroCards?: HeroCardItem[];
  isAdmin?: boolean;
  onUpdateBackgroundImage?: (newUrl: string) => void;
  onUpdateHeroCardImage?: (cardIndex: number, newUrl: string) => void;
  onUpdateAllHeroCards?: (cards: HeroCardItem[]) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGoToBooking,
  onGoToPortfolio,
  backgroundImageUrl,
  heroCards,
  isAdmin = false,
  onUpdateBackgroundImage,
  onUpdateHeroCardImage,
  onUpdateAllHeroCards,
}) => {
  // Main admin header modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [headerModalTab, setHeaderModalTab] = useState<'background' | 'cards'>('background');
  const [bgUrlInput, setBgUrlInput] = useState(backgroundImageUrl || HERO_STUDIO_IMAGE);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Single card quick edit modal
  const [selectedCardEditIndex, setSelectedCardEditIndex] = useState<number | null>(null);
  const [cardUrlInput, setCardUrlInput] = useState('');
  const [cardSaveSuccess, setCardSaveSuccess] = useState(false);

  // Batch cards edit form state inside header modal
  const [batchCards, setBatchCards] = useState<HeroCardItem[]>(() => {
    return heroCards && heroCards.length === 5 ? heroCards : DEFAULT_HERO_CARDS;
  });

  useEffect(() => {
    if (backgroundImageUrl) {
      setBgUrlInput(backgroundImageUrl);
    }
  }, [backgroundImageUrl]);

  useEffect(() => {
    if (heroCards && heroCards.length === 5) {
      setBatchCards(heroCards);
    }
  }, [heroCards]);

  const currentBgImage = backgroundImageUrl || HERO_STUDIO_IMAGE;
  const currentHeroCards = heroCards && heroCards.length === 5 ? heroCards : DEFAULT_HERO_CARDS;

  const backgroundPresets = [
    { label: 'Cinematic Dark Studio 4K', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop' },
    { label: 'Minimalist Architectural 4K', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop' },
    { label: 'Atmospheric Moody 4K', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2670&auto=format&fit=crop' },
    { label: 'Studio Setup Asli', url: '/images/diafera_hero_studio_1791366216457.jpg' },
    { label: 'Wisuda Drapery', url: '/images/diafera_portfolio_wisuda_1791366242072.jpg' },
  ];

  const cardCategoryPresets: Record<number, { label: string; url: string }[]> = {
    0: [
      { label: 'Studio Space 4K', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Minimalist Room 4K', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Studio Setup Asli', url: '/images/diafera_hero_studio_1791366216457.jpg' },
    ],
    1: [
      { label: 'Wisuda Celebratory 4K', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Academic Portrait 4K', url: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Wisuda Drapery', url: '/images/diafera_portfolio_wisuda_1791366242072.jpg' },
    ],
    2: [
      { label: 'Minimalist Family 4K', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Warm Group Portrait 4K', url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Pernikahan Studio', url: '/images/diafera_portfolio_pernikahan_1791366259338.jpg' },
    ],
    3: [
      { label: 'Product Editorial 4K', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Still Life & Cosmetic 4K', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Kallista Product', url: '/images/diafera_portfolio_produk_1791366279700.jpg' },
    ],
    4: [
      { label: 'Fine Art Portrait 4K', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Classic Monochrome 4K', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop' },
      { label: 'Event Editorial', url: '/images/diafera_portfolio_event_1791366298516.jpg' },
    ],
  };

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

  const handleSaveSingleCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCardEditIndex === null || !cardUrlInput.trim()) return;
    sounds.playShutterSound();
    if (onUpdateHeroCardImage) {
      onUpdateHeroCardImage(selectedCardEditIndex, cardUrlInput.trim());
    }
    setCardSaveSuccess(true);
    setTimeout(() => {
      setCardSaveSuccess(false);
      setSelectedCardEditIndex(null);
    }, 1200);
  };

  const handleSaveBatchCards = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playShutterSound();
    if (onUpdateAllHeroCards) {
      onUpdateAllHeroCards(batchCards);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditModalOpen(false);
    }, 1200);
  };

  return (
    <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-white/10">
      
      {/* 4K ATMOSPHERIC BACKGROUND LAYER (Sampai garis kotak / border-b satu bagian) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          key={currentBgImage}
          src={currentBgImage}
          alt="Diafera Studio 4K Backdrop"
          className="w-full h-full object-cover object-center scale-105 transition-all duration-700 opacity-65 brightness-[0.9] contrast-[1.05]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop';
          }}
          referrerPolicy="no-referrer"
        />
        {/* Subtle dark gradient overlay: lets the 4K studio photo shine through clearly while keeping text perfectly legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/75 via-[#070709]/35 to-[#070709]/90" />
      </div>

      {/* Floating Admin Trigger Button (ONLY VISIBLE FOR ADMIN: 'inget admin aja') */}
      {isAdmin && (
        <div className="absolute top-4 right-4 sm:right-6 z-20">
          <button
            type="button"
            onClick={() => {
              sounds.playSeatClickSound();
              setBgUrlInput(currentBgImage);
              setBatchCards(currentHeroCards);
              setHeaderModalTab('background');
              setIsEditModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-black/85 hover:bg-white hover:text-black text-white text-[11px] font-mono border border-white/20 transition-all flex items-center gap-1.5 shadow-2xl backdrop-blur-md cursor-pointer group"
            title="Kelola Background 4K & 5 Foto Beranda (Khusus Admin)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400 group-hover:text-black" />
            <span>Kelola Background & Foto 4K (Admin)</span>
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
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[-0.04em] text-white leading-[0.98] drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
              Diaféra Studio
            </h1>
          </motion.div>

          {/* Authentic studio description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-2xl"
          >
            <p className="text-base sm:text-xl text-zinc-100 font-normal leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]">
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

        {/* Horizontal Row of 5 Preview Cards (Can be edited by admin via link) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 sm:mt-16"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-3.5">
            {currentHeroCards.map((card, idx) => (
              <div
                key={card.id || idx}
                onClick={() => {
                  sounds.playSeatClickSound();
                  onGoToPortfolio();
                }}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#121216]/90 aspect-[4/5] cursor-pointer shadow-lg transition-transform duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Safe online fallback if local file or link fails on deploy
                    (e.target as HTMLImageElement).src =
                      DEFAULT_HERO_CARDS[idx]?.imageUrl ||
                      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop';
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {card.concept}
                  </p>
                  <p className="text-xs font-semibold text-white leading-tight mt-0.5 truncate">
                    {card.title}
                  </p>
                </div>

                {/* Admin Quick Edit Button on Card */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playSeatClickSound();
                      setSelectedCardEditIndex(idx);
                      setCardUrlInput(card.imageUrl);
                      setCardSaveSuccess(false);
                    }}
                    className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/85 hover:bg-white hover:text-black text-white text-[10px] font-mono border border-white/25 transition-all flex items-center gap-1 shadow-xl z-20 cursor-pointer"
                    title={`Ubah Link Foto ${idx + 1} (${card.title})`}
                  >
                    <Edit2 className="w-3 h-3 text-blue-400" />
                    <span>Ubah Link</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4-Column Metadata Status Bar */}
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

      {/* SINGLE CARD QUICK EDIT MODAL */}
      <AnimatePresence>
        {selectedCardEditIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-[#121216] border border-white/15 p-6 shadow-2xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Ubah Foto #{selectedCardEditIndex + 1}: {currentHeroCards[selectedCardEditIndex]?.title}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase">
                      Konsep: {currentHeroCards[selectedCardEditIndex]?.concept}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCardEditIndex(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview */}
              <div className="aspect-[4/5] max-h-56 rounded-2xl overflow-hidden border border-white/10 bg-black relative mx-auto">
                <img
                  src={cardUrlInput || currentHeroCards[selectedCardEditIndex]?.imageUrl}
                  alt="Preview Card"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      DEFAULT_HERO_CARDS[selectedCardEditIndex]?.imageUrl || HERO_STUDIO_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/90 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm truncate">
                  {cardUrlInput || 'Tautan Gambar Aktif'}
                </div>
              </div>

              {/* Form Link Input */}
              <form onSubmit={handleSaveSingleCard} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Masukkan URL Gambar (Instagram / Unsplash / CDN / Web)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cardUrlInput}
                    onChange={(e) => setCardUrlInput(e.target.value)}
                    placeholder="https://... atau direct link foto"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-blue-400"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Bisa salin direct image link dari Instagram, Google Drive direct, CDN, atau Unsplash resolusi tinggi.
                  </p>
                </div>

                {/* Preset Options */}
                {cardCategoryPresets[selectedCardEditIndex] && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase">Pilihan Preset 4K Cepat:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cardCategoryPresets[selectedCardEditIndex].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            sounds.playSeatClickSound();
                            setCardUrlInput(preset.url);
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] transition-colors cursor-pointer ${
                            cardUrlInput === preset.url
                              ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                              : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cardSaveSuccess ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Foto kartu berhasil diperbarui & langsung tampil di beranda!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSeatClickSound();
                        setCardUrlInput(DEFAULT_HERO_CARDS[selectedCardEditIndex]?.imageUrl || '');
                      }}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Default 4K</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCardEditIndex(null)}
                        className="px-4 py-2 rounded-full text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan Foto</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN HEADER OVERVIEW MODAL (Tab 1: Background 4K, Tab 2: 5 Foto Showcase) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#121216] border border-white/15 p-6 shadow-2xl space-y-5"
            >
              {/* Modal Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Kelola Tampilan Hero Beranda</h3>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase">Khusus Admin Pengelola Diafera</p>
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

              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/60 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setHeaderModalTab('background')}
                  className={`flex-1 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    headerModalTab === 'background'
                      ? 'bg-white text-black font-semibold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>1. Latar Belakang 4K Hero</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderModalTab('cards')}
                  className={`flex-1 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    headerModalTab === 'cards'
                      ? 'bg-white text-black font-semibold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Kelola 5 Foto Showcase Beranda</span>
                </button>
              </div>

              {/* TAB 1: BACKGROUND 4K */}
              {headerModalTab === 'background' && (
                <div className="space-y-4">
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
                      <div className="absolute inset-0 bg-black/45" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-mono text-white/90 bg-black/70 px-3 py-1 rounded-full border border-white/15">
                          Pratinjau Sinematik Gelap
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
                        type="text"
                        required
                        value={bgUrlInput}
                        onChange={(e) => setBgUrlInput(e.target.value)}
                        placeholder="https://... atau direct link foto"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    {/* Preset Choices */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase">Pilihan Preset Studio 4K:</p>
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
                        <span>Background 4K berhasil disimpan & langsung aktif!</span>
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
                          <span>Reset Default</span>
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
                </div>
              )}

              {/* TAB 2: 5 FOTO SHOWCASE BERANDA */}
              {headerModalTab === 'cards' && (
                <form onSubmit={handleSaveBatchCards} className="space-y-4">
                  <p className="text-xs text-zinc-300">
                    Atur URL untuk ke-5 foto beranda agar tetap muncul dengan indah saat di-deploy:
                  </p>

                  <div className="space-y-3">
                    {batchCards.map((card, idx) => (
                      <div
                        key={card.id || idx}
                        className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-16 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0 relative">
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

                        {/* Title and Input */}
                        <div className="flex-1 w-full space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">
                              Foto #{idx + 1}: {card.title}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">{card.concept}</span>
                          </div>
                          <input
                            type="text"
                            value={card.imageUrl}
                            onChange={(e) => {
                              const newCards = [...batchCards];
                              newCards[idx] = { ...newCards[idx], imageUrl: e.target.value };
                              setBatchCards(newCards);
                            }}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-[11px] focus:outline-none focus:border-blue-400"
                          />
                          {/* Quick Category Preset Buttons */}
                          {cardCategoryPresets[idx] && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {cardCategoryPresets[idx].map((p) => (
                                <button
                                  key={p.label}
                                  type="button"
                                  onClick={() => {
                                    sounds.playSeatClickSound();
                                    const newCards = [...batchCards];
                                    newCards[idx] = { ...newCards[idx], imageUrl: p.url };
                                    setBatchCards(newCards);
                                  }}
                                  className="text-[9px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300"
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {saveSuccess ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Semua 5 foto beranda berhasil disimpan & langsung aktif!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playSeatClickSound();
                          setBatchCards(DEFAULT_HERO_CARDS);
                        }}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Semua ke Default 4K</span>
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
                          <span>Simpan Semua 5 Foto</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
