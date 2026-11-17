import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import SectionTitle from './common/SectionTitle';

export const FAQ = ({ t }) => {
  // Keep only one item open at a time (first item open by default for engaging preview)
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#00FF88]/[0.025] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge={t.faq.badge}
          title={t.faq.title}
          subtitle={t.faq.subtitle}
          className="mb-16 text-center"
        />

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {t.faq.items.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-[18px] bg-[#111111]/90 border transition-all duration-300 backdrop-blur-xl overflow-hidden ${
                  isOpen
                    ? 'border-[#00FF88]/40 shadow-[0_0_20px_rgba(0,255,136,0.15)] bg-[#131313]'
                    : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full p-6 text-left rtl:text-right flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88] rounded-[18px]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-heading font-bold text-white transition-colors duration-200">
                    {item.question}
                  </span>

                  {/* Green Plus icon that smoothly rotates 45deg to an X */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88] rotate-45 shadow-[0_0_10px_rgba(0,255,136,0.4)]'
                        : 'bg-white/5 border-white/10 text-[#A1A1AA] rotate-0'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                </button>

                {/* Smooth Animated Answer Drawer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out px-6 ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 pb-6'
                      : 'grid-rows-[0fr] opacity-0 pb-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed pt-2 border-t border-white/[0.06] font-normal">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

