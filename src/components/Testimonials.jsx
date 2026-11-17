import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import SectionTitle from './common/SectionTitle';
import { getTestimonialsByLang } from '../data/testimonials';

export const Testimonials = ({ t, currentLang }) => {
  const testimonials = getTestimonialsByLang(currentLang);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const total = testimonials.length;
  const isRtl = currentLang === 'ar';

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Autoplay functionality
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, total]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 45;

    if (isSwipe) {
      if (distance > 0) {
        // Swiped left
        if (isRtl) {
          prevSlide();
        } else {
          nextSlide();
        }
      } else {
        // Swiped right
        if (isRtl) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activeTestimonial = testimonials[currentIndex] || testimonials[0];

  return (
    <section
      id="testimonials"
      className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-[#00FF88]/[0.03] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge={t.testimonialsSection.badge}
          title={t.testimonialsSection.title}
          subtitle={t.testimonialsSection.subtitle}
          className="mb-16 text-center"
        />

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto">
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Active Testimonial Glass Card */}
            <div className="relative rounded-[22px] bg-[#111111]/90 border border-white/[0.08] backdrop-blur-xl p-8 sm:p-12 shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-[#00FF88]/30">
              {/* Subtle top neon border accent */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/40 to-transparent" />

              <div className="flex flex-col gap-6">
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5" aria-label="5 out of 5 stars">
                    {[...Array(activeTestimonial.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-[#00FF88] fill-[#00FF88] drop-shadow-[0_0_6px_rgba(0,255,136,0.5)]"
                      />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-[#00FF88]/20" />
                </div>

                {/* Quote Text */}
                <blockquote className="text-lg sm:text-2xl text-white font-heading font-medium leading-relaxed italic">
                  "{activeTestimonial.quote}"
                </blockquote>

                {/* Author Info & Avatar */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                  {/* Circular Avatar Placeholder */}
                  <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#00FF88] to-transparent shrink-0">
                    <img
                      src={activeTestimonial.avatar}
                      alt={activeTestimonial.name}
                      width="56"
                      height="56"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full rounded-full object-cover bg-[#1A1A1A]"
                      onError={(e) => {
                        // Fallback avatar icon if image fails
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'text-[#00FF88]', 'font-mono', 'font-bold');
                        e.target.parentElement.innerText = activeTestimonial.name.charAt(0);
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
                      {activeTestimonial.name}
                    </span>
                    <span className="text-xs sm:text-sm text-[#A1A1AA]">
                      {activeTestimonial.role}
                    </span>
                  </div>

                  {activeTestimonial.companyLogoText && (
                    <div className="ms-auto hidden sm:block font-mono text-xs text-[#71717A] tracking-widest px-3 py-1 rounded bg-white/[0.03] border border-white/[0.05]">
                      {activeTestimonial.companyLogoText}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex items-center justify-between absolute inset-y-0 -left-6 -right-6 pointer-events-none">
              <button
                type="button"
                onClick={isRtl ? nextSlide : prevSlide}
                className="pointer-events-auto w-11 h-11 rounded-full bg-[#111111]/90 border border-white/10 text-white hover:text-[#00FF88] hover:border-[#00FF88]/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] backdrop-blur-md flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
                aria-label={t.testimonialsSection.prevLabel}
              >
                {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={isRtl ? prevSlide : nextSlide}
                className="pointer-events-auto w-11 h-11 rounded-full bg-[#111111]/90 border border-white/10 text-white hover:text-[#00FF88] hover:border-[#00FF88]/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] backdrop-blur-md flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
                aria-label={t.testimonialsSection.nextLabel}
              >
                {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Pagination Dots & Mobile Navigation Controls */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={isRtl ? nextSlide : prevSlide}
              className="md:hidden p-2 rounded-xl bg-[#111111] border border-white/10 text-[#A1A1AA] hover:text-white"
              aria-label={t.testimonialsSection.prevLabel}
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88] ${
                    idx === currentIndex
                      ? 'w-8 bg-[#00FF88] shadow-[0_0_12px_rgba(0,255,136,0.5)]'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={isRtl ? prevSlide : nextSlide}
              className="md:hidden p-2 rounded-xl bg-[#111111] border border-white/10 text-[#A1A1AA] hover:text-white"
              aria-label={t.testimonialsSection.nextLabel}
            >
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

