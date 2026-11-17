/**
 * SEO & Structured Data Manager
 * Handles dynamic page titles (<60 chars), meta descriptions (<160 chars),
 * Open Graph, Twitter cards, hreflang alternates, and JSON-LD schema.
 */

export const getSiteUrl = () => {
  // Use Vite env variable or fallback to production domain, never localhost in production metadata
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL.replace(/\/+$/, '');
  }
  return 'https://kaveron.com';
};

export const seoMetadata = {
  en: {
    home: {
      title: 'Kaveron // Modern Digital Agency',
      description: 'We build websites, online stores, landing pages and web apps engineered to grow your business.',
    },
    projects: {
      title: 'Featured Projects // Kaveron',
      description: 'Explore our portfolio of high-performance websites, online stores, and custom web applications.',
    },
    contact: {
      title: 'Contact Us // Kaveron Agency',
      description: 'Get in touch with Kaveron to discuss your project or request a quote. We reply within 24 hours.',
    },
    privacy: {
      title: 'Privacy Policy // Kaveron',
      description: 'Read the Kaveron privacy policy to learn how we collect, use, and protect your information.',
    },
    notFound: {
      title: 'Page Not Found // Kaveron',
      description: 'The page you were looking for does not exist or has been moved. Return to the Kaveron homepage.',
    },
  },
  ar: {
    home: {
      title: 'كافيرون // وكالة رقمية حديثة',
      description: 'نبني مواقع ومتاجر إلكترونية وصفحات هبوط وتطبيقات ويب سريعة لتنمية أعمالك.',
    },
    projects: {
      title: 'أعمالنا ومشاريعنا // كافيرون',
      description: 'استعرض سابقة أعمالنا في بناء مواقع ومتاجر إلكترونية وتطبيقات ويب سريعة وحديثة.',
    },
    contact: {
      title: 'تواصل معنا // وكالة كافيرون',
      description: 'تواصل مع فريق كافيرون لمناقشة مشروعك وطلب عرض سعر مخصص. نرد عليك خلال 24 ساعة.',
    },
    privacy: {
      title: 'سياسة الخصوصية // كافيرون',
      description: 'تعرف على سياسة الخصوصية في كافيرون وكيفية حماية بياناتك ومعالجة طلباتك بأمان.',
    },
    notFound: {
      title: 'الصفحة غير موجودة // كافيرون',
      description: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى العودة إلى الصفحة الرئيسية.',
    },
  },
};

const setMetaTag = (attrName, attrValue, content) => {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setLinkTag = (rel, href, extraAttrs = {}) => {
  if (typeof document === 'undefined') return;
  let selector = `link[rel="${rel}"]`;
  if (extraAttrs.hreflang) {
    selector += `[hreflang="${extraAttrs.hreflang}"]`;
  }
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  Object.entries(extraAttrs).forEach(([k, v]) => {
    element.setAttribute(k, v);
  });
};

/**
 * Updates head metadata according to current route and language
 */
export const updatePageSEO = (route, lang = 'en') => {
  if (typeof document === 'undefined') return;

  const siteUrl = getSiteUrl();
  const currentLang = lang === 'ar' ? 'ar' : 'en';
  const metaSet = seoMetadata[currentLang] || seoMetadata.en;

  let pageKey = 'home';
  let path = '/';

  // Admin routes must be strictly noindex, nofollow
  if (route.startsWith('/admin')) {
    document.title = currentLang === 'ar' ? 'لوحة الإدارة // كافيرون' : 'Admin Portal // Kaveron';
    setMetaTag('name', 'robots', 'noindex,nofollow');
    setMetaTag('name', 'googlebot', 'noindex,nofollow');
    const scriptEl = document.getElementById('kaveron-jsonld-schema');
    if (scriptEl) scriptEl.remove();
    return;
  }

  // Restore index,follow on public pages
  setMetaTag('name', 'robots', 'index,follow');
  setMetaTag('name', 'googlebot', 'index,follow');

  if (route === '/contact') {
    pageKey = 'contact';
    path = '/contact';
  } else if (route === '/privacy') {
    pageKey = 'privacy';
    path = '/privacy';
  } else if (route === '/projects') {
    pageKey = 'projects';
    path = '/projects';
  } else if (route === '/404' || (route !== '/' && !route.startsWith('/admin'))) {
    pageKey = 'notFound';
    path = route;
  }

  const { title, description } = metaSet[pageKey] || metaSet.home;

  // 1. Set Title & Description
  document.title = title;
  setMetaTag('name', 'description', description);

  // 2. Canonical & Hreflang
  const pageUrl = `${siteUrl}${path === '/' ? '' : path}`;
  setLinkTag('canonical', pageUrl);
  setLinkTag('alternate', `${siteUrl}${path === '/' ? '' : path}`, { hreflang: 'en' });
  setLinkTag('alternate', `${siteUrl}${path === '/' ? '' : path}?lang=ar`, { hreflang: 'ar' });
  setLinkTag('alternate', `${siteUrl}${path === '/' ? '' : path}`, { hreflang: 'x-default' });

  // 3. Open Graph
  const ogImageUrl = `${siteUrl}/og-image.png`;
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', pageUrl);
  setMetaTag('property', 'og:image', ogImageUrl);
  setMetaTag('property', 'og:image:width', '1200');
  setMetaTag('property', 'og:image:height', '630');
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:site_name', 'Kaveron');
  setMetaTag('property', 'og:locale', currentLang === 'ar' ? 'ar_AR' : 'en_US');

  // 4. Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', ogImageUrl);

  // 5. JSON-LD Structured Data on homepage
  const jsonLdId = 'kaveron-jsonld-schema';
  let scriptEl = document.getElementById(jsonLdId);

  if (pageKey === 'home') {
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: 'Kaveron',
          url: siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/icon-512.png`,
            width: 512,
            height: 512,
          },
          description:
            currentLang === 'ar'
              ? 'وكالة رقمية حديثة تبني مواقع ومتاجر إلكترونية وصفحات هبوط وتطبيقات ويب سريعة.'
              : 'Modern digital agency crafting websites, online stores, landing pages, and scalable web apps.',
          email: 'hello@kaveron.com',
          sameAs: [
            'https://linkedin.com',
            'https://instagram.com',
            'https://x.com',
            'https://github.com',
          ],
        },
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          url: siteUrl,
          name: 'Kaveron',
          publisher: {
            '@id': `${siteUrl}/#organization`,
          },
          inLanguage: ['en', 'ar'],
        },
        {
          '@type': 'Service',
          name: currentLang === 'ar' ? 'المواقع والمتاجر الإلكترونية' : 'Websites & Online Stores',
          provider: { '@id': `${siteUrl}/#organization` },
          description:
            currentLang === 'ar'
              ? 'مواقع شركات ومتاجر إلكترونية مع صفحات منتجات وسلة وإدارة للطلبات.'
              : 'Business websites and online stores with product pages, cart and order management.',
        },
        {
          '@type': 'Service',
          name: currentLang === 'ar' ? 'صفحات الهبوط' : 'Landing Pages',
          provider: { '@id': `${siteUrl}/#organization` },
          description:
            currentLang === 'ar'
              ? 'صفحات هبوط عالية التحويل مصممة خصيصاً للحملات الإعلانية وإطلاق المنتجات.'
              : 'High-converting landing pages designed specifically for paid ads and product launches.',
        },
        {
          '@type': 'Service',
          name: currentLang === 'ar' ? 'تطبيقات الويب ولوحات التحكم' : 'Web Apps & Dashboards',
          provider: { '@id': `${siteUrl}/#organization` },
          description:
            currentLang === 'ar'
              ? 'لوحات تحكم ومنصات ويب مخصصة مبنية للتوسع والأداء السريع.'
              : 'Custom dashboards, SaaS platforms, and enterprise web applications engineered for scalability.',
        },
      ],
    };

    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = jsonLdId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdData);
  } else if (scriptEl) {
    scriptEl.remove();
  }
};

