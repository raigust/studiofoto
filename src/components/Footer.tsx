import React, { useState } from 'react';
import { ArrowUpRight, Lock } from 'lucide-react';
import { StudioSettings } from '../types';
import { sounds } from '../utils/storage';
import { DiaferaLogo } from './DiaferaLogo';

interface FooterProps {
  studioSettings: StudioSettings;
  onSecretAdminTrigger?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  studioSettings,
  onSecretAdminTrigger,
}) => {
  const [dotClicks, setDotClicks] = useState(0);

  const handleSecretDotClick = () => {
    const next = dotClicks + 1;
    setDotClicks(next);
    if (next >= 3) {
      setDotClicks(0);
      sounds.playShutterSound();
      if (onSecretAdminTrigger) onSecretAdminTrigger();
    }
  };

  return (
    <footer className="bg-[#08080a] border-t border-white/10 pt-16 sm:pt-20 pb-10 text-zinc-400 text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Top 4-Column Grid (Matching Video at 00:12) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-14 border-b border-white/10">
          
          {/* Brand & Studio Brief */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <DiaferaLogo size="sm" variant="badge" />
              <span className="font-sans font-bold text-base tracking-tight text-white">
                Diaféra Studio
              </span>
            </div>

            <p className="text-zinc-400 leading-relaxed font-normal text-xs max-w-sm">
              Studio fotografi dengan konsep private session minimalis di Bandung.
              Family, Personal Portrait, Graduation, Maternity, dan Studio Rent.
            </p>

            {/* Availability status pill (Matching video at 00:12) */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Buka untuk reservasi sesi studio</span>
              </div>
            </div>
          </div>

          {/* Navigation Pages */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-white text-[11px] uppercase font-mono tracking-wider">
              PAGES
            </p>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li>
                <a href="#portfolio" className="hover:text-white transition-colors">
                  Karya Pilihan
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Tentang Studio
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Paket & Tarif
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-white transition-colors">
                  Jadwal & Slot
                </a>
              </li>
            </ul>
          </div>

          {/* Elsewhere / Socials */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-white text-[11px] uppercase font-mono tracking-wider">
              ELSEWHERE
            </p>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li>
                <a
                  href="https://www.instagram.com/diaferastudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${studioSettings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>WhatsApp</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=Diafera+Studio+Bandung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>Google Maps</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                </a>
              </li>
            </ul>
          </div>

          {/* Say Hello / Contact */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-white text-[11px] uppercase font-mono tracking-wider">
              SAY HELLO
            </p>
            <div className="space-y-1.5 text-xs">
              <a
                href={`mailto:${studioSettings.email}`}
                className="text-white hover:underline block font-mono"
              >
                {studioSettings.email}
              </a>
              <p className="text-zinc-500 leading-relaxed">
                {studioSettings.address}
              </p>
            </div>
          </div>

        </div>

        {/* GIANT Outlined Typography (Matching 'Sam Ortega' huge ghost typography at 00:12 in video) */}
        <div className="py-12 sm:py-16 text-center overflow-hidden">
          <p
            onClick={handleSecretDotClick}
            className="text-outline-huge text-5xl sm:text-7xl md:text-9xl font-bold tracking-[-0.04em] whitespace-nowrap cursor-pointer select-none transition-all duration-500 hover:scale-[1.01]"
            title="Diaféra Studio — Bandung"
          >
            DIAFÉRA STUDIO
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>
            &copy; 2026 Diaféra Studio. Crafted with minimalism. Private session space Bandung.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSecretDotClick}
              className="text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 text-[11px] font-mono cursor-pointer"
              title="Akses Pengelola Studio"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
