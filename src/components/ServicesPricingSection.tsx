import React from 'react';
import { Check, ArrowUpRight, Clock, Users } from 'lucide-react';
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
    <section id="services" className="py-20 sm:py-28 bg-[#0a0a0c] border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header (Matching Video Style) */}
        <div className="space-y-4 mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            PRICING & PACKAGES
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-white">
                Paket sesi foto studio.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl font-normal">
                Transparan tanpa biaya tersembunyi. Termasuk ruangan studio privat, arahan pose, dan seluruh file asli.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_PACKAGES.map((pkg, idx) => {
            const isFeatured = idx === 0;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                key={pkg.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all bg-[#121215] border ${
                  isFeatured
                    ? 'border-white/30 shadow-2xl ring-1 ring-white/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
                    <span className="uppercase tracking-wider text-zinc-300 font-medium">
                      {pkg.category}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {pkg.durationMinutes} Menit
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {pkg.name}
                  </h3>

                  <p className="text-xs text-zinc-400 font-normal mt-2 leading-relaxed min-h-[38px]">
                    {pkg.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 pb-6 border-b border-white/10">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Total Biaya Sesi</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
                      DP 50%: Rp {(Math.round(pkg.price * 0.5)).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Inclusions */}
                  <div className="mt-6 space-y-2.5">
                    <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Sudah Termasuk:</p>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {pkg.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-8 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSeatClickSound();
                      onSelectCategoryAndScroll(pkg.category);
                    }}
                    className={`w-full py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                      isFeatured
                        ? 'bg-white hover:bg-zinc-200 text-black'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    <span>Pilih Paket & Jadwal</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
