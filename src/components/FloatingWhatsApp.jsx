import React from 'react';
import { MessageSquare } from 'lucide-react';

export const FloatingWhatsApp = ({ currentLang }) => {
  const isRtl = currentLang === 'ar';
  const whatsappNumber = '213657401196';
  const prefilledMessage = encodeURIComponent(
    isRtl
      ? 'مرحباً كافيرون، أود الاستفسار عن خدماتكم وتطوير مشروع رقمي.'
      : 'Hello Kaveron, I would like to inquire about your digital agency services.'
  );

  return (
    <aside
      aria-label="WhatsApp Direct Support"
      className="fixed bottom-6 left-6 rtl:right-6 rtl:left-auto z-40"
    >
      <a
        href={`https://wa.me/${whatsappNumber}?text=${prefilledMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#111111] border border-[#00FF88]/40 text-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.55)] hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
        aria-label="Chat on WhatsApp"
        title="Chat with Kaveron on WhatsApp"
      >
        {/* Subtle Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#00FF88]/20 animate-ping opacity-60 pointer-events-none" />

        {/* WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7 transition-transform group-hover:scale-105"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>

        {/* Hover Tooltip Pill */}
        <span
          className={`absolute bottom-full mb-2 hidden group-hover:block px-3 py-1.5 rounded-lg bg-[#111111] border border-white/10 text-xs font-mono text-white whitespace-nowrap shadow-xl ${isRtl ? 'right-0' : 'left-0'
            }`}
        >
          WhatsApp Direct
        </span>
      </a>
    </aside>
  );
};

export default FloatingWhatsApp;

