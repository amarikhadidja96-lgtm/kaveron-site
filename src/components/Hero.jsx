import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ChevronsDown } from 'lucide-react';
import Button from './common/Button';
import Badge from './common/Badge';
import { EASE_OUT_EXPO, staggerContainer, slideUp } from '../utils/motion';

const AnimatedCounter = ({ endValue, duration = 1400 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(endValue);
      return;
    }
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    let frameId;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.floor(ease * endValue));
      if (p < 1) frameId = requestAnimationFrame(animate);
      else setCount(endValue);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [started, endValue, duration]);

  return <span ref={ref}>{count}</span>;
};

const CursorGlow = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 25 });
  const springY = useSpring(y, { stiffness: 60, damping: 25 });

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducedMotion) return;
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 hidden md:block"
      aria-hidden
    >
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </motion.div>
  );
};

const containerVariants = staggerContainer(0.1, 0.1);
const itemVariants = slideUp(0);

export const Hero = ({ t, onNavigate }) => {
  const isRtl = document.documentElement.dir === 'rtl';
  const handleStartProject = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate('/contact');
    else window.location.href = '/contact';
  };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden"
    >
      {/* Cursor glow (desktop only, no reduced-motion) */}
      <CursorGlow />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-[#00FF88]/[0.07] rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 left-1/4 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[#00FF88]/[0.04] rounded-full blur-[100px] pointer-events-none animate-float-slow" />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0A_80%)] pointer-events-none" />

      <motion.div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div className="mb-6 sm:mb-8" variants={itemVariants}>
          <Badge>{t.hero.badge}</Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-fluid-hero font-heading font-extrabold text-white max-w-5xl mb-6"
          variants={itemVariants}
        >
          <span>{t.hero.headlineStart}</span>
          <span className="text-[#00FF88] drop-shadow-[0_0_25px_rgba(0,255,136,0.4)]">
            {t.hero.headlineHighlight1}
          </span>
          <span>{t.hero.headlineMiddle}</span>
          <span className="text-[#00FF88] drop-shadow-[0_0_25px_rgba(0,255,136,0.4)]">
            {t.hero.headlineHighlight2}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-fluid-body text-[#A1A1AA] max-w-2xl sm:max-w-3xl leading-relaxed mb-10 font-normal"
          variants={itemVariants}
        >
          {t.hero.subtitle}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16 sm:mb-20"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Button
              href="/contact"
              onClick={handleStartProject}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-semibold px-8 py-3.5 group"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Button
              href="/projects"
              onClick={(e) => { e.preventDefault(); onNavigate('/projects'); }}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-3.5"
            >
              {t.hero.secondaryCta}
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div className="w-full max-w-3xl pt-8 border-t border-white/[0.08]" variants={itemVariants}>
          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            {t.hero.stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-3 rounded-2xl bg-[#111111]/40 border border-white/[0.04] backdrop-blur-sm"
              >
                <div dir="ltr" className="text-xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white flex items-center justify-center gap-0.5 mb-1 leading-tight">
                  {stat.isNumber ? (
                    <>
                      <AnimatedCounter endValue={stat.value} />
                      {stat.suffix && <span className="text-[#00FF88]">{stat.suffix}</span>}
                    </>
                  ) : (
                    <span className="text-[#00FF88] text-lg sm:text-2xl lg:text-3xl">{stat.display}</span>
                  )}
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-[#A1A1AA] text-center leading-snug px-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-1 text-[#3f3f46] cursor-default select-none"
          variants={itemVariants}
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronsDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
