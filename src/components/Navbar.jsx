import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Globe, ArrowUpRight } from 'lucide-react';
import Button from './common/Button';

export const Navbar = ({ t, currentLang, onToggleLang, currentRoute = '/', onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    if (currentRoute !== '/') {
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Determine active section for nav highlight on homepage
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

  // Lock body scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
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

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLinkClick = (e, href) => {
    closeMenu();

    if (href === '/contact') {
      e.preventDefault();
      if (onNavigate) {
        onNavigate('/contact');
      } else {
        window.location.href = '/contact';
      }
      return;
    }

    if (href === '/projects') {
      e.preventDefault();
      if (onNavigate) {
        onNavigate('/projects');
      } else {
        window.location.href = '/projects';
      }
      return;
    }

    if (href.startsWith('#')) {
      if (currentRoute !== '/') {
        e.preventDefault();
        if (onNavigate) {
          onNavigate('/');
          // Wait for homepage render then scroll
          setTimeout(() => {
            const targetEl = document.getElementById(href.replace('#', ''));
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      }
    }
  };

  const handleCtaClick = (e) => {
    e.preventDefault();
    closeMenu();
    if (onNavigate) {
      onNavigate('/contact');
    } else {
      window.location.href = '/contact';
    }
  };

  const isContactPage = currentRoute === '/contact';

  return (
    <header
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
          <nav className="hidden lg:flex items-center gap-1 lg:gap-2 bg-[#111111]/70 border border-white/[0.06] backdrop-blur-md px-3 py-1.5 rounded-full" aria-label={t.nav.mainNavAria || 'Main navigation'}>
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

          {/* Right actions: Language Switcher + CTA — visible only at lg+ */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
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

            {/* Neon Green "Start a Project" Button -> Opens /contact */}
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

          {/* Mobile/Tablet top-bar: Language Switcher + "Start a Project" button + Hamburger */}
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

            {/* "Start a Project" always visible in top bar */}
            <Button
              href="/contact"
              onClick={handleCtaClick}
              variant="primary"
              size="sm"
              className="font-semibold text-xs shadow-[0_0_15px_rgba(0,255,136,0.35)] whitespace-nowrap"
            >
              {t.nav.cta}
            </Button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#A1A1AA] hover:text-white bg-[#111111] border border-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
              aria-label={mobileMenuOpen ? t.nav.menuToggleClose : t.nav.menuToggleOpen}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#00FF88]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu Overlay — hides at lg+ */}
      <div
        className={`fixed inset-0 top-[65px] bg-[#0A0A0A]/95 backdrop-blur-2xl lg:hidden transition-all duration-300 ease-in-out z-40 border-t border-white/[0.08] flex flex-col justify-between p-6 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'
        }`}
      >
        <div className="flex flex-col gap-2 pt-4">
          {t.nav.links.map((link) => {
            const isContactLink = link.href === '/contact' || link.href === '#contact';
            const isContactActive = isContactLink && isContactPage;

            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-lg font-medium px-4 py-3 rounded-xl transition-colors duration-200 border flex items-center justify-between ${
                  isContactActive
                    ? 'text-[#00FF88] bg-[#00FF88]/15 border-[#00FF88]/40 shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                    : 'text-[#A1A1AA] hover:text-[#00FF88] hover:bg-white/[0.04] border-transparent hover:border-white/[0.06]'
                }`}
              >
                <span>{link.name}</span>
                <ArrowUpRight className="w-4 h-4 opacity-50 rtl:rotate-180" />
              </a>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pb-8 border-t border-white/[0.08] pt-6">
          <div className="flex items-center justify-between px-2 text-sm text-[#A1A1AA]">
            <span>{t.nav.languageMenuLabel || 'Language'}:</span>
            <button
              type="button"
              onClick={() => {
                onToggleLang();
                closeMenu();
              }}
              className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[#111111] border border-[#00FF88]/50 text-[#00FF88]"
            >
              {t.nav.languageLabel}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
