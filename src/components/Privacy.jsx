import React from 'react';
import { ShieldCheck, ArrowLeft, ArrowRight, Lock, FileText } from 'lucide-react';
import Badge from './common/Badge';
import Button from './common/Button';

export const Privacy = ({ t, currentLang, onBackToHome }) => {
  const isRtl = currentLang === 'ar';
  const privacyT = t.privacyPage;

  return (
    <section className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden min-h-[85vh]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00FF88]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-8">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onBackToHome?.();
            }}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] hover:text-[#00FF88] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88] rounded-lg p-1"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{privacyT.backHome}</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-12">
          <Badge className="mb-4">{privacyT.badge}</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight mb-4">
            {privacyT.title}
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mb-2">
            {privacyT.subtitle}
          </p>
          <p className="text-xs font-mono text-[#71717A]">
            {privacyT.lastUpdated}
          </p>
        </div>

        {/* Content Clauses */}
        <div className="space-y-6">
          {privacyT.sections.map((sec, idx) => (
            <article
              key={idx}
              className="p-6 sm:p-8 rounded-[20px] bg-[#111111]/90 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden transition-all duration-200 hover:border-white/15"
            >
              {/* Subtle top edge line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/30 to-transparent" />

              <h2 className="text-lg sm:text-xl font-heading font-bold text-white mb-3 tracking-tight flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00FF88] shrink-0" />
                <span>{sec.heading}</span>
              </h2>
              <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed font-normal">
                {sec.content}
              </p>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p dir="ltr" className="text-xs text-[#71717A]">
            Kaveron Agency • hello@kaveron.com
          </p>
          <Button
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToHome?.();
            }}
            variant="outline"
            size="sm"
          >
            {privacyT.backHome}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Privacy;

