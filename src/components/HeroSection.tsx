import React from 'react';
import { Calendar, ArrowUpRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
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
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGoToBooking, onGoToPortfolio }) => {
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

  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Main Hero Header (Matching Sam Ortega huge Instrument Sans title in video) */}
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
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Portofolio</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <a
                href="https://www.instagram.com/diaferastudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs transition-colors flex items-center gap-1.5"
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

        {/* Horizontal Row of 5 Preview Cards (Matching 00:01 - 00:03 in video) */}
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
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#121216] aspect-[4/5] cursor-pointer shadow-lg transition-transform duration-300 hover:-translate-y-1"
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

        {/* 4-Column Metadata Status Bar (Matching 00:04 in video) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 sm:mt-16 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs"
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
    </section>
  );
};
