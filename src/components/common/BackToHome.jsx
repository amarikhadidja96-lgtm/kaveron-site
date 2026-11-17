import React from 'react';
import { ArrowLeft, ArrowRight, Home, ChevronRight } from 'lucide-react';

/**
 * BackToHome — reusable back button + optional breadcrumb for inner pages.
 *
 * Props:
 *   onNavigate   – router navigate function (required)
 *   isRtl        – boolean (true for Arabic)
 *   label        – back button label text (e.g. "Back to Home")
 *   breadcrumbs  – optional array: [{ label, href }] — the last item is the current page (not linked)
 *                  e.g. [{ label: 'Home', href: '/' }, { label: 'Projects' }]
 */
const BackToHome = ({ onNavigate, isRtl = false, label, breadcrumbs }) => {
  const Arrow = isRtl ? ArrowRight : ArrowLeft;

  const handleHome = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0 });
    onNavigate?.('/');
  };

  const handleNav = (e, href) => {
    if (!href) return;
    e.preventDefault();
    window.scrollTo({ top: 0 });
    onNavigate?.(href);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-10">
      {/* Back button — neon green outlined pill */}
      <a
        href="/"
        onClick={handleHome}
        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent border border-[#00FF88]/40 text-xs font-mono text-[#00FF88] hover:bg-[#00FF88]/10 hover:border-[#00FF88] hover:shadow-[0_0_14px_rgba(0,255,136,0.35)] transition-all duration-200 self-start"
        aria-label={label}
      >
        <Arrow className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
        <span>{label}</span>
      </a>

      {/* Breadcrumb — optional */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#52525B]">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <ChevronRight className="w-3 h-3 text-[#3F3F46] rtl:rotate-180 shrink-0" />
                )}
                {isLast || !crumb.href ? (
                  <span className="text-[#A1A1AA]">{crumb.label}</span>
                ) : (
                  <a
                    href={crumb.href}
                    onClick={(e) => handleNav(e, crumb.href)}
                    className="hover:text-[#00FF88] transition-colors duration-150"
                  >
                    {crumb.label}
                  </a>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default BackToHome;

