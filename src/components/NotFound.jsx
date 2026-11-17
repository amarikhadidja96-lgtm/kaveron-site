import React from 'react';
import { Home, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Badge from './common/Badge';
import Button from './common/Button';

export const NotFound = ({ t, currentLang, onBackToHome, onNavigateToContact }) => {
  const isRtl = currentLang === 'ar';
  const notFoundT = t.notFoundPage;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-24 md:py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FF88]/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <Badge className="mb-6">{notFoundT.badge}</Badge>

        {/* 404 Cyber Glitch / Code Display */}
        <div className="text-7xl sm:text-8xl md:text-9xl font-mono font-extrabold text-white tracking-tighter mb-4 select-none">
          <span className="text-[#00FF88]">&lt;</span>
          404
          <span className="text-[#00FF88]">&#47;&gt;</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3 tracking-tight">
          {notFoundT.title}
        </h1>

        <p className="text-base text-[#A1A1AA] leading-relaxed mb-8 max-w-md mx-auto font-normal">
          {notFoundT.description}
        </p>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToHome?.();
            }}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto font-semibold px-8 shadow-[0_0_20px_rgba(0,255,136,0.35)]"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <Home className="w-4 h-4" />}
            <span>{notFoundT.backHome}</span>
          </Button>

          <Button
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToContact?.();
            }}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8"
          >
            <Mail className="w-4 h-4" />
            <span>{notFoundT.contactUs}</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;

