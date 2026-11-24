import React from 'react';
import { Mail, Globe, ArrowUp, MessageSquare } from 'lucide-react';
import { contactConfig, isPlaceholder, getWhatsAppLink } from '../config/contact.config';

// Crisp, pixel-perfect SVGs for brand socials
const SocialIcons = {
  Linkedin: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  Instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Twitter: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  ),
  Github: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
};

export const Footer = ({ t, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLink = (e, href) => {
    if (href.startsWith('/')) {
      e.preventDefault();
      onNavigate?.(href) || (window.location.href = href);
    }
  };

  const currentYear = new Date().getFullYear();
  const isRtl = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;

  const hasEmail = Boolean(contactConfig.email && !isPlaceholder(contactConfig.email));
  const whatsappUrl = getWhatsAppLink(isRtl ? 'ar' : 'en');
  const hasWhatsApp = Boolean(whatsappUrl);

  const socialList = [
    { name: 'LinkedIn', icon: 'Linkedin', href: contactConfig.socials?.linkedin },
    { name: 'Instagram', icon: 'Instagram', href: contactConfig.socials?.instagram },
    { name: 'X (Twitter)', icon: 'Twitter', href: contactConfig.socials?.twitter },
    { name: 'GitHub', icon: 'Github', href: contactConfig.socials?.github },
  ].filter((s) => Boolean(s.href && !isPlaceholder(s.href)));

  return (
    <footer className="relative bg-[#0A0A0A] border-t border-white/[0.08] pt-16 pb-28 md:pb-32 overflow-hidden">
      {/* Soft neon accent glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#00FF88]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/[0.06]">
          {/* Brand & Description (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <a
              href="/"
              onClick={(e) => handleLink(e, '/')}
              className="group flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88] rounded-lg p-1 mb-4"
              aria-label={t.footer.homeAria || 'kaveron home'}
            >
              <span className="text-2xl font-heading font-extrabold tracking-tight text-white">
                <span className="text-[#00FF88] font-mono">&lt;</span>
                kaveron
                <span className="text-[#00FF88] font-mono">&#47;&gt;</span>
              </span>
            </a>

            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-sm mb-6 font-normal">
              {t.footer.description}
            </p>

            {/* Contact badges (Email & WhatsApp - rendered only if configured) */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-2.5">
              {hasEmail && (
                <a
                  href={`mailto:${contactConfig.email}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111111] border border-white/[0.08] text-xs font-mono text-white hover:border-[#00FF88]/40 hover:text-[#00FF88] transition-colors duration-200"
                >
                  <Mail className="w-3.5 h-3.5 text-[#00FF88]" />
                  <span>{contactConfig.email}</span>
                </a>
              )}
              {hasWhatsApp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111111] border border-white/[0.08] text-xs font-mono text-white hover:border-[#00FF88]/40 hover:text-[#00FF88] transition-colors duration-200"
                  aria-label={t?.whatsapp?.chatAria || 'WhatsApp'}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#00FF88]" />
                  <span dir="ltr">{contactConfig.whatsapp}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-heading font-semibold text-white tracking-wide uppercase mb-4">
              {t.footer.quickLinksTitle}
            </h3>
            <ul className="space-y-2.5">
              {t.nav.links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLink(e, link.href)}
                    className="text-xs text-[#A1A1AA] hover:text-[#00FF88] transition-colors duration-200 inline-block py-0.5"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleLink(e, '/privacy')}
                  className="text-xs text-[#A1A1AA] hover:text-[#00FF88] transition-colors duration-200 inline-block py-0.5"
                >
                  {t.footer.privacyLink || 'Privacy Policy'}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Icons & Status (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-heading font-semibold text-white tracking-wide uppercase mb-4">
                {t.footer.contactTitle}
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-4">
                {t.footer.status}
              </p>

              {/* Social Media Links (rendered only if URLs are provided) */}
              {socialList.length > 0 && (
                <div className="flex items-center gap-3">
                  {socialList.map((social) => {
                    const IconComponent = SocialIcons[social.icon];
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#111111] border border-white/[0.08] flex items-center justify-center text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.25)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
                        aria-label={social.name}
                      >
                        {IconComponent ? <IconComponent className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Back to top button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] hover:text-[#00FF88] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88] rounded-lg p-1"
                aria-label={t.footer.scrollToTop || 'Scroll back to top'}
              >
                <span>{t.footer.backToTop || 'Back to top'}</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA]">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {currentYear} kaveron. {t.footer.rights}</p>
            <a
              href="/privacy"
              onClick={(e) => handleLink(e, '/privacy')}
              className="text-[#A1A1AA] hover:text-[#00FF88] underline transition-colors"
            >
              {t.footer.privacyLink || 'Privacy Policy'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
