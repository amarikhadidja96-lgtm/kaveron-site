import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLenis } from './hooks/useLenis';
import { translations } from './translations/content';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Projects from './components/Projects';
import Pricing from './components/Pricing';
import Process from './components/Process';
import TechStack from './components/TechStack';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CtaBanner from './components/CtaBanner';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { updatePageSEO } from './utils/seo';
import { SHOW_TESTIMONIALS } from './config/featureFlags';

// Lazy-loaded components for optimal bundle splitting & performance
const ChatWidget = lazy(() => import('./components/ChatWidget'));
const Privacy = lazy(() => import('./components/Privacy'));
const NotFound = lazy(() => import('./components/NotFound'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLeads = lazy(() => import('./components/AdminLeads'));
const AdminChats = lazy(() => import('./components/AdminChats'));
const AdminKnowledge = lazy(() => import('./components/AdminKnowledge'));
const AdminGuard = lazy(() => import('./components/AdminGuard'));
import { AdminAuthProvider } from './context/AdminAuthContext';

const getQueryParam = (param) => {
  if (typeof window === 'undefined') return null;
  const search = window.location.search;
  const params = new URLSearchParams(search);
  if (params.get(param)) return params.get(param);

  if (window.location.hash.includes('?')) {
    const hashQuery = window.location.hash.split('?')[1];
    const hashParams = new URLSearchParams(hashQuery);
    return hashParams.get(param);
  }
  return null;
};

const resolveRoute = (path = '/', hash = '') => {
  if (path === '/admin/login' || hash.includes('/admin/login')) return '/admin/login';
  if (path.includes('/admin/chats') || hash.includes('/admin/chats')) return '/admin/chats';
  if (path.includes('/admin/knowledge') || hash.includes('/admin/knowledge')) return '/admin/knowledge';
  if (path.includes('/admin/leads') || hash.includes('/admin/leads')) return '/admin/leads';
  if (path === '/admin' || hash === '#admin' || path.startsWith('/admin')) return '/admin';
  if (path === '/contact' || hash.includes('/contact')) return '/contact';
  if (path === '/privacy' || hash.includes('/privacy')) return '/privacy';
  if (path === '/projects') return '/projects';
  if (path === '/' || path === '') return '/';
  return '/404';
};

export function App() {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const langParam = getQueryParam('lang');
    if (langParam === 'ar') return 'ar';
    return 'en';
  });

  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return resolveRoute(window.location.pathname, window.location.hash);
  });

  const [activePlan, setActivePlan] = useState(() => getQueryParam('plan'));
  const [activeProject, setActiveProject] = useState(() => getQueryParam('project'));

  // Listen to browser navigation changes
  useEffect(() => {
    const checkRoute = () => {
      const nextRoute = resolveRoute(window.location.pathname, window.location.hash);
      setCurrentRoute(nextRoute);

      if (nextRoute === '/contact') {
        setActivePlan(getQueryParam('plan'));
        setActiveProject(getQueryParam('project'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (nextRoute === '/projects') {
        setTimeout(() => {
          const el = document.getElementById('projects');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (nextRoute === '/' && window.location.hash) {
        const id = window.location.hash.replace('#', '').split('?')[0];
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // Handle HTML dir and lang attributes + dynamic SEO updates
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    updatePageSEO(currentRoute, lang);
  }, [lang, currentRoute]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const navigateTo = (route) => {
    window.history.pushState({}, '', route);
    const baseRoute = route.split('?')[0].split('#')[0] || '/';
    const nextRoute = resolveRoute(baseRoute, window.location.hash);
    setCurrentRoute(nextRoute);

    if (baseRoute === '/contact') {
      setActivePlan(getQueryParam('plan'));
      setActiveProject(getQueryParam('project'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (baseRoute === '/projects') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentTranslations = translations[lang] || translations.en;

  useLenis();

  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Render Protected Admin Views
  if (currentRoute.startsWith('/admin')) {
    return (
      <AdminAuthProvider onNavigate={navigateTo}>
        <div
          className={`min-h-screen bg-[#0A0A0A] text-[#A1A1AA] font-body selection:bg-[#00FF88] selection:text-[#0A0A0A] ${
            lang === 'ar' ? 'font-arabic' : 'font-body'
          }`}
        >
          <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
            {currentRoute === '/admin/login' ? (
              <AdminLogin
                t={currentTranslations}
                currentLang={lang}
                onToggleLang={toggleLanguage}
                onBackToSite={() => navigateTo('/')}
                onNavigate={navigateTo}
              />
            ) : currentRoute === '/admin' ? (
              <AdminGuard onNavigate={navigateTo}>
                <AdminDashboard
                  t={currentTranslations}
                  currentLang={lang}
                  onToggleLang={toggleLanguage}
                  onBackToSite={() => navigateTo('/')}
                  onNavigate={navigateTo}
                />
              </AdminGuard>
            ) : currentRoute === '/admin/leads' ? (
              <AdminGuard onNavigate={navigateTo}>
                <AdminLeads
                  t={currentTranslations}
                  currentLang={lang}
                  onToggleLang={toggleLanguage}
                  onBackToSite={() => navigateTo('/')}
                  onNavigate={navigateTo}
                />
              </AdminGuard>
            ) : currentRoute === '/admin/chats' ? (
              <AdminGuard onNavigate={navigateTo}>
                <AdminChats
                  t={currentTranslations}
                  currentLang={lang}
                  onToggleLang={toggleLanguage}
                  onBackToSite={() => navigateTo('/')}
                  onNavigate={navigateTo}
                />
              </AdminGuard>
            ) : currentRoute === '/admin/knowledge' ? (
              <AdminGuard onNavigate={navigateTo}>
                <AdminKnowledge
                  t={currentTranslations}
                  currentLang={lang}
                  onToggleLang={toggleLanguage}
                  onBackToSite={() => navigateTo('/')}
                  onNavigate={navigateTo}
                />
              </AdminGuard>
            ) : (
              <AdminGuard onNavigate={navigateTo}>
                <AdminDashboard
                  t={currentTranslations}
                  currentLang={lang}
                  onToggleLang={toggleLanguage}
                  onBackToSite={() => navigateTo('/')}
                  onNavigate={navigateTo}
                />
              </AdminGuard>
            )}
          </Suspense>
        </div>
      </AdminAuthProvider>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#0A0A0A] text-[#A1A1AA] font-body selection:bg-[#00FF88] selection:text-[#0A0A0A] ${
        lang === 'ar' ? 'font-arabic' : 'font-body'
      }`}
    >
      <div
        className="nav-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />
      {/* Accessibility: Skip to Content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#00FF88] focus:text-[#0A0A0A] focus:font-bold focus:rounded-xl focus:shadow-[0_0_20px_rgba(0,255,136,0.5)] focus:outline-none"
      >
        {lang === 'ar' ? 'الانتقال إلى المحتوى الرئيسي' : 'Skip to content'}
      </a>

      {/* Sticky Blurred Navbar */}
      <Navbar
        t={currentTranslations}
        currentLang={lang}
        onToggleLang={toggleLanguage}
        currentRoute={currentRoute}
        onNavigate={navigateTo}
      />

      {/* Main Content Area */}
      <main id="main-content" tabIndex="-1" className="focus:outline-none">
        {currentRoute === '/contact' ? (
          <div className="pt-24">
            <Contact
              t={currentTranslations}
              currentLang={lang}
              initialPlan={activePlan}
              initialProject={activeProject}
              onClearPlan={() => setActivePlan(null)}
              onBackToHome={() => navigateTo('/')}
              onNavigate={navigateTo}
            />
          </div>
        ) : currentRoute === '/projects' ? (
          <div className="pt-24">
            <Projects t={currentTranslations} currentLang={lang} onNavigate={navigateTo} isStandalonePage={true} />
          </div>
        ) : currentRoute === '/privacy' ? (
          <Suspense fallback={<div className="min-h-[85vh] bg-[#0A0A0A]" />}>
            <Privacy
              t={currentTranslations}
              currentLang={lang}
              onBackToHome={() => navigateTo('/')}
            />
          </Suspense>
        ) : currentRoute === '/404' ? (
          <Suspense fallback={<div className="min-h-[85vh] bg-[#0A0A0A]" />}>
            <NotFound
              t={currentTranslations}
              currentLang={lang}
              onBackToHome={() => navigateTo('/')}
              onNavigateToContact={() => navigateTo('/contact')}
            />
          </Suspense>
        ) : (
          /* Homepage sections */
          <>
            <Hero t={currentTranslations} onNavigate={navigateTo} />
            <Services t={currentTranslations} onNavigate={navigateTo} />
            <Projects t={currentTranslations} currentLang={lang} onNavigate={navigateTo} />
            <Pricing t={currentTranslations} currentLang={lang} onNavigate={navigateTo} />
            <Process t={currentTranslations} />
            <TechStack t={currentTranslations} />
            {SHOW_TESTIMONIALS && (
              <Testimonials t={currentTranslations} currentLang={lang} />
            )}
            <FAQ t={currentTranslations} />
            <CtaBanner t={currentTranslations} onNavigate={navigateTo} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer t={currentTranslations} onNavigate={navigateTo} />

      {/* Floating Action Elements */}
      <FloatingWhatsApp currentLang={lang} />
      <Suspense fallback={null}>
        <ChatWidget t={currentTranslations} currentLang={lang} />
      </Suspense>
    </div>
  );
}

export default App;
