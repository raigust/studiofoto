import React, { useState } from 'react';
import { Camera, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { StudioSettings } from '../types';
import { sounds } from '../utils/storage';

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
    <footer className="bg-black border-t border-white/8 py-16 sm:py-20 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-white/5">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                DIAFERA
              </span>
            </div>

            <p className="text-zinc-400 leading-relaxed font-light text-xs max-w-sm">
              {studioSettings.tagline}. Pengalaman sesi foto studio privat dengan reservasi visual cinema-grid dan konfirmasi resmi via WhatsApp.
            </p>

            <div className="pt-2 text-zinc-500 font-mono text-[11px]">
              Studio Hours: 09:00 - 21:00 WIB &bull; By Appointment
            </div>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-white text-xs uppercase font-medium tracking-wider font-mono">
              Direct Contact & Studio
            </p>
            <div className="space-y-2 text-zinc-400 font-light">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
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
              Quick Links
            </p>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li>
                <a href="#booking" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Jadwal Bioskop Studio</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Galeri Master Portfolio</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Paket Layanan & Harga</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line with secret trigger */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px] font-mono">
          <div>
            &copy; {new Date().getFullYear()} {studioSettings.studioName}. Crafted for clarity over noise.
          </div>
          <div className="flex items-center gap-3">
            <span>FINE-ART EDITORIAL</span>
            {/* Discreet secret trigger point */}
            <span
              onClick={handleSecretDotClick}
              className="cursor-pointer select-none text-zinc-700 hover:text-orange-400 transition-colors"
              title=""
            >
              &bull;
            </span>
            <span>CINEMA RESERVATION</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
