import React, { useState } from 'react';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
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
    <footer className="bg-black border-t border-white/8 py-14 sm:py-16 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/5">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <DiaferaLogo size="lg" variant="horizontal" />

            <p className="text-zinc-400 leading-relaxed font-light text-xs max-w-sm pt-2">
              Fotografi & Videografi dengan konsep Premium Minimalist. Private studio session, Family, Personal, Graduation, Maternity, dan Studio Rent di Bandung.
            </p>

            <div className="pt-1 flex items-center gap-3">
              <a
                href="https://www.instagram.com/diaferastudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono text-[11px] border border-white/10 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram @diaferastudio</span>
              </a>
            </div>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-white text-xs uppercase font-medium tracking-wider font-mono">
              Lokasi & Kontak Studio
            </p>
            <div className="space-y-2 text-zinc-400 font-light">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                <span>{studioSettings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${studioSettings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white font-mono transition-colors"
                >
                  +{studioSettings.whatsappNumber}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="font-mono">{studioSettings.email}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-white text-xs uppercase font-medium tracking-wider font-mono">
              Menu Cepat
            </p>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li>
                <a href="#booking" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Reservasi Sesi</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Portofolio Karya</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Paket Layanan & Harga</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://linktr.ee/diaferastudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 text-lime-400"
                >
                  <span>Linktree Diaferastudio</span>
                  <ArrowUpRight className="w-3 h-3 text-lime-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Secret Admin Trigger */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} DIAFÉRA STUDIO &mdash; SPACE. All Rights Reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Bandung, Indonesia</span>
            {/* Secret clickable dot to open admin login */}
            <span
              onClick={handleSecretDotClick}
              className="w-1.5 h-1.5 rounded-full bg-zinc-700 hover:bg-lime-400 transition-colors cursor-pointer"
              title="Diafera Management Portal"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
