import React, { useEffect, useRef, useState } from 'react';
import { Search, Palette, Code2, ShieldCheck, Rocket } from 'lucide-react';
import SectionTitle from './common/SectionTitle';

const iconMap = {
  Search,
  Palette,
  Code2,
  ShieldCheck,
  Rocket,
};

/**
 * Individual timeline step component with scroll-activated glow and fade-in
 */
const TimelineStep = ({ step, index, isLast }) => {
  const [isVisible, setIsVisible] = useState(false);
  const stepRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const IconComponent = iconMap[step.icon] || Search;
  const isEven = index % 2 === 0;

  return (
    <div
      ref={stepRef}
      className={`relative flex items-center md:justify-between transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-8'
      } ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      {/* Mobile & Desktop Center Node with Glowing Number */}
      <div className="absolute start-6 rtl:end-auto md:start-1/2 -translate-x-1/2 rtl:translate-x-1/2 md:rtl:translate-x-1/2 z-20 flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono text-sm font-bold transition-all duration-500 border ${
            isVisible
              ? 'bg-[#111111] border-[#00FF88] text-[#00FF88] shadow-[0_0_22px_rgba(0,255,136,0.45)] scale-110'
              : 'bg-[#111111]/80 border-white/10 text-[#71717A] scale-100'
          }`}
        >
          {step.step}
        </div>
      </div>

      {/* Content Card (Desktop: 5/12 width alternating, Mobile: full width with left margin) */}
      <div
        className={`w-full md:w-[44%] ms-16 md:ms-0 ${
          isEven
            ? 'md:text-right rtl:md:text-left md:pe-8'
            : 'md:text-left rtl:md:text-right md:ps-8'
        }`}
      >
        <div
          className={`p-6 sm:p-7 rounded-[18px] bg-[#111111]/90 border border-white/[0.08] backdrop-blur-xl transition-all duration-300 hover:border-[#00FF88]/40 hover:shadow-[0_0_25px_rgba(0,255,136,0.18)] ${
            isVisible ? 'border-white/15' : 'border-white/[0.06]'
          }`}
        >
          <div
            className={`flex items-center gap-3 mb-3 ${
              isEven
                ? 'md:justify-end rtl:md:justify-start'
                : 'md:justify-start rtl:md:justify-end'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                isVisible
                  ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 shadow-[0_0_12px_rgba(0,255,136,0.25)]'
                  : 'bg-white/5 text-[#A1A1AA] border border-white/10'
              }`}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-bold text-white tracking-tight">
              {step.title}
            </h3>
          </div>

          <p className="text-sm text-[#A1A1AA] leading-relaxed font-normal">
            {step.description}
          </p>
        </div>
      </div>

      {/* Empty spacer for desktop symmetry */}
      <div className="hidden md:block w-[44%]" aria-hidden="true" />
    </div>
  );
};

export const Process = ({ t }) => {
  return (
    <section id="process" className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FF88]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <SectionTitle
          badge={t.process.badge}
          title={t.process.title}
          subtitle={t.process.subtitle}
          className="mb-20 text-center"
        />

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Continuous Glowing Neon Green Connecting Line */}
          <div
            className="absolute start-6 rtl:end-auto md:start-1/2 -translate-x-1/2 rtl:translate-x-1/2 md:rtl:translate-x-1/2 top-6 bottom-6 w-[2px] bg-gradient-to-b from-transparent via-[#00FF88]/50 to-transparent shadow-[0_0_12px_rgba(0,255,136,0.4)] pointer-events-none"
            aria-hidden="true"
          />

          {/* Steps */}
          <div className="space-y-12 md:space-y-16 relative">
            {t.process.steps.map((step, idx) => (
              <TimelineStep
                key={step.step}
                step={step}
                index={idx}
                isLast={idx === t.process.steps.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;

