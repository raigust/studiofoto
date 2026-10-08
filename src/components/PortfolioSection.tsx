import React, { useState, useMemo } from 'react';
import {
  Search,
  Camera,
  X,
  ArrowUpRight,
  Sparkles,
  ImageIcon,
  Check,
  Link as LinkIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PortfolioItem, ServiceCategory } from '../types';
import { sounds } from '../utils/storage';

interface PortfolioSectionProps {
  portfolioItems: PortfolioItem[];
  onSelectCategoryForBooking: (category: ServiceCategory) => void;
  isAdmin?: boolean;
  onUpdatePortfolioPhoto?: (id: string, newUrl: string) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  portfolioItems,
  onSelectCategoryForBooking,
  isAdmin = false,
  onUpdatePortfolioPhoto,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLightboxItem, setActiveLightboxItem] = useState<PortfolioItem | null>(null);

  // Quick photo link editor state
  const [isEditingPhotoUrl, setIsEditingPhotoUrl] = useState(false);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [photoUpdateSuccess, setPhotoUpdateSuccess] = useState(false);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Karya' },
    { id: 'wisuda', label: 'Wisuda' },
    { id: 'produk', label: 'Produk & Brand' },
    { id: 'pernikahan', label: 'Pernikahan & Prewed' },
    { id: 'portrait', label: 'Personal Portrait' },
    { id: 'event', label: 'Event Khusus' },
  ];

  const filteredItems = useMemo(() => {
    return portfolioItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesQuery =
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.clientName && item.clientName.toLowerCase().includes(query)) ||
        item.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [portfolioItems, selectedCategory, searchQuery]);

  const openLightbox = (item: PortfolioItem) => {
    sounds.playSeatClickSound();
    setActiveLightboxItem(item);
    setIsEditingPhotoUrl(false);
    setNewPhotoUrlInput(item.imageUrl);
    setPhotoUpdateSuccess(false);
  };

  const closeLightbox = () => {
    setActiveLightboxItem(null);
    setIsEditingPhotoUrl(false);
  };

  const handleSavePhotoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLightboxItem || !newPhotoUrlInput.trim()) return;
    sounds.playShutterSound();
    const cleanUrl = newPhotoUrlInput.trim();
    if (onUpdatePortfolioPhoto) {
      onUpdatePortfolioPhoto(activeLightboxItem.id, cleanUrl);
    }
    setActiveLightboxItem({
      ...activeLightboxItem,
      imageUrl: cleanUrl,
    });
    setPhotoUpdateSuccess(true);
    setTimeout(() => {
      setPhotoUpdateSuccess(false);
      setIsEditingPhotoUrl(false);
    }, 1500);
  };

  return (
    <section id="portfolio" className="py-16 sm:py-24 bg-[#0a0a0c] border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header (Matching 'SELECTED WORK' in video at 00:05) */}
        <div className="space-y-4 mb-10">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            SELECTED WORK
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-white">
                Koleksi sesi foto terbaru.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl font-normal">
                Pencahayaan presisi, gradasi natural, dan momen yang bercerita.
              </p>
            </div>

            {/* Subtle Search Pill */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari konsep foto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clean Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.playSeatClickSound();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Showcase Cards (Matching full-bleed cards in video 00:05 - 00:08) */}
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-white/10 bg-[#111114]">
            <Camera className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-zinc-300">Tidak ada karya yang sesuai</h3>
            <p className="text-xs text-zinc-500 mt-1">Coba pilih kategori lain atau reset kata kunci pencarian.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-full bg-white/10 text-xs text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => openLightbox(item)}
                className="group relative rounded-3xl overflow-hidden border border-white/10 bg-[#121215] cursor-pointer shadow-xl transition-all duration-300 hover:border-white/25"
              >
                {/* Image Container */}
                <div className="aspect-[16/10] sm:aspect-[21/10] w-full bg-black overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Top-right View indicator */}
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>

                  {/* Top-left Quick Edit for Admin or User Link update */}
                  {isAdmin && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(item);
                        setIsEditingPhotoUrl(true);
                      }}
                      className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-medium flex items-center gap-1.5 shadow-md hover:bg-lime-400 hover:text-black transition-colors"
                      title="Ganti URL Foto (Instagram / Web)"
                    >
                      <ImageIcon className="w-3 h-3 text-lime-400" />
                      <span>Ganti Link Foto</span>
                    </div>
                  )}
                </div>

                {/* Bottom Meta Bar (Matching Video Bar format: Title on Left, Year & Category on Right) */}
                <div className="p-5 sm:p-6 bg-[#111114] flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/5">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-light mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 shrink-0">
                    <span className="text-zinc-500">2026</span>
                    <span>&bull;</span>
                    <span className="uppercase text-zinc-300 font-semibold">{item.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox Modal with Instagram/Web Photo URL Replacement */}
      <AnimatePresence>
        {activeLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-4xl rounded-3xl bg-[#111114] border border-white/15 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
            >
              {/* Modal Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="uppercase">{activeLightboxItem.category} &bull; SHOWCASE</span>
                </div>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 space-y-6">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[16/10] max-h-[460px]">
                  <img
                    src={activeLightboxItem.imageUrl}
                    alt={activeLightboxItem.title}
                    className="w-full h-full object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="md:col-span-2 space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {activeLightboxItem.title}
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                      {activeLightboxItem.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
                      {activeLightboxItem.tags.map((t, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-zinc-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Technical Specs & Actions */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-xs space-y-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                      Studio Technical Specs
                    </p>
                    {activeLightboxItem.clientName && (
                      <div className="border-b border-white/5 pb-1.5">
                        <span className="text-zinc-500 block text-[10px]">Klien / Subjek:</span>
                        <span className="font-medium text-white">{activeLightboxItem.clientName}</span>
                      </div>
                    )}
                    {activeLightboxItem.gearInfo?.camera && (
                      <div className="border-b border-white/5 pb-1.5">
                        <span className="text-zinc-500 block text-[10px]">Kamera:</span>
                        <span className="font-medium text-white">{activeLightboxItem.gearInfo.camera}</span>
                      </div>
                    )}
                    {activeLightboxItem.gearInfo?.lighting && (
                      <div className="border-b border-white/5 pb-1.5">
                        <span className="text-zinc-500 block text-[10px]">Lighting:</span>
                        <span className="font-medium text-zinc-300">{activeLightboxItem.gearInfo.lighting}</span>
                      </div>
                    )}

                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          const cat = activeLightboxItem.category;
                          closeLightbox();
                          onSelectCategoryForBooking(cat);
                          const el = document.getElementById('booking');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <span>Reservasi Sesi Serupa</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playSeatClickSound();
                          setIsEditingPhotoUrl(!isEditingPhotoUrl);
                          setNewPhotoUrlInput(activeLightboxItem.imageUrl);
                        }}
                        className="w-full py-2 px-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Ganti Link Foto (Instagram / URL)</span>
                      </button>
                    </div>

                    {/* Inline Photo URL Editor Form */}
                    {isEditingPhotoUrl && (
                      <form
                        onSubmit={handleSavePhotoUrl}
                        className="mt-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-2.5 text-xs text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                            <LinkIcon className="w-3 h-3 text-blue-400" />
                            <span>Link Foto Instagram / Web</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEditingPhotoUrl(false)}
                            className="text-zinc-500 hover:text-white p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          Masukkan URL gambar langsung dari Instagram atau web CDN:
                        </p>
                        <input
                          type="url"
                          required
                          value={newPhotoUrlInput}
                          onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-[11px] focus:outline-none focus:border-blue-400"
                        />
                        {photoUpdateSuccess ? (
                          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Foto karya berhasil diperbarui!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsEditingPhotoUrl(false)}
                              className="px-3 py-1.5 rounded-full text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Simpan Foto</span>
                            </button>
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};
