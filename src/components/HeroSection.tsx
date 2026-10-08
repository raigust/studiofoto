import React from 'react';
import { ArrowUpRight, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { HERO_STUDIO_IMAGE, WISUDA_PORTFOLIO_IMAGE, PERNIKAHAN_PORTFOLIO_IMAGE } from '../data/mockData';
import { sounds } from '../utils/storage';
import { DiaferaLogo } from './DiaferaLogo';

interface HeroSectionProps {
  onGoToBooking: () => void;
  onGoToPortfolio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGoToBooking, onGoToPortfolio }) => {
  return (
    <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-24 overflow-hidden ambient-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Minimalist Top Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 text-xs font-mono text-zinc-400 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="tracking-[0.25em] uppercase text-zinc-300 font-semibold">DIAFÉRA STUDIO — SPACE</span>
          <span className="text-zinc-600 hidden sm:inline">&bull;</span>
          <span className="text-zinc-400 hidden sm:inline font-sans">Bandung</span>
        </motion.div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Bold Minimalist Headline & Direct Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06] text-balance">
              Premium Minimalist Concept.
            </h1>

            <p className="text-base sm:text-xl text-zinc-300 max-w-xl font-light leading-relaxed">
              Private Studio Session &mdash;{' '}
              <span className="text-zinc-400 font-normal">
                Family &bull; Personal &bull; Graduation &bull; Maternity &bull; Studio Rent.
              </span>
            </p>

            {/* Direct Action Buttons (Zero Fluff, High Impact) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  sounds.playSeatClickSound();
                  onGoToBooking();
                }}
                className="px-6 py-3.5 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer group"
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>Reservasi Sesi Studio</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  sounds.playShutterSound();
                  onGoToPortfolio();
                }}
                className="px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Lihat Portofolio</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </button>

              <a
                href="https://www.instagram.com/diaferastudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-all flex items-center gap-2 cursor-pointer"
                title="Kunjungi Instagram Resmi @diaferastudio"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@diaferastudio</span>
              </a>
            </div>

            {/* Clean Metadata Line (Anti-Slop: No fake candy pills) */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-500">
              <span>Private Space</span>
              <span>&bull;</span>
              <span>Visual Cinema Grid</span>
              <span>&bull;</span>
              <span>Instant WhatsApp Approval</span>
            </div>
          </motion.div>

          {/* Right Column: Visual Composite with Diafera Aesthetic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 relative"
          >
            {/* Top-left image card (Studio Setup) */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-square group relative shadow-2xl">
              <img
                src={HERO_STUDIO_IMAGE}
                alt="Diafera Studio Setup"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-zinc-200">
                Studio Space &bull; Props
              </div>
            </div>

            {/* Top-right: Clean Action Card with Circular Diafera Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sounds.playSeatClickSound();
                onGoToBooking();
              }}
              className="rounded-2xl p-5 sm:p-6 bg-zinc-900 border border-white/15 text-white flex flex-col justify-between cursor-pointer shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <DiaferaLogo variant="badge" size="sm" />
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <div className="pt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-semibold">RESERVASI SESI</p>
                <p className="text-base sm:text-lg font-bold leading-tight mt-1 text-white">
                  Pilih Jadwal & Slot
                </p>
                <span className="text-[11px] text-zinc-400 mt-1 block">Live cinema slot visual</span>
              </div>
            </motion.div>

            {/* Bottom-left: Graduation Curtain Portrait */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-square group relative shadow-2xl">
              <img
                src={WISUDA_PORTFOLIO_IMAGE}
                alt="Graduation Concept"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-zinc-200">
                Graduation &bull; Curtains
              </div>
            </div>

            {/* Bottom-right: Family / Portrait Session */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-square group relative shadow-2xl">
              <img
                src={PERNIKAHAN_PORTFOLIO_IMAGE}
                alt="Family & Portrait Concept"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-zinc-200">
                Family &bull; Minimalist
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
