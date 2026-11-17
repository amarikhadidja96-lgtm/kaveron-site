import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from './common/Button';
import Badge from './common/Badge';

export const CtaBanner = ({ t, onNavigate }) => {
  const handleStartProject = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/contact');
    } else {
      window.location.href = '/contact';
    }
  };
  return (
    <section className="relative py-20 md:py-28 bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Large Glass Banner */}
        <div className="relative rounded-[24px] sm:rounded-[32px] bg-gradient-to-b from-[#141414] to-[#0E0E0E] border border-white/10 p-8 sm:p-14 lg:p-20 overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.15)] text-center flex flex-col items-center">
          {/* Internal ambient glowing radial orb */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[250px] sm:h-[350px] bg-[#00FF88]/15 rounded-full blur-[100px]" />

          {/* Glowing perimeter border highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/60 to-transparent" />

          <div className="relative z-10 max-w-3xl flex flex-col items-center">
            {/* Small Badge */}
            <Badge className="mb-6">
              {t.ctaBanner.badge}
            </Badge>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              {t.ctaBanner.headline}
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl leading-relaxed mb-10 font-normal">
              {t.ctaBanner.subtitle}
            </p>

            {/* CTA Button */}
            <Button
              href="/contact"
              onClick={handleStartProject}
              variant="primary"
              size="lg"
              className="text-base sm:text-lg font-bold px-9 py-4 group shadow-[0_0_30px_rgba(0,255,136,0.45)] hover:shadow-[0_0_45px_rgba(0,255,136,0.7)]"
            >
              <span>{t.ctaBanner.buttonText}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;

