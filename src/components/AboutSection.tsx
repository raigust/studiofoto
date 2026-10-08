import React from 'react';
import { Calendar, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { sounds } from '../utils/storage';

interface AboutSectionProps {
  onGoToBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onGoToBooking }) => {
  const equipmentPills = [
    'Sony A7R V (61 Megapixels)',
    'Profoto D2 High-Speed Lighting',
    '120cm Octabox with Grid',
    'Godox AD600 Pro Monolight',
    'Live Tethering Preview Display',
    'Private AC Dressing Room',
    'Seamless Neutral Backdrops',
    'Full High-Res Master Files',
  ];

  const highlights = [
    {
      title: '1 Sesi, 1 Klien Privat',
      desc: 'Tidak ada orang asing atau antrean yang menatap Anda saat berpose.',
    },
    {
      title: 'Arahan Pose Santai',
      desc: 'Fotografer ramah yang mengarahkan gaya secara alami tanpa kaku.',
    },
    {
      title: 'Live Tethering Screen',
      desc: 'Lihat jepretan Anda langsung di monitor besar saat pemotretan berlangsung.',
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#070709] border-t border-white/10 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Top Label (Matching 'ABOUT' in video at 00:08) */}
        <div className="space-y-4">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            ABOUT / RUANG STUDIO
          </p>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.035em] text-white max-w-3xl leading-[1.08]"
          >
            Ruang privat yang dirancang untuk hasil foto terbaik tanpa rasa canggung.
          </motion.h2>
        </div>

        {/* Narrative Paragraphs */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-zinc-300 font-normal leading-relaxed text-sm sm:text-base">
          <div className="md:col-span-7 space-y-4">
            <p>
              Kami percaya foto keluarga, wisuda, maupun portrait yang bernilai lahir saat Anda merasa tenang dan leluasa. Di Diaféra, setiap sesi bersifat private—satu ruangan eksklusif untuk Anda bersama keluarga atau kerabat, tanpa keramaian orang lain.
            </p>
            <p className="text-zinc-400">
              Didukung peralatan berstandar industri komersial: sensor beresolusi 61MP untuk ketajaman detail pori dan busana, pencahayaan lembut Profoto yang menonjolkan fitur wajah alami, serta ruang rias privat ber-AC untuk touch-up busana Anda.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  sounds.playSeatClickSound();
                  onGoToBooking();
                }}
                className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md group"
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>Reservasi Jadwal & Slot Studio</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#111114] border border-white/10 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                </div>
                <p className="text-xs text-zinc-400 pl-6 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment & Capabilities Pills (Matching Video at 00:10: Figma, React, TypeScript...) */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
            PERALATAN & FASILITAS STANDAR STUDIO:
          </p>
          <div className="flex flex-wrap gap-2">
            {equipmentPills.map((pill, idx) => (
              <div
                key={idx}
                className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300"
              >
                {pill}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
