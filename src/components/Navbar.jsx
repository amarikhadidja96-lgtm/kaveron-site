import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Menu, X, Globe, ArrowUpRight } from 'lucide-react';
import Button from './common/Button';

export const Navbar = ({ t, currentLang, onToggleLang, currentRoute = '/', onNavigate, onMenuToggle }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [headerHeight, setHeaderHeight] = useState(72);
  const headerRef = useRef(null);
  const isRtl = currentLang === 'ar';
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Track header height so overlay top aligns perfectly
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isScrolled]);

  useEffect(() => {
    if (currentRoute !== '/') return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = ['home', 'services', 'projects', 'pricing', 'process'];
      const scrollPosition = window.scrollY + 120;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentRoute]);

  // Lock body scroll + Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Measure header height when menu opens
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.clientHeight);
      }
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  // Notify parent about menu state (to hide floating buttons)
  useEffect(() => {
    onMenuToggle?.(mobileMenuOpen);
  }, [mobileMenuOpen, onMenuToggle]);

  // Close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentRoute]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLinkClick = (e, href) => {
    closeMenu();
    if (href === '/contact') {
      e.preventDefault();
      if (onNavigate) onNavigate('/contact');
      else window.location.href = '/contact';
      return;
    }
    if (href === '/projects') {
      e.preventDefault();
      if (onNavigate) onNavigate('/projects');
      else window.location.href = '/projects';
      return;
    }
    if (href.startsWith('#')) {
      if (currentRoute !== '/') {
        e.preventDefault();
        if (onNavigate) {
          onNavigate('/');
          setTimeout(() => {
            const targetEl = document.getElementById(href.replace('#', ''));
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  };

  const handleCtaClick = (e) => {
    e.preventDefault();
    closeMenu();
    if (onNavigate) onNavigate('/contact');
    else window.location.href = '/contact';
  };

  const isContactPage = currentRoute === '/contact';

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled || isContactPage
            ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/40 py-3.5'
            : 'bg-[#0A0A0A]/40 backdrop-blur-sm border-b border-transparent py-5'
        }`}
      >
        {/* Scroll progress bar */}
        <motion.div
          className="absolute top-0 start-0 h-[2px] bg-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.7)] origin-[start]"
          style={{ width: progressWidth, scaleX: 1 }}
          aria-hidden
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="/"
              dir="ltr"
              onClick={(e) => {
                if (currentRoute !== '/') {
                  e.preventDefault();
                  onNavigate?.('/');
                }
              }}
              className="group flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88] rounded-lg p-1"
              aria-label={t.nav.homeAria || 'kaveron home'}
            >
              <span className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-white transition-colors duration-200 group-hover:text-white">
                <span className="text-[#00FF88] font-mono group-hover:drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]">
                  &lt;
                </span>
                kaveron
                <span className="text-[#00FF88] font-mono group-hover:drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]">
                  &#47;&gt;
                </span>
              </span>
            </a>

            {/* Desktop Navigation Links — visible only at lg+ */}
            <nav
              className="hidden lg:flex items-center gap-1 lg:gap-2 bg-[#111111]/70 border border-white/[0.06] backdrop-blur-md px-3 py-1.5 rounded-full"
              aria-label={t.nav.mainNavAria || 'Main navigation'}
            >
              {t.nav.links.map((link) => {
                const isContactLink = link.href === '/contact' || link.href === '#contact';
                const isContactActive = isContactLink && isContactPage;
                const isSectionActive = !isContactPage && activeSection === link.href.replace('#', '');
                const isActive = isContactActive || isSectionActive;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`text-xs lg:text-sm font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                      isContactActive
                        ? 'text-[#00FF88] bg-[#00FF88]/15 border border-[#00FF88]/40 shadow-[0_0_12px_rgba(0,255,136,0.35)] font-semibold'
                        : isActive
                        ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(0,255,136,0.15)] font-semibold'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </nav>

            {/* Right actions: Language Switcher + CTA — desktop only */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                onClick={onToggleLang}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg text-[#A1A1AA] hover:text-white bg-[#111111] border border-white/[0.08] hover:border-[#00FF88]/40 hover:shadow-[0_0_10px_rgba(0,255,136,0.2)] transition-all duration-200"
                aria-label={`${t.nav.switchLanguagePrefix || 'Switch language to '}${t.nav.languageLabel}`}
                title={`${t.nav.switchLanguagePrefix || 'Switch language to '}${t.nav.languageLabel}`}
              >
                <Globe className="w-3.5 h-3.5 text-[#00FF88]" />
                <span className="tracking-wider">{t.nav.languageSwitch}</span>
              </button>
              <Button
                href="/contact"
                onClick={handleCtaClick}
                variant="primary"
                size="sm"
                className="font-semibold text-xs lg:text-sm shadow-[0_0_15px_rgba(0,255,136,0.35)]"
              >
                {t.nav.cta}
              </Button>
            </div>

            {/* Mobile/Tablet top-bar: Language Switcher + Hamburger only (no CTA here) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={onToggleLang}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg text-[#A1A1AA] hover:text-white bg-[#111111] border border-white/[0.08]"
                aria-label={`${t.nav.switchLanguagePrefix || 'Switch language to '}${t.nav.languageLabel}`}
              >
                <Globe className="w-3.5 h-3.5 text-[#00FF88]" />
                <span>{t.nav.languageSwitch}</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="p-2 rounded-xl text-[#A1A1AA] hover:text-white bg-[#111111] border border-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
                aria-label={mobileMenuOpen ? t.nav.menuToggleClose : t.nav.menuToggleOpen}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#00FF88]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Menu Overlay ───────────────────────────────────────────────
          Rendered OUTSIDE <header> so its z-index is not constrained by the
          header's stacking context. z-[60] > floating buttons z-40.
      ──────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.mainNavAria || 'Mobile navigation'}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
            // Respect reduced motion
            style={{
              top: headerHeight,
              // @media (prefers-reduced-motion) handled via motion props below
            }}
            className="fixed inset-x-0 bottom-0 z-[60] lg:hidden flex flex-col bg-[#0A0A0A] overflow-y-auto"
          >
            {/* Thin accent line at the top of the overlay */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#00FF88]/40 to-transparent shrink-0" />

            {/* Nav links */}
            <nav
              className="flex flex-col gap-1 p-4 pt-6 flex-1"
              aria-label={t.nav.mainNavAria || 'Main navigation'}
            >
              {t.nav.links.map((link) => {
                const isContactLink = link.href === '/contact' || link.href === '#contact';
                const isContactActive = isContactLink && isContactPage;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`flex items-center justify-between min-h-[52px] px-4 py-3 rounded-xl transition-colors duration-200 border text-lg font-medium ${
                      isContactActive
                        ? 'text-[#00FF88] bg-[#00FF88]/15 border-[#00FF88]/40 shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                        : 'text-[#D4D4D8] hover:text-[#00FF88] hover:bg-white/[0.04] border-transparent hover:border-white/[0.06]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {/* Arrow flips in RTL */}
                    <ArrowUpRight
                      className={`w-4 h-4 opacity-50 shrink-0 ${isRtl ? 'rotate-[270deg]' : ''}`}
                    />
                  </a>
                );
              })}
            </nav>

            {/* Bottom: Language switcher + CTA */}
            <div className="p-4 pb-10 border-t border-white/[0.08] flex flex-col gap-4 shrink-0">
              {/* Language row */}
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-[#71717A]">
                  {t.nav.languageMenuLabel || 'Language'}:
                </span>
                <div className="flex items-center gap-1 bg-[#111111] border border-white/[0.08] rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentLang !== 'en') {
                        onToggleLang();
                        closeMenu();
                      }
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all duration-200 ${
                      currentLang === 'en'
                        ? 'bg-[#00FF88] text-[#0A0A0A]'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentLang !== 'ar') {
                        onToggleLang();
                        closeMenu();
                      }
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all duration-200 ${
                      currentLang === 'ar'
                        ? 'bg-[#00FF88] text-[#0A0A0A]'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    AR
                  </button>
                </div>
              </div>

              {/* Start a Project — once, at the bottom of the menu */}
              <Button
                href="/contact"
                onClick={handleCtaClick}
                variant="primary"
                size="md"
                className="w-full font-semibold shadow-[0_0_20px_rgba(0,255,136,0.35)] justify-center"
              >
                {t.nav.cta}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
