/**
 * Shared Framer Motion variants and Lenis smooth-scroll setup.
 * All animations respect prefers-reduced-motion.
 */

// ── Check for reduced motion preference ─────────────────────────
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Ease curves ──────────────────────────────────────────────────
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];
export const EASE_SPRING = { type: 'spring', stiffness: 300, damping: 30 };

// ── Fade-in variant ──────────────────────────────────────────────
export const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO, delay },
  },
});

// ── Slide-up variant ─────────────────────────────────────────────
export const slideUp = (delay = 0, distance = 24) => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay },
  },
});

// ── Stagger container ────────────────────────────────────────────
export const staggerContainer = (stagger = 0.07, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// ── Scale + fade (for modals, chat, etc.) ───────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// ── Page transition ──────────────────────────────────────────────
export const pageFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ── Card hover spring ────────────────────────────────────────────
export const cardHover = {
  rest: { y: 0, boxShadow: '0 0 0px rgba(0,255,136,0)' },
  hover: {
    y: -6,
    boxShadow: '0 0 30px rgba(0,255,136,0.2)',
    transition: EASE_SPRING,
  },
};
