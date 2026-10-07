import React from 'react';
import { Check, ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { SERVICE_PACKAGES } from '../data/mockData';
import { ServiceCategory } from '../types';
import { sounds } from '../utils/storage';

interface ServicesPricingSectionProps {
  onSelectCategoryAndScroll: (category: ServiceCategory) => void;
}

export const ServicesPricingSection: React.FC<ServicesPricingSectionProps> = ({
  onSelectCategoryAndScroll,
}) => {
  return (
    <section id="services" className="py-16 sm:py-24 bg-[#070709] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Inspired by the Reference Image) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono text-orange-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>TRANSPARENT VALUE & TIERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
            Paket Sesi Foto Studio Diafera
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 font-light">
            Dirancang dengan transparansi penuh. Termasuk studio privat, penataan lighting editorial, 
            dan seluruh file digital mentah resolusi penuh.
          </p>
        </motion.div>

        {/* Pricing Cards Grid (Apple Minimalist Glass Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_PACKAGES.map((pkg, idx) => {
            const isFeatured = idx === 1; // Prewed noir as middle featured card

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                key={pkg.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all backdrop-blur-2xl ${
                  isFeatured
                    ? 'bg-zinc-900/80 border border-orange-500/30 shadow-[0_20px_50px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/20'
                    : 'bg-zinc-950/60 border border-white/10 hover:border-white/20'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-mono tracking-wider uppercase font-semibold shadow-md">
                    Signature Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                    <span className="uppercase text-orange-400 font-medium">
                      {pkg.category}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      {pkg.durationMinutes} Menit
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-white mt-1">
                    {pkg.name}
                  </h3>

                  <p className="text-xs text-zinc-400 font-light mt-2 min-h-[38px] leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 pb-6 border-b border-white/10">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Total Biaya Sesi</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-semibold font-mono text-white tabular-nums">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
                      DP 50%: Rp {(Math.round(pkg.price * 0.5)).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Inclusions */}
                  <div className="mt-6 space-y-2.5">
                    <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Inclusions:</p>
                    <ul className="space-y-2 text-xs text-zinc-300 font-light">
                      {pkg.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-8 mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      sounds.playSeatClickSound();
                      onSelectCategoryAndScroll(pkg.category);
                    }}
                    className={`w-full py-3 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFeatured
                        ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    <span>Pilih Paket Ini</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
