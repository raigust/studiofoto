import React, { useState, useEffect } from 'react';
import { Search, Calendar, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../utils/storage';
import { DiaferaLogo } from './DiaferaLogo';

interface NavbarProps {
  activeTab: 'home' | 'booking' | 'portfolio' | 'services';
  setActiveTab: (tab: 'home' | 'booking' | 'portfolio' | 'services') => void;
  onOpenCheckBooking: () => void;
  onSecretAdminTrigger: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCheckBooking,
  onSecretAdminTrigger,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  // Keyboard shortcut: Ctrl+Shift+A or Alt+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        sounds.playSeatClickSound();
        onSecretAdminTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSecretAdminTrigger]);

  const handleLogoSecretClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 3) {
      setLogoClicks(0);
      sounds.playShutterSound();
      onSecretAdminTrigger();
    }
  };

  const handleNavClick = (tab: 'home' | 'booking' | 'portfolio' | 'services') => {
    sounds.playSeatClickSound();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home' as const, label: 'Beranda' },
    { id: 'portfolio' as const, label: 'Karya' },
    { id: 'services' as const, label: 'Paket & Tarif' },
    { id: 'booking' as const, label: 'Jadwal & Slot' },
  ];

  return (
    <header className="sticky top-3 sm:top-5 z-40 w-full px-4 sm:px-6 transition-all">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-between h-14 px-3 sm:px-4 rounded-full bg-[#111114]/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
        >
          {/* Brand Circular Logo (Matching https://www.instagram.com/diaferastudio/) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogoSecretClick();
                }}
                title="Diaféra Studio — Space"
                className="transition-transform group-hover:scale-105"
              >
                <DiaferaLogo size="sm" variant="badge" />
              </div>
              <span className="font-sans font-bold text-sm tracking-tight text-white hidden sm:inline">
                Diaféra
              </span>
            </button>
          </div>

          {/* Center Navigation Links (Matching Video: Work, About, Explorations) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Cek Booking + Primary CTA Button (Like 'Get it Free' in video) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playSeatClickSound();
                onOpenCheckBooking();
              }}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Cek Status Booking Pelanggan"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Cek Booking</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavClick('booking')}
              className="px-4 py-1.5 sm:py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reservasi</span>
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
              aria-label="Toggle menu"
            >
              <div className="w-4 h-3 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-current transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
                <span className={`h-0.5 w-full bg-current transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full bg-current transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
              </div>
            </button>
          </div>
        </motion.div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 p-3 rounded-2xl bg-[#111114]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-1"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    activeTab === item.id ? 'bg-white/15 text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between px-2">
                <a
                  href="https://www.instagram.com/diaferastudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
                >
                  <span>Instagram @diaferastudio</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
