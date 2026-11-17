import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, ArrowRight, ChevronLeft, ChevronRight, Calendar, User, Tag, Sparkles } from 'lucide-react';
import Button from './common/Button';

export const ProjectModal = ({
  project,
  projects = [],
  isOpen,
  onClose,
  onNavigate,
  onNavigateToRoute,
  t,
  isRtl,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const modalContentRef = useRef(null);

  // Reset active image when project changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [project?.id]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modalEl = modalContentRef.current;
    if (modalEl) {
      const focusableElements = modalEl.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];
      if (firstEl) firstEl.focus();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl?.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl?.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, project?.id, onClose]);

  if (!isOpen || !project) return null;

  const images = project.images && project.images.length > 0 ? project.images : [];
  const currentImage = images[activeImageIdx] || images[0] || '';
  const hasMultipleProjects = projects.length > 1;

  // Previous & Next Project Navigation
  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const goToPrevProject = () => {
    if (!hasMultipleProjects) return;
    const prevIdx = (currentIndex - 1 + projects.length) % projects.length;
    onNavigate?.(projects[prevIdx]);
  };
  const goToNextProject = () => {
    if (!hasMultipleProjects) return;
    const nextIdx = (currentIndex + 1) % projects.length;
    onNavigate?.(projects[nextIdx]);
  };

  // Image Navigation
  const prevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };
  const nextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  // Mobile Swipe on Main Image
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 40) {
      if (distance > 0) {
        // Swiped left
        if (isRtl) prevImage();
        else nextImage();
      } else {
        // Swiped right
        if (isRtl) nextImage();
        else prevImage();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleStartSimilar = () => {
    onClose();
    const targetUrl = `/contact?project=${encodeURIComponent(project.title)}`;
    if (onNavigateToRoute) {
      onNavigateToRoute(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };

  const modalT = t.projectsSection.modal;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[22px] sm:rounded-[28px] bg-[#111111] border border-white/[0.12] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300"
      >
        {/* Subtle Top Neon Border Accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF88] to-transparent shadow-[0_0_12px_rgba(0,255,136,0.5)] z-20" />

        {/* Modal Top Bar: Category / Concept Badge / Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#141414]/90 z-10 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4D4D8]">
              {project.category}
            </span>

            {project.is_concept && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full border border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10 tracking-wider">
                {t.projectsSection.conceptBadge}
              </span>
            )}

            <span className="font-mono text-xs text-[#71717A] hidden sm:inline">
              // {project.year}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Show Prev/Next project buttons only when more than one project exists */}
            {hasMultipleProjects && (
              <div className="flex items-center gap-1 me-2">
                <button
                  type="button"
                  onClick={isRtl ? goToNextProject : goToPrevProject}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-white hover:border-[#00FF88]/40 transition-colors"
                  aria-label={modalT.prevAria}
                  title={modalT.prevAria}
                >
                  {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={isRtl ? goToPrevProject : goToNextProject}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-white hover:border-[#00FF88]/40 transition-colors"
                  aria-label={modalT.nextAria}
                  title={modalT.nextAria}
                >
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/50 hover:bg-[#00FF88]/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
              aria-label={modalT.closeAria}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-8 flex-1">
          {/* 1. Image Gallery */}
          {images.length > 0 && (
            <div className="space-y-3">
              {/* Main Image — fixed 16/9 ratio, object-cover object-top */}
              <div
                className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#0D0D0D] border border-white/10 shadow-lg select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={currentImage}
                  alt={`${project.title} screenshot ${activeImageIdx + 1}`}
                  width="1280"
                  height="720"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain transition-opacity duration-300"
                />

                {/* Edge Navigation Arrows for gallery on desktop */}
                {images.length > 1 && (
                  <div className="hidden sm:flex items-center justify-between absolute inset-y-0 inset-x-3 pointer-events-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        isRtl ? nextImage() : prevImage();
                      }}
                      className="pointer-events-auto p-2 rounded-full bg-black/70 border border-white/20 text-white hover:text-[#00FF88] hover:border-[#00FF88] transition-colors"
                      aria-label={modalT.prevImageAria || 'Previous image'}
                    >
                      {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        isRtl ? prevImage() : nextImage();
                      }}
                      className="pointer-events-auto p-2 rounded-full bg-black/70 border border-white/20 text-white hover:text-[#00FF88] hover:border-[#00FF88] transition-colors"
                      aria-label={modalT.nextImageAria || 'Next image'}
                    >
                      {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {/* Image Counter Badge */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm border border-white/15 font-mono text-xs text-white">
                    {activeImageIdx + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails Row — show full image in thumb */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 sm:w-24 aspect-[16/10] rounded-lg overflow-hidden border transition-all duration-200 shrink-0 ${
                        idx === activeImageIdx
                          ? 'border-[#00FF88] shadow-[0_0_12px_rgba(0,255,136,0.35)] scale-105'
                          : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                      }`}
                      style={{ background: '#141414' }}
                    >
                      <img
                        src={img}
                        alt={`${modalT.thumbnailAlt || 'Thumbnail'} ${idx + 1}`}
                        width="160"
                        height="100"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Project Title & Overview */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight mb-4">
              {project.title}
            </h2>
            <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-normal">
              {project.description}
            </p>
          </div>

          {/* 3. Meta Specs Row: Client, Year, Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#161616] border border-white/[0.06]">
            <div>
              <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider block mb-1">
                {modalT.clientLabel}
              </span>
              <span className="text-sm font-semibold text-white">
                {project.client_name}
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider block mb-1">
                {modalT.yearLabel}
              </span>
              <span className="text-sm font-semibold text-white">
                {project.year}
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider block mb-1">
                {modalT.techStackLabel}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.tech_stack?.map((tech, i) => (
                  <span
                    key={i}
                    className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#E4E4E7]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Three Case Study Sections: Challenge, Solution, Result */}
          <div className="space-y-6 pt-2 border-t border-white/[0.08]">
            {/* Challenge */}
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-bold text-[#00FF88] flex items-center gap-2">
                <span className="font-mono text-xs text-[#00FF88]">// 01</span>
                <span>{modalT.challengeHeading}</span>
              </h3>
              <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                {project.challenge}
              </p>
            </div>

            {/* Solution */}
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-bold text-[#00FF88] flex items-center gap-2">
                <span className="font-mono text-xs text-[#00FF88]">// 02</span>
                <span>{modalT.solutionHeading}</span>
              </h3>
              <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                {project.solution}
              </p>
            </div>

            {/* Result */}
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-bold text-[#00FF88] flex items-center gap-2">
                <span className="font-mono text-xs text-[#00FF88]">// 03</span>
                <span>{modalT.resultHeading}</span>
              </h3>
              <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                {project.result}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Sticky Action Footer */}
        <div className="p-5 sm:p-6 border-t border-white/[0.08] bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {project.project_url && (
            <Button
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="md"
              className="w-full sm:w-auto font-semibold px-6 shadow-[0_0_20px_rgba(0,255,136,0.35)]"
            >
              <span>{modalT.visitButton}</span>
              <ExternalLink className="w-4 h-4 ms-1.5" />
            </Button>
          )}

          <Button
            onClick={handleStartSimilar}
            variant="outline"
            size="md"
            className="w-full sm:w-auto px-6"
          >
            <span>{modalT.startSimilarButton}</span>
            <ArrowRight className="w-4 h-4 ms-1.5 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;

