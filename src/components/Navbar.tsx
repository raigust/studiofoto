import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
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

  // Secret shortcut: Ctrl+Shift+A or Alt+A
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
    { id: 'booking' as const, label: 'Reservasi Sesi' },
    { id: 'portfolio' as const, label: 'Portofolio' },
    { id: 'services' as const, label: 'Paket & Harga' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 rounded-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          {/* Brand Logo (Matching https://www.instagram.com/diaferastudio/) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center text-left focus:outline-none cursor-pointer"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogoSecretClick();
                }}
                title="Diafera Studio — Space"
              >
                <DiaferaLogo size="md" variant="horizontal" />
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Floating Glass Pill Selector) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/15 shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Instagram Link & Check Status */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/diaferastudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Instagram @diaferastudio"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenCheckBooking}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-200 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Cek Status</span>
            </motion.button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
            >
              <span className="sr-only">Buka menu</span>
              <div className="w-4 h-3.5 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-current transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 w-full bg-current transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full bg-current transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
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
              className="md:hidden mt-2 p-3 rounded-2xl bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-1"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    activeTab === item.id ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCheckBooking();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs text-zinc-300 flex items-center gap-2 hover:bg-white/5"
                >
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Cek Status Reservasi</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
