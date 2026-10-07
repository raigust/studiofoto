import React from 'react';
import { ArrowUpRight, Calendar, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { HERO_STUDIO_IMAGE, WISUDA_PORTFOLIO_IMAGE, PERNIKAHAN_PORTFOLIO_IMAGE } from '../data/mockData';
import { sounds } from '../utils/storage';

interface HeroSectionProps {
  onGoToBooking: () => void;
  onGoToPortfolio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGoToBooking, onGoToPortfolio }) => {
  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden ambient-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="tracking-widest uppercase">DIAFERA FINE-ART STUDIO</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500">BANDUNG &bull; EST. 2024</span>
        </motion.div>

        {/* Hero Main Grid (Inspired by the Reference Image) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Bold Headline & Editorial Philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.08] text-balance">
              Simple Lines, Bold Ideas,{' '}
              <span className="text-zinc-400 font-normal italic font-serif">
                Timeless Frames.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl font-normal leading-relaxed">
              Kami menghilangkan segala kerumitan booking studio konvensional. 
              Pilih slot waktu Anda secara visual dengan sistem bioskop transparan, 
              dapatkan persetujuan instan via WhatsApp, dan nikmati sesi privat dengan tata cahaya editorial berstandar dunia.
            </p>

            {/* Micro proof metrics */}
            <div className="pt-4 flex flex-wrap items-center gap-8 text-xs text-zinc-400">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-white font-mono tabular-nums">100%</span>
                <span className="text-zinc-500">Privat 1-on-1 Studio</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-white font-mono tabular-nums">&lt; 15m</span>
                <span className="text-zinc-500">Approval WhatsApp</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-orange-400 font-mono tabular-nums">Cinema</span>
                <span className="text-zinc-500">Live Seat Matrix</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: High-End Visual Composite (Matching the photo's orange collaborative tile & frames) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 relative"
          >
            {/* Top-left image card */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-square group relative">
              <img
                src={HERO_STUDIO_IMAGE}
                alt="Diafera Studio Setup"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-zinc-300">
                Studio Space &bull; Noir
              </div>
            </div>

            {/* Top-right: Iconic Orange Action Card (Exact feature from reference photo!) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sounds.playSeatClickSound();
                onGoToBooking();
              }}
              className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white flex flex-col justify-between cursor-pointer shadow-[0_12px_36px_rgba(249,115,22,0.3)] transition-all group"
            >
              <div className="flex justify-end">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/80">RESERVASI BIOSKOP</p>
                <p className="text-lg sm:text-xl font-bold leading-tight mt-1 text-white">
                  Pilih Slot & Jadwal
                </p>
              </div>
            </motion.div>

            {/* Bottom-left: Portrait preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-square group relative">
              <img
                src={WISUDA_PORTFOLIO_IMAGE}
                alt="Wisuda Atelier"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-zinc-300">
                Wisuda Atelier &bull; Fine-Art
              </div>
            </div>

            {/* Bottom-right: Prewed preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-square group relative">
              <img
                src={PERNIKAHAN_PORTFOLIO_IMAGE}
                alt="Pernikahan Noir"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-zinc-300">
                Prewedding &bull; Intimate
              </div>
            </div>
          </motion.div>

        </div>

        {/* Editorial Divider & Studio Philosophy Banner (from Reference Photo) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 sm:mt-24 pt-10 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="max-w-2xl">
            <p className="text-xl sm:text-2xl font-light text-white leading-relaxed font-sans">
              Diaferastudio Dibuat untuk Mereka yang Menghargai &mdash;{' '}
              <span className="text-zinc-400 font-normal">
                Clarity Over Noise, Percaya Bahwa Momen Abadi Lahir dari Ketulusan dan Pencahayaan Sempurna.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playShutterSound();
                onGoToPortfolio();
              }}
              className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Jelajahi Arsip Foto</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
