/**
 * AI Chat Service — Dynamic Knowledge-First Engine for Kaveron
 *
 * Implements strict specific knowledge retrieval, small talk handling,
 * prompt protection, multi-part synthesis, relative link enforcement,
 * and resilient lead capture state machine with post-save continuation.
 */

import { addLead, updateLead, appendLeadMessage } from '../data/leads.js';
import { sendLeadNotification } from './notificationService.js';
import { saveChatSession, getChatSession } from '../data/chatSessions.js';
import { getKnowledgeBase, getKnowledgeEntry } from '../data/knowledgeBase.js';
import { plans } from '../data/plans.js';
import { projects } from '../data/projects.js';
import { addUnansweredQuestion } from '../data/unansweredQuestions.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const BUSINESS_NAME = 'Kaveron';
const CONTACT_LINK = '/contact';

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const sessionMessageTimestamps = new Map();

export const checkRateLimit = (sessionId) => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxMessages = 35;
  const timestamps = sessionMessageTimestamps.get(sessionId) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);
  if (valid.length >= maxMessages) return false;
  valid.push(now);
  sessionMessageTimestamps.set(sessionId, valid);
  return true;
};

// ─── Language Detection ────────────────────────────────────────────────────────
export const isArabicText = (text = '') =>
  /[\u0600-\u06FF\u0750-\u077F]/.test(text);

export const isShortNonLanguageLatin = (text = '') => {
  const t = text.trim();
  // Valid email
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(t)) return true;
  // Short ack
  if (/^(ok|okay|k|yes|no)$/i.test(t)) return true;
  // If text has question marks or question words, it is NOT just a name
  if (t.includes('?') || t.includes('؟')) return false;
  if (/^(what|how|why|when|where|who|can|could|would|will|do|does|did|is|are|should|give|tell|show|i want|we want)\b/i.test(t)) return false;
  if (/\b(wordpress|website|store|discount|crypto|paypal|bank|office|services|price)\b/i.test(t)) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 1 && words.length <= 3 && t.length <= 30 && /^[a-zA-Z\s\-'.]+$/.test(t)) {
    return true;
  }
  return false;
};

export const detectLang = (text, currentLang = 'en') => {
  if (isArabicText(text)) return 'ar';
  if (isShortNonLanguageLatin(text)) {
    return currentLang || 'en';
  }
  if (/[éèêëàâçîïôûù]/i.test(text) || /\b(bonjour|salut|merci|comment|combien|quoi|avez-vous|est-ce|délai|tarif|prix|gérer|au revoir|boutique|nous|vous)\b/i.test(text)) {
    return 'fr';
  }
  if (/[a-zA-Z]/.test(text)) {
    return 'en';
  }
  return currentLang || 'en';
};

// ─── Sanitizer (Rule 5 & Link Rules) ───────────────────────────────────────────
export const sanitizeAnswer = (text = '') => {
  if (!text) return '';
  return text
    // Remove phone numbers made of zeros (+000000000000, 000000000000)
    .replace(/\+?0{6,}\d*/g, '')
    .replace(/https?:\/\/wa\.me\/0+/g, '')
    // Remove XXX prices
    .replace(/\$?\s*XXX/gi, '')
    // Strip any absolute localhost or port references in links
    .replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/gi, '')
    // Remove bracketed placeholders like [2-4 WEEKS], [30 DAYS] (keep markdown links [text](url))
    .replace(/\[(?![^\]]+\]\([^)]+\))([A-Z0-9_\-\s]{2,})\]/g, '$1')
    // Clean redundant spaces and empty parens
    .replace(/\(\s*\)/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

// ─── Sensitive Data Detector (Rule 9) ──────────────────────────────────────────
const containsSensitiveData = (text) => {
  if (/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{1,7}\b/.test(text)) return true;
  if (/\b(cvv|cvc|security code|رمز الأمان|كود الأمان)\b/i.test(text)) return true;
  if (/\b(my password is|كلمة المرور هي|الباسورد هو)\b/i.test(text)) return true;
  return false;
};

// ─── Prompt Protection / Safety (Section 3) ────────────────────────────────────
const isPromptInjectionOrRoleplay = (text) => {
  const t = text.toLowerCase().trim();
  return (
    /ignore (your |all |previous )?instructions|system prompt|reveal (your |the )?prompt|what (are |is )your instructions|act as|pretend to be|tell me your (system )?prompt|bypass|jailbreak/i.test(t) ||
    /تجاهل التعليمات|تجاهل كل التعليمات|برومبت|التعليمات الداخلية|اعطني التعليمات|ما هي تعليماتك|كشف البرومبت/.test(t)
  );
};

// ─── Small Talk (Section 2) ────────────────────────────────────────────────────
const isGreeting = (t) =>
  (/^(hi|hello|hey|good morning|good evening|bonjour|salut|coucou|yo)\b/i.test(t) ||
    /(مرحبا|سلام|أهلا|أهلاً|السلام عليكم|صباح الخير|مساء الخير)/.test(t) ||
    /👋|✨|😊|🙌/.test(t)) &&
  t.length <= 35;

// Broad thanks: شكراً, شكرا, شكراً جزيلاً, تسلم, مرسي, بارك الله فيك,
//              الله يعطيك الصحة, يعطيك العافية, thanks, thank you, thx, merci, ok, أوكي, تمام
const isThanks = (t) =>
  /^(thanks|thank you|thx|merci|merci beaucoup|ok|okay|cool|great)\b/i.test(t) ||
  /(شكراً جزيلاً|شكراً|شكرا|تسلم|مرسي|بارك الله فيك|الله يعطيك الصحة|يعطيك العافية|يعطيك الصحة|أوكي|اوكي|تمام|ماشي|خلاص شكرا|خلاص شكراً)/.test(t);

const isGoodbye = (t) =>
  /^(bye|goodbye|see you|au revoir|à bientôt)\b/i.test(t) ||
  /(مع السلامة|إلى اللقاء|الى اللقاء|باي|وداعاً|وداعا)/.test(t);

// ─── Yes/No Question Detector (Section 1) ──────────────────────────────────────
const isYesNoQuestion = (text = '') => {
  const t = text.trim();
  if (/^(هل|أ|أيمكن|أتستطيع|أتوفر|أتقدم|أتبنون|أتعملون)(\s+|$)/.test(t)) return true;
  if (/^(is|are|do|does|can|could|will|would|have|has|should)\b/i.test(t)) return true;
  if (/^(est-ce|avez-vous|faites-vous|pouvez-vous|proposez-vous)\b/i.test(t)) return true;
  return false;
};

const formatYesNoAnswer = (answer, questionText, lang) => {
  if (!answer) return answer;
  const isYesNo = isYesNoQuestion(questionText);
  if (!isYesNo) {
    // Strip leading "Yes, " / "نعم، " / "Oui, " if question is not yes/no
    return answer
      .replace(/^Yes,\s*/i, '')
      .replace(/^نعم،\s*/, '')
      .replace(/^نعم,\s*/, '')
      .replace(/^Oui,\s*/i, '');
  }
  return answer;
};

// ─── Multi-Part Question Detector (Requirement 2) ──────────────────────────────
export const detectMultiPartQuestion = (text, lang = 'en', includeOffer = true) => {
  const t = text.toLowerCase();
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';

  const parts = [];

  // 1. Online store: yes, we build online stores with product pages, cart and order management
  const hasStore =
    /متجر|متاجر|محل ملابس|أبيع فيه|ابيع فيه|موقع أبيع|موقع ابيع|بيع منتجات|شوب|online store|online shop|clothing shop|clothing store|website to sell|selling products|shop|store|boutique/.test(t);
  if (hasStore) {
    parts.push({
      topic: 'store',
      ar: 'المتجر الإلكتروني: نعم، نبني متاجر إلكترونية بصفحات منتجات وسلة وإدارة للطلبات.',
      en: 'Online store: Yes, we build online stores with product pages, cart and order management.',
      fr: 'Boutique en ligne : Oui, nous créons des boutiques en ligne avec pages produits, panier et gestion des commandes.',
    });
  }

  // 2. Dashboard: yes, we can add an admin dashboard to manage orders and content without touching code
  const hasDashboard =
    /لوحة أدير بها الطلبات|لوحة ادير بها الطلبات|لوحة أدير|لوحة ادير|لوحة تحكم|لوحة إدارة|لوحة ادارة|إدارة الطلبات|ادارة الطلبات|dashboard|admin dashboard|admin|cms|control panel|manage orders|manage content/.test(t);
  if (hasDashboard) {
    parts.push({
      topic: 'dashboard',
      ar: 'لوحة التحكم: نعم، يمكننا إضافة لوحة تحكم لتدير المحتوى والطلبات دون كتابة كود.',
      en: 'Admin dashboard: Yes, we can add an admin dashboard so you can manage orders and content without touching code.',
      fr: 'Tableau de bord : Oui, nous pouvons ajouter un tableau de bord pour gérer le contenu et les commandes sans coder.',
    });
  }

  // 3. Duration: depends on pages and features, online stores usually 4 to 6 weeks
  const hasTimeline =
    /كم يستغرق|كم تستغرق|كم يستغرق ذلك|كم المدة|كم مدة|مدة|وقتاش|شحال وقت|how long|timeline|duration|délai/.test(t);
  if (hasTimeline) {
    parts.push({
      topic: 'timeline',
      ar: 'المدة: تعتمد على الصفحات والمزايا، وعادة ما يستغرق المتجر الإلكتروني من 4 إلى 6 أسابيع.',
      en: 'Duration: Depends on pages and features, online stores usually take about 4 to 6 weeks.',
      fr: 'Délai : Cela dépend des pages et fonctionnalités ; une boutique en ligne prend généralement 4 à 6 semaines.',
    });
  }

  // 4. Domain and hosting: included for the first year
  const hasDomain =
    /دومين|استضافة|domain|hosting|hébergement/.test(t);
  if (hasDomain) {
    parts.push({
      topic: 'hosting',
      ar: 'الدومين والاستضافة: الدومين والاستضافة مشمولان في السنة الأولى.',
      en: 'Domain & hosting: Included for the first year.',
      fr: 'Domaine et hébergement : Inclus pour la première année.',
    });
  }

  if (parts.length >= 2) {
    const buildList = (key) =>
      parts
        .map((p) => {
          const full = p[key];
          const colonIdx = full.indexOf(':');
          const label = full.slice(0, colonIdx).trim();
          const body = full.slice(colonIdx + 1).trim();
          return `- **${label}:** ${body}`;
        })
        .join('\n');

    if (!includeOffer) {
      return buildList(isAr ? 'ar' : isFr ? 'fr' : 'en');
    }

    if (isAr) {
      return `${buildList('ar')}\n\nهل ترغب في أن آخذ تفاصيل مشروعك هنا لتحضير عرض سعر لك؟`;
    }
    if (isFr) {
      return `${buildList('fr')}\n\nSouhaitez-vous que je prenne vos coordonnées ici pour préparer un devis ?`;
    }
    return `${buildList('en')}\n\nWould you like me to take your details here to prepare a quote for you?`;
  }

  return null;
};

// ─── Follow-up Resolver (Section 4) ────────────────────────────────────────────
const resolveFollowUpTopic = (text, history = [], lang = 'en') => {
  const t = text.toLowerCase().trim();
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';

  const isShortPriceFollowUp =
    /^(وكم تكلف|كم تكلف|وكم السعر|كم السعر|وكم سعر|بكم|شحال|and how much( does it cost)?|how much is it|combien ça coûte)\s*[؟?]?$/i.test(t);

  const isShortDurationFollowUp =
    /^(وكم تستغرق|كم تستغرق|كم يستغرق|وكم يستغرق|how long( does it take)?|combien de temps)\s*[؟?]?$/i.test(t);

  if (isShortPriceFollowUp) {
    const prevText = history
      .slice(-6)
      .map((m) => m.text || '')
      .join(' ')
      .toLowerCase();

    if (/متجر|متاجر|store|shop|boutique|ecommerce|e-commerce/.test(prevText)) {
      if (isAr) {
        return 'تختلف تكلفة المتجر الإلكتروني حسب المنتجات والمزايا المطلوبة. أرسل لنا تفاصيل مشروعك عبر [صفحة التواصل](/contact) وسنرسل لك عرض سعر مخصص.';
      }
      if (isFr) {
        return 'Le tarif d\'une boutique en ligne dépend des fonctionnalités et produits. Envoyez-nous les détails via notre [page de contact](/contact) pour un devis.';
      }
      return 'Online store pricing depends on the products and features needed. Send us your project details at [/contact](/contact) and we\'ll provide a custom quote.';
    }
  }

  if (isShortDurationFollowUp) {
    const prevText = history
      .slice(-10)
      .map((m) => m.text || '')
      .join(' ')
      .toLowerCase();

    // If the previous context mentions a store, give the 4-6 week answer
    if (/متجر|متاجر|store|shop|boutique|ecommerce|e-commerce/.test(prevText)) {
      if (isAr) {
        return 'يستغرق المتجر الإلكتروني عادة من 4 إلى 6 أسابيع.';
      }
      if (isFr) {
        return 'Une boutique en ligne prend généralement de 4 à 6 semaines.';
      }
      return 'An online store usually takes about 4 to 6 weeks.';
    }

    // If the previous context mentions any other project type (website, app, restaurant, landing page, etc.)
    if (/restaurant|مطعم|موقع|landing page|web app|تطبيق|شركة|شركتي|مطعمي|موقع|application/.test(prevText)) {
      if (isAr) {
        return 'تعتمد مدة إنجاز المشروع على صفحاته ومزاياه، وسنعطيك تقديراً دقيقاً بعد وصفه. (فترة 4 إلى 6 أسابيع تنطبق على المتاجر الإلكترونية فقط.)';
      }
      if (isFr) {
        return 'Le délai dépend des pages et fonctionnalités du projet ; nous vous donnerons une estimation après description. (Le délai de 4 à 6 semaines s\'applique uniquement aux boutiques en ligne.)';
      }
      return 'The time depends on the pages and features of the project; we\'ll give you an estimate once you describe it. (The 4 to 6 weeks figure applies to online stores only.)';
    }
  }

  return null;
};

// ─── Semantic Matching & Specific Knowledge Retrieval (Section 1) ─────────────
export const findBestKnowledgeMatch = (text, history = [], lang = 'en') => {
  const isAr = lang === 'ar';
  const t = text.toLowerCase().trim();

  // 1. Out of Scope (logo, branding, WordPress, game, video, marketing, social media, SMTP)
  if (
    /\b(logo|branding|design logo|wordpress|game|games|video|marketing|social media|smtp)\b/i.test(t) ||
    /شعار|شعارات|تصميم شعار|تصميم شعارات|هوية بصرية|ووردبريس|لعبة|العاب|ألعاب|تسويق|فيديو|سوشيال ميديا/.test(t)
  ) {
    const entry = getKnowledgeEntry('out_of_scope');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 2. Business Info (office, location, address, number of projects, how many clients, team)
  if (
    /\b(office|location|address|where is your office|headquarters|number of projects|how many projects|how many clients|team|how big is your team)\b/i.test(t) ||
    /عنوان|موقعكم|مقركم|اين مقركم|أين مقركم|مكانكم|عدد المشاريع|كم عدد مشاريعكم|عدد العملاء|كم عميل|فريق|فريق العمل/.test(t)
  ) {
    const entry = getKnowledgeEntry('business_info');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 3. Domain & Hosting Renewal
  if (
    /\b(renewal|renew domain|renew hosting|domain renewal|renouvellement)\b/i.test(t) ||
    /تجديد الدومين|تجديد الاستضافة|سعر تجديد|تكلفة التجديد|كم سعر تجديد|تجديد النطاق/.test(t)
  ) {
    const entry = getKnowledgeEntry('domain_renewal');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 4. Discounts & Guarantees (money-back, discount, promo, refund)
  if (
    /\b(discount|discounts|offer|offers|promo|promotion|guarantee|money-back|money back|refund)\b/i.test(t) ||
    /تخفيض|تخفيضات|عرض خاص|عروض|خصم|خصومات|ضمان|استرجاع|استرداد|استرجاع الأموال|استرجاع الاموال/.test(t)
  ) {
    const entry = getKnowledgeEntry('discounts_guarantees');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 5. Payment Methods (bank transfer, crypto, cash, card, virement)
  if (
    /\b(bank transfer|crypto|cryptocurrency|cash|card|credit card|bitcoin|virement|carte bancaire)\b/i.test(t) ||
    /تحويل بنكي|عملات رقمية|كريبتو|بطاقة بنكية|كاش|نقدا|نقداً|تحويل حساب/.test(t)
  ) {
    const entry = getKnowledgeEntry('payment_methods');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 6. Mobile apps (in ANY form)
  const hasMobileKw =
    /\b(mobile|mobile app|mobile apps|ios|android|iphone|ipad|flutter|react native|appli mobile|application mobile)\b/i.test(t) ||
    /تطبيق موبايل|تطبيق الموبايل|تطبيقات موبايل|تطبيقات الموبايل|تطبيق جوال|تطبيقات الجوال|تطبيقات الهاتف|تطبيق هاتف|اندرويد|أندرويد|ايفون|آيفون|موبايل|جوال/.test(t);

  const hasWebAppKw =
    /\b(web app|web apps|dashboard|web application|dashboards|saas)\b/i.test(t) ||
    /تطبيق ويب|تطبيقات ويب|تطبيقات الويب|لوحة تحكم|لوحات تحكم|ويب/.test(t);

  if (hasMobileKw && hasWebAppKw) {
    return isAr
      ? 'لا تدخل تطبيقات الموبايل ضمن خدماتنا المعتادة، أما تطبيقات الويب ولوحات التحكم فيتم تسعيرها حسب الطلب. تواصل معنا عبر [صفحة التواصل](/contact) لنخبرك بما هو متاح.'
      : 'Mobile apps are not part of our regular services, while web apps and dashboards are priced by custom quote. Contact us at [/contact](/contact) to discuss what is possible.';
  }

  if (hasMobileKw) {
    return isAr
      ? 'نركز على المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب، لذلك لا تدخل تطبيقات الموبايل ضمن خدماتنا المعتادة. تواصل معنا عبر [صفحة التواصل](/contact) وسنخبرك بما هو متاح.'
      : 'We focus on websites, online stores, landing pages and web apps, so mobile apps are not part of our regular services. Contact us at [/contact](/contact) and we\'ll tell you what\'s possible.';
  }

  // 7. SEO (including monthly plans)
  if (
    /\b(seo|seo monthly|seo plans|monthly seo|meta tags|search engine|ranking|référencement)\b/i.test(t) ||
    /سيو|خطة شهرية|خطط شهرية|تحسين محركات البحث|محركات البحث|جوجل|قوقل|ترتيب جوجل/.test(t)
  ) {
    const entry = getKnowledgeEntry('seo');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 8. Admin Dashboard / Content Management
  if (
    /manage (the )?content|manage my (site|website|content)|edit (my )?(site|website) without coding|without (touching )?code|no code|cms|control panel|dashboard|tableau de bord|gérer le contenu/i.test(t) ||
    /إدارة المحتوى|ادارة المحتوى|أدير المحتوى|ادير المحتوى|إدارة موقعي|تعديل الموقع|لوحة تحكم|لوحة إدارة|لوحة ادارة|بدون كود|بنفسي|تعديل المحتوى/.test(t)
  ) {
    const entry = getKnowledgeEntry('admin_dashboard');
    return formatYesNoAnswer(isAr ? entry?.answer_ar : entry?.answer_en, text, lang);
  }

  // 9. Portfolio / Previous work (ONLY for seeing/browsing previous work)
  if (
    /see your work|show (me )?your work|see previous work|your portfolio|case studies|examples of your work|previous projects|browse projects|réalisations/i.test(t) ||
    /أعمالكم|اعمالكم|مشاريعكم|نماذج من أعمالكم|نماذج أعمالكم|سوابق أعمال|شغلكم|أعمال سابقة|اعمال سابقة|وريني خدمتكم|رؤية أعمالكم|تصفح المشاريع/.test(t)
  ) {
    const entry = getKnowledgeEntry('portfolio');
    return formatYesNoAnswer(isAr ? entry?.answer_ar : entry?.answer_en, text, lang);
  }

  // 10. General Payment (PayPal terms)
  if (
    /\b(payment|paypal|pay|deposit|terms of payment|how to pay|how do i pay|how does payment work|paiement|comment payer)\b/i.test(t) ||
    /دفع|الدفع|طريقة الدفع|طرق الدفع|كيف أدفع|كيف ادفع|كيف تتم عملية الدفع|باي بال|شحال نخلص|كيفاش نخلص|خلص/.test(t)
  ) {
    const entry = getKnowledgeEntry('payment');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 11. Timeline / Duration — context-aware: only say 4-6 weeks as the main answer for stores
  if (
    /\b(how long|timeline|duration|deadline|délai|temps|combien de temps)\b/i.test(t) ||
    /كم يستغرق|كم تستغرق|كم استغرق|كم الوقت|كم وقت|كم مدة|كم المدة|كم ياخذ|شحال ياخذ|شحال وقت|شحال المدة|وقتاش يكمل|وقتاش يجهز|وقتاش|مدة|المدة|متى يجهز|وقت التسليم/.test(t)
  ) {
    // If the SAME message explicitly mentions a store, give the 4-6 week answer
    if (/\b(online store|ecommerce|e-commerce|shop)\b/i.test(t) || /متجر|متاجر|سلة/.test(t)) {
      const entry = getKnowledgeEntry('ecommerce');
      const storeTimeAr = 'يستغرق المتجر الإلكتروني عادة من 4 إلى 6 أسابيع.';
      const storeTimeEn = 'An online store usually takes about 4 to 6 weeks.';
      return isAr ? storeTimeAr : storeTimeEn;
    }
    // Otherwise give the general answer (depends on scope), noting 4-6 weeks is for stores
    if (isAr) {
      return 'تعتمد مدة إنجاز المشروع على صفحاته ومزاياه، وسنعطيك تقديراً دقيقاً بعد وصف مشروعك. (المتاجر الإلكترونية تستغرق عادة من 4 إلى 6 أسابيع.)';
    }
    return 'The time for a project depends on its pages and features, and we\'ll give you an estimate once you describe it. (Online stores usually take about 4 to 6 weeks.)';
  }

  // 12. Pricing
  if (
    /\b(price|pricing|cost|how much|rates|quote|fee|prix|tarif|combien)\b/i.test(t) ||
    /بكم|كم سعر|كم السعر|شحال|قداش|قديش|تكلفة|سعر|أسعار|اسعار|ثمن|كلفة|كم يكلف/.test(t)
  ) {
    if (/\b(app|web app|dashboard|platform|saas)\b/i.test(t) || /تطبيق|تطبيقات|تطبيق ويب|لوحة تحكم|منصة/.test(t)) {
      const entry = getKnowledgeEntry('app_pricing');
      return isAr ? entry?.answer_ar : entry?.answer_en;
    }
    const entry = getKnowledgeEntry('website_pricing');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 13. E-commerce / Online Store
  if (
    /\b(ecommerce|e-commerce|online store|online stores|online shop|shopping cart)\b/i.test(t) ||
    /متجر|متاجر|متجر الكتروني|متجر إلكتروني|متجر أونلاين|سلة|متاجر الكترونية|تعملو متاجر|تبنون متاجر|شوب|boutique en ligne/.test(t)
  ) {
    const entry = getKnowledgeEntry('ecommerce');
    return formatYesNoAnswer(isAr ? entry?.answer_ar : entry?.answer_en, text, lang);
  }

  // 14. Standalone Hosting / Domain
  if (
    /\b(hosting|domain|server|hébergement|nom de domaine)\b/i.test(t) ||
    /استضافة|دومين|نطاق|سيرفر|استضافة فقط|دومين فقط/.test(t)
  ) {
    const entry = getKnowledgeEntry('hosting_domain');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 15. Support & Maintenance
  if (
    /\b(support|maintenance|after launch|post-launch|warranty|suivi)\b/i.test(t) ||
    /صيانة|دعم|دعم فني|ضمان|بعد الإطلاق|بعد الاطلاق|خدمة ما بعد البيع/.test(t)
  ) {
    const entry = getKnowledgeEntry('support');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 16. Technologies / Tech Stack
  if (
    /\b(technologies|technology|tech stack|tech|frameworks|react|next\.?js|node|typescript|stack technique|outils)\b/i.test(t) ||
    /تقنيات|تقنية|برمجة|لغات البرمجة|فريمورك|رياكت|باش تخدمو/.test(t)
  ) {
    const entry = getKnowledgeEntry('technologies');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 17. Contact
  if (
    /\b(contact|reach you|reach us|how can i contact|email|phone|whatsapp|call you|contacter)\b/i.test(t) ||
    /تواصل|كيف أتواصل|كيف اتواصل|رقم|هاتف|ايميل|إيميل|بريد|اتصال|واتساب/.test(t)
  ) {
    const entry = getKnowledgeEntry('contact');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 18. Revisions
  if (
    /\b(revision|revisions|changes|edits|modification|modifications)\b/i.test(t) ||
    /تعديل|تعديلات|جولات تعديل|تغيير|تغييرات|مراجعة/.test(t)
  ) {
    const entry = getKnowledgeEntry('revisions');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 19. Start Project
  if (
    /\b(how to start|start a project|how do i start|how do we begin|begin project|get started|démarrer)\b/i.test(t) ||
    /كيف أبدأ|كيف ابدأ|كيف نبدأ|كيف أبدأ مشروعاً|كيف ابدأ مشروع|حبيت نخدم|كيفاش نبدا|بدء العمل|بدء مشروع/.test(t)
  ) {
    const entry = getKnowledgeEntry('start_project');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 20. Process
  if (
    /\b(process|methodology|how do you work|steps|workflow|processus)\b/i.test(t) ||
    /منهجية|خطوات|طريقة العمل|كيف تعملون|مراحل العمل/.test(t)
  ) {
    const entry = getKnowledgeEntry('process');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 21. Services Overview (ONLY if asking what services Kaveron provides)
  if (
    /\b(what services do you offer|what do you do|what do you build|what services do you provide|services overview)\b/i.test(t) ||
    /ما هي الخدمات التي تقدمونها|ما هي خدماتكم|ماذا تقدمون|ماذا تبنون|واش ديرو بالضبط|ماهي خدماتكم/.test(t)
  ) {
    const entry = getKnowledgeEntry('services');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 22. About Kaveron
  if (
    /\b(who are you|about kaveron|who is kaveron|what is kaveron|qui êtes-vous)\b/i.test(t) ||
    /من أنتم|من انتم|من هي كافيرون|عن كافيرون|عرفني عنكم/.test(t)
  ) {
    const entry = getKnowledgeEntry('about');
    return isAr ? entry?.answer_ar : entry?.answer_en;
  }

  // 23. Languages / RTL / Bilingual
  if (
    /\b(language|languages|bilingual|arabic|english|rtl|multilingual|bilingue)\b/i.test(t) ||
    /لغات|لغة|عربي|إنجليزي|انجليزي|ثنائي اللغة|ترجمة|يمين/.test(t)
  ) {
    const entry = getKnowledgeEntry('languages');
    return formatYesNoAnswer(isAr ? entry?.answer_ar : entry?.answer_en, text, lang);
  }

  // NOT A SPECIFIC MATCH: Return null to trigger proper unknown admission
  return null;
};

// ─── Lead Capture State Machine (Section 6) ───────────────────────────────────
const leadCaptureState = new Map();

export const clearLeadCaptureState = (sessionId) => {
  if (sessionId) {
    leadCaptureState.delete(sessionId);
  } else {
    leadCaptureState.clear();
  }
};

const isClearHireIntent = (text) => {
  const t = text.toLowerCase().trim();
  return (
    /\b(i want a website|i want an app|i want an online store|i want a store|i need a website|i want to hire|can i get a quote|request a quote|hire you)\b/i.test(t) ||
    /\b(je veux un site|je veux une application|je souhaite un site|je veux un magasin|créer un site|demande de devis|engager)\b/i.test(t) ||
    /أريد موقع|اريد موقع|أريد تطبيق|اريد تطبيق|أريد متجر|اريد متجر|احتاج موقع|أحتاج موقع|طلب عرض سعر|أريد عرض سعر|اريد عرض سعر|نحب نخدم موقع|بدي موقع/.test(t)
  );
};

const isCancelIntent = (text) => {
  const t = text.toLowerCase().trim();
  return (
    /^(cancel|stop|exit|no|no thanks|nevermind)\.?$/i.test(t) ||
    /^(إلغاء|الغاء|تراجع|توقف|لا شكرا|لا شكراً|خلاص|بطلت)\.?$/.test(t)
  );
};

const isQuestionOrInquiry = (text, currentStep = 'idle') => {
  const t = text.toLowerCase().trim();
  if (t.includes('?') || t.includes('؟')) return true;
  if (/^(what|how|why|when|where|who|can|could|would|will|do|does|did|is|are|should)\b/i.test(t)) return true;
  if (/^(ما|ماذا|كيف|كم|هل|أين|اين|متى|لماذا|شحال|قداش|وقتاش|واش|ايش|وش)(\s+|$)/.test(t)) return true;
  if (/^(est-ce|comment|combien|pourquoi|quand|qui|que|quoi)\b/i.test(t)) return true;

  // If text contains a valid email and no question marks or question words, it is lead flow data, not an inquiry
  if (extractValidEmail(text)) return false;

  if (currentStep === 'awaiting_name') {
    const words = t.split(/\s+/).filter(Boolean);
    if (words.length > 4) return true;
  }

  // During awaiting_email or awaiting_project or lead_saved, ONLY an actual question
  // (with ? or question words detected above) is an inquiry!
  // Descriptive sentences like "متجر بيع مواد التجميل" must NOT be treated as questions.
  if (currentStep === 'awaiting_email' || currentStep === 'awaiting_project' || currentStep === 'lead_saved') {
    return false;
  }

  const match = findBestKnowledgeMatch(text, [], 'en') || findBestKnowledgeMatch(text, [], 'ar');
  if (match) return true;

  return false;
};

// ─── Post-Save Append Validator (Requirement 1) ────────────────────────────────
const isProjectDetailToAppend = (text, history = [], lang = 'en') => {
  const t = text.trim();
  const lower = t.toLowerCase();

  // 1. Must NOT be a question (no ? or ؟ and no question words)
  if (t.includes('?') || t.includes('؟')) return false;
  if (/^(what|how|why|when|where|who|can|could|would|will|do|does|did|is|are|should)\b/i.test(lower)) return false;
  if (/^(ما|ماذا|كيف|كم|هل|أين|اين|متى|لماذا|شحال|قداش|وقتاش|واش|ايش|وش)(\s+|$)/.test(t)) return false;
  if (/^(est-ce|comment|combien|pourquoi|quand|qui|que|quoi)\b/i.test(lower)) return false;

  // 2. Must NOT be small talk
  if (isGreeting(lower) || isThanks(lower) || isGoodbye(lower)) return false;

  // 3. Must NOT be safety / prompt injection
  if (isPromptInjectionOrRoleplay(lower)) return false;

  // 4. Must NOT match any existing knowledge base entry (policies, prices, payment, services, etc.)
  if (findBestKnowledgeMatch(text, history, lang)) return false;

  // 5. Must NOT be requests for discounts, promos, or payments
  if (/\b(discount|promo|money-back|refund|guarantee|bank transfer|crypto|paypal|price|cost)\b/i.test(lower)) return false;
  if (/تخفيض|خصم|عرض خاص|ضمان|استرجاع|تحويل بنكي|عملات رقمية|سعر|تكلفة|بكم/.test(t)) return false;

  // 6. Explicit request to add to the existing lead
  if (
    /add (this )?to my (request|order|quote)|أضف هذا لطلبي|أضف لطلبي|اضف هذا لطلبي|اضف لطلبي|زيد هذا للطلب/i.test(lower)
  ) {
    return true;
  }

  // 7. Clearly describes the visitor's own project or needs (e.g. "و منتجات العناية بالبشرة")
  const startsWithAnd = /^(و\s+|and\s+|et\s+|plus\s+|also\s+)/i.test(t);
  const describesProductsOrFeatures =
    /منتجات|منتج|العناية|بشرة|صفحة|صفحات|أقسام|اقسام|قسم|ميزة|ميزات|خصائص|تصميم|محتوى|دعم لغتين|عربي وانجليزي|سلة|طلبات|products|product|care|skin|pages|features|sections|category|categories|blog|support|items/i.test(t);

  if (startsWithAnd || describesProductsOrFeatures) {
    const words = t.split(/\s+/).filter(Boolean);
    return words.length >= 2;
  }

  return false;
};

const isValidName = (text) => {
  const t = text.trim();
  if (t.length < 2 || t.length > 40) return false;
  if (t.includes('?') || t.includes('؟') || t.includes('@') || t.includes('/') || t.includes('\\')) return false;
  if (/\d/.test(t)) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 4) return false;
  if (/^(ما|ماذا|كيف|كم|هل|أين|اين|متى|لماذا|شحال|قداش|وقتاش|what|how|why|when|where|who|cancel|no)$/i.test(words[0])) return false;
  return true;
};

const extractValidEmail = (text) => {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const match = text.match(emailRegex);
  return match ? match[1] : null;
};

const isQuestionText = (text) => {
  if (!text) return false;
  const t = text.trim();
  const lower = t.toLowerCase();

  // 1. Question marks
  if (t.includes('?') || t.includes('؟')) return true;

  // 2. Question words at beginning of sentence or clause
  if (/^(what|how|why|when|where|who|can|could|would|will|do|does|did|is|are|should)\b/i.test(lower)) return true;
  if (/^(ما|ماذا|كيف|كم|هل|أين|اين|متى|لماذا|شحال|قداش|وقتاش|واش|ايش|وش)(\s+|$)/.test(t)) return true;
  if (/^(est-ce|comment|combien|pourquoi|quand|qui|que|quoi)\b/i.test(lower)) return true;

  // 3. Inquiries about timelines, duration, pricing, discounts, payments, or out-of-scope services
  if (/\b(how much|how long|pricing|price|cost|discount|promo|refund|guarantee|bank transfer|crypto|paypal|wordpress)\b/i.test(lower)) return true;
  if (/كم يستغرق|كم المدة|شحال الوقت|شحال يدير|بكم|سعر|أسعار|اسعار|تكلفة|تخفيض|خصم|عرض خاص|ضمان|استرجاع|تحويل بنكي|عملات رقمية|ووردبريس|تطبيق موبايل|تطبيق الموبايل/.test(t)) return true;

  return false;
};

const extractRemainingTextAfterEmail = (text, validEmail) => {
  if (!text || !validEmail) return '';
  let cleaned = text.replace(validEmail, '');

  // Strip common email prefixes / labels
  cleaned = cleaned.replace(/\b(my email is|email is|email\s*:|e-mail\s*:|e-mail is|mon email est|mon e-mail est|mon email\s*:|mon e-mail\s*:|my email|mon email|mon e-mail)\b/gi, '');
  cleaned = cleaned.replace(/(بريدي الإلكتروني هو|بريدي الالكتروني هو|بريدي هو|بريدي الإلكتروني|بريدي الالكتروني|بريدي\s*:|إيميلي هو|ايميلي هو|إيميلي\s*:|ايميلي\s*:|الإيميل هو|الايميل هو|الإيميل\s*:|الايميل\s*:)/g, '');

  // Strip trailing labels if email was placed at the end
  cleaned = cleaned.replace(/[\s,;:\-–—|/]+(بريدي الإلكتروني هو|بريدي الالكتروني هو|بريدي هو|بريدي|إيميلي|ايميلي|my email is|email is|my email|email|mon email)$/i, '');

  // Strip leading and trailing punctuation and connectives (like commas, dashes, colons, pipes, 'and', 'et', 'و')
  cleaned = cleaned.replace(/^[\s,;:\-–—|/]+|[\s,;:\-–—|/]+$/g, '');
  cleaned = cleaned.replace(/^(and\s+|et\s+|و\s+)/i, '');
  cleaned = cleaned.replace(/^[\s,;:\-–—|/]+|[\s,;:\-–—|/]+$/g, '');

  return cleaned.trim();
};

const finalizeAndSaveLead = async (sessionId, state, currentFlowLang) => {
  try {
    const newLead = addLead({
      name: state.name || 'Chat Visitor',
      email: state.email,
      phone: '',
      service_type: (state.project || '').toLowerCase().includes('app') ? 'Web Apps' : 'Websites & Landing Pages',
      budget: 'To be discussed',
      message: `[Captured via AI Chatbot] ${state.project}`,
      source: 'chatbot',
      selected_plan: null,
    });

    state.leadId = newLead.id;
    state.step = 'lead_saved';
    state.reminder_shown = false;
    leadCaptureState.set(sessionId, state);

    const session = getChatSession(sessionId);
    if (session) saveChatSession({ ...session, lead_id: newLead.id });
    await sendLeadNotification(newLead);
  } catch (e) {
    console.error('Error saving chatbot lead:', e);
  }

  const promptLang = currentFlowLang;
  if (promptLang === 'ar') return 'شكراً لك! تم استلام بياناتك وسنتواصل معك قريباً.';
  if (promptLang === 'fr') return 'Merci ! Nous avons bien reçu vos coordonnées et nous vous recontacterons bientôt.';
  return "Thanks! We've received your details and will get back to you shortly.";
};

/**
 * Handles lead extraction with robust project description validation,
 * email correction, and post-save detail appending.
 */
const handleLeadFlow = async (sessionId, text, history = [], lang = 'en') => {
  let state = leadCaptureState.get(sessionId) || {
    step: 'idle',
    lang: lang,
    name: '',
    email: '',
    project: '',
    leadId: null,
    nameAttempts: 0,
    emailAttempts: 0,
    reminder_shown: false,
  };

  // Update lead flow language from current message, unless it is a short non-language Latin input
  if (!isShortNonLanguageLatin(text)) {
    state.lang = lang;
  }
  const currentFlowLang = state.lang || lang;
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';

  // 1. Idle mode: Start ONLY on clear hire intent
  if (state.step === 'idle') {
    if (isClearHireIntent(text)) {
      state.step = 'awaiting_name';
      state.lang = lang;
      state.nameAttempts = 0;
      state.emailAttempts = 0;
      state.reminder_shown = false;

      // Check if message also provided an email and/or project description right away
      const validEmail = extractValidEmail(text);
      if (validEmail) {
        state.email = validEmail;
        const remaining = extractRemainingTextAfterEmail(text, validEmail);
        const remainingWords = remaining.split(/\s+/).filter(Boolean);
        if (remainingWords.length >= 4 && !isQuestionText(remaining)) {
          state.project = remaining;
        }
      }

      leadCaptureState.set(sessionId, state);
      if (isAr) return 'يسعدنا العمل معك! ما هو اسمك الكريم؟';
      if (isFr) return 'Nous serions ravis de travailler avec vous ! Quel est votre nom pour commencer ?';
      return "We'd love to work with you! May I have your name to get started?";
    }
    return null;
  }

  // 2. Cancellation: visitor leaves flow at any time
  if (isCancelIntent(text)) {
    leadCaptureState.delete(sessionId);
    if (isAr) return 'تم إلغاء جمع البيانات. يمكنك سؤالي عن أي شيء آخر، أو التواصل معنا عبر [صفحة التواصل](/contact).';
    if (isFr) return 'Processus annulé. N\'hésitez pas à me poser d\'autres questions ou à vous rendre sur notre [page de contact](/contact).';
    return 'No problem, cancelled. Feel free to ask anything else or visit our [contact page](/contact).';
  }

  // 3. Post-Save Behavior (Requirement 1)
  if (state.step === 'lead_saved') {
    const t = text.toLowerCase().trim();

    // Check if visitor asks for a different service
    if (/أريد خدمة أخرى|خدمة ثانية|خدمة أخرى|different service|another service|autre service/.test(t)) {
      if (isAr) return 'هل ترغب في إضافة هذا إلى طلبك السابق؟';
      if (isFr) return 'Souhaitez-vous ajouter cela à votre demande existante ?';
      return 'Would you like me to add this to your existing request?';
    }

    // Append ONLY if all criteria met (not a question, not small talk, not policies/prices, describes project)
    if (isProjectDetailToAppend(text, history, lang)) {
      if (state.leadId) {
        appendLeadMessage(state.leadId, text);
      }
      if (isAr) return 'أضفت هذه التفاصيل إلى طلبك.';
      if (isFr) return "J'ai ajouté ces détails à votre demande.";
      return "I've added this to your request.";
    }

    // Otherwise, return to NORMAL answering mode: answer every question normally from KB
    return null;
  }

  // 4. Question check during active collection: answer it, offer once to continue (Requirement 4)
  if (isQuestionOrInquiry(text, state.step)) {
    // If the message also contains an email, record it so we don't ask for it again
    const validEmailInQuestion = extractValidEmail(text);
    if (validEmailInQuestion) {
      state.email = validEmailInQuestion;
      if (state.step === 'awaiting_email' || state.step === 'awaiting_name') {
        state.step = 'awaiting_project';
      }
    }

    let normalAnswer = detectMultiPartQuestion(text, lang, false) || findBestKnowledgeMatch(text, history, lang);
    if (!normalAnswer) {
      if (isAr) normalAnswer = 'لا أملك معلومة دقيقة عن هذا. يرجى مراسلتنا عبر [صفحة التواصل](/contact) وسنجيبك بسرعة.';
      else if (isFr) normalAnswer = 'Je n\'ai pas d\'information précise à ce sujet. Veuillez nous contacter via notre [page de contact](/contact).';
      else normalAnswer = "I don't have information about that. Please contact us via our [contact page](/contact) and we'll answer quickly.";
      addUnansweredQuestion({ question: text, language: lang, session_id: sessionId });
    }

    // Lead-flow reminder: once only!
    if (!state.reminder_shown) {
      state.reminder_shown = true;
      leadCaptureState.set(sessionId, state);

      if (state.step === 'awaiting_name') {
        const reminder = isAr
          ? '(هل ترغب في متابعة طلب عرض السعر؟ ما هو اسمك الكريم؟)'
          : isFr
          ? '(Souhaitez-vous continuer votre demande de devis ? Quel est votre nom ?)'
          : "(Want to continue with your quote? What's your name?)";
        return `${normalAnswer}\n\n${reminder}`;
      }

      if (state.step === 'awaiting_email') {
        const reminder = isAr
          ? '(هل ترغب في متابعة طلب عرض السعر؟ ما هو بريدك الإلكتروني؟)'
          : isFr
          ? '(Souhaitez-vous continuer votre demande de devis ? Quel est votre e-mail ?)'
          : "(Want to continue with your quote? What's your email?)";
        return `${normalAnswer}\n\n${reminder}`;
      }

      if (state.step === 'awaiting_project') {
        const reminder = isAr
          ? '(هل ترغب في متابعة طلب عرض السعر؟ أعطنا نبذة مختصرة عن فكرة مشروعك.)'
          : isFr
          ? '(Souhaitez-vous continuer votre demande de devis ? Décrivez brièvement votre projet.)'
          : "(Want to continue with your quote? Could you briefly describe your project?)";
        return `${normalAnswer}\n\n${reminder}`;
      }

      leadCaptureState.delete(sessionId);
      return `${normalAnswer}\n\n${isAr ? 'يمكنك دائماً مراسلتنا في أي وقت عبر [صفحة التواصل](/contact).' : 'You can reach us anytime directly via our [contact page](/contact).'}`;
    }

    // Reminder already shown in this phase — do NOT repeat!
    leadCaptureState.set(sessionId, state);
    return normalAnswer;
  }

  // 5. Awaiting Name
  if (state.step === 'awaiting_name') {
    const validEmail = extractValidEmail(text);
    if (validEmail) {
      state.email = validEmail;
      state.reminder_shown = false;
      const remaining = extractRemainingTextAfterEmail(text, validEmail);
      const remainingWords = remaining.split(/\s+/).filter(Boolean);

      // Check if message also has name and/or project description
      const parts = remaining.split(/[,;\n–—|]+|\s*-\s*/).map(p => p.trim()).filter(Boolean);

      if (parts.length >= 2 && isValidName(parts[0])) {
        state.name = parts[0];
        const descPart = parts.slice(1).join(', ').trim();
        const descWords = descPart.split(/\s+/).filter(Boolean);
        if (descWords.length >= 4 && !isQuestionText(descPart)) {
          state.project = descPart;
          return await finalizeAndSaveLead(sessionId, state, currentFlowLang);
        }
        state.step = 'awaiting_project';
        leadCaptureState.set(sessionId, state);
        const promptLang = currentFlowLang;
        if (promptLang === 'ar') return 'ممتاز! أعطنا نبذة مختصرة عن فكرة مشروعك (4 كلمات على الأقل).';
        if (promptLang === 'fr') return 'Parfait ! Décrivez brièvement votre projet (au moins 4 mots).';
        return 'Great! Could you briefly describe your project (at least 4 words)?';
      }

      if (remainingWords.length >= 4 && !isQuestionText(remaining)) {
        state.name = state.name || 'Chat Visitor';
        state.project = remaining;
        return await finalizeAndSaveLead(sessionId, state, currentFlowLang);
      }

      if (isValidName(remaining)) {
        state.name = remaining;
        state.step = 'awaiting_project';
        leadCaptureState.set(sessionId, state);
        const promptLang = currentFlowLang;
        if (promptLang === 'ar') return 'ممتاز! أعطنا نبذة مختصرة عن فكرة مشروعك (4 كلمات على الأقل).';
        if (promptLang === 'fr') return 'Parfait ! Décrivez brièvement votre projet (au moins 4 mots).';
        return 'Great! Could you briefly describe your project (at least 4 words)?';
      }
    }

    const cleaned = text.replace(/my name is|i am|je m'appelle|اسمي|اسمي هو|أنا/gi, '').trim();
    if (isValidName(cleaned)) {
      state.name = cleaned;
      state.reminder_shown = false;

      // If email and project description were already collected earlier:
      if (state.email && state.project) {
        return await finalizeAndSaveLead(sessionId, state, currentFlowLang);
      }

      if (state.email) {
        state.step = 'awaiting_project';
        leadCaptureState.set(sessionId, state);
        const promptLang = currentFlowLang;
        if (promptLang === 'ar') return 'ممتاز! أعطنا نبذة مختصرة عن فكرة مشروعك (4 كلمات على الأقل).';
        if (promptLang === 'fr') return 'Parfait ! Décrivez brièvement votre projet (au moins 4 mots).';
        return 'Great! Could you briefly describe your project (at least 4 words)?';
      }

      state.step = 'awaiting_email';
      state.emailAttempts = 0;
      leadCaptureState.set(sessionId, state);
      const promptLang = currentFlowLang;
      if (promptLang === 'ar') return `أهلاً بك يا ${state.name}! ما هو بريدك الإلكتروني؟`;
      if (promptLang === 'fr') return `Ravi de vous rencontrer, ${state.name} ! Quelle est votre adresse e-mail ?`;
      return `Nice to meet you, ${state.name}! What's your email address?`;
    }

    state.nameAttempts++;
    if (state.nameAttempts >= 2) {
      leadCaptureState.delete(sessionId);
      if (isAr) return 'يمكنك مراسلتنا مباشرة في أي وقت عبر [صفحة التواصل](/contact).';
      if (isFr) return 'Vous pouvez nous contacter directement via notre [page de contact](/contact).';
      return 'You can reach us directly anytime via our [contact page](/contact).';
    }
    leadCaptureState.set(sessionId, state);
    if (isAr) return 'يرجى تزويدنا باسمك الكريم لنتمكن من التواصل معك.';
    if (isFr) return 'Veuillez renseigner votre nom complet.';
    return 'Please provide a valid name.';
  }

  // 6. Awaiting Email
  if (state.step === 'awaiting_email') {
    const validEmail = extractValidEmail(text);
    if (validEmail) {
      state.email = validEmail;
      state.reminder_shown = false; // Reset flag!

      // Extract remaining text after removing the email
      const remaining = extractRemainingTextAfterEmail(text, validEmail);
      const remainingWords = remaining.split(/\s+/).filter(Boolean);

      // If remaining text has at least 4 words and is NOT a question, use as project description too and save immediately!
      if (remainingWords.length >= 4 && !isQuestionText(remaining)) {
        state.project = remaining;
        return await finalizeAndSaveLead(sessionId, state, currentFlowLang);
      }

      // If remaining text is a question (e.g. "karim@example.com كم يستغرق المتجر الإلكتروني؟")
      if (remaining.length > 0 && isQuestionText(remaining)) {
        state.step = 'awaiting_project';
        state.reminder_shown = true;
        leadCaptureState.set(sessionId, state);

        let normalAnswer = detectMultiPartQuestion(remaining, lang, false) || findBestKnowledgeMatch(remaining, history, lang);
        if (!normalAnswer) {
          if (isAr) normalAnswer = 'لا أملك معلومة دقيقة عن هذا. يرجى مراسلتنا عبر [صفحة التواصل](/contact) وسنجيبك بسرعة.';
          else if (isFr) normalAnswer = 'Je n\'ai pas d\'information précise à ce sujet. Veuillez nous contacter via notre [page de contact](/contact).';
          else normalAnswer = "I don't have information about that. Please contact us via our [contact page](/contact) and we'll answer quickly.";
          addUnansweredQuestion({ question: remaining, language: lang, session_id: sessionId });
        }

        const reminder = isAr
          ? '(هل ترغب في متابعة طلب عرض السعر؟ أعطنا نبذة مختصرة عن فكرة مشروعك.)'
          : isFr
          ? '(Souhaitez-vous continuer votre demande de devis ? Décrivez brièvement votre projet.)'
          : "(Want to continue with your quote? Could you briefly describe your project?)";

        return `${normalAnswer}\n\n${reminder}`;
      }

      // Otherwise, only email was provided (or remaining text < 4 words)
      state.step = 'awaiting_project';
      leadCaptureState.set(sessionId, state);
      const promptLang = currentFlowLang;
      if (promptLang === 'ar') return 'ممتاز! أعطنا نبذة مختصرة عن فكرة مشروعك (4 كلمات على الأقل).';
      if (promptLang === 'fr') return 'Parfait ! Décrivez brièvement votre projet (au moins 4 mots).';
      return 'Great! Could you briefly describe your project (at least 4 words)?';
    }

    state.emailAttempts++;
    if (state.emailAttempts >= 2) {
      leadCaptureState.delete(sessionId);
      if (isAr) return 'لم نتمكن من التعرف على البريد الإلكتروني. يمكنك دائماً مراسلتنا في أي وقت عبر [صفحة التواصل](/contact).';
      if (isFr) return 'Adresse e-mail non reconnue. Vous pouvez nous contacter à tout moment via notre [page de contact](/contact).';
      return 'Could not recognize a valid email address. You can reach us anytime directly via our [contact page](/contact).';
    }
    leadCaptureState.set(sessionId, state);
    if (isAr) return 'يرجى تزويدنا ببريد إلكتروني صحيح (مثال: name@example.com).';
    if (isFr) return 'Veuillez fournir une adresse e-mail valide (ex: name@example.com).';
    return 'Please provide a valid email address (e.g. name@example.com).';
  }

  // 7. Awaiting Project Description (Section 6)
  if (state.step === 'awaiting_project') {
    // Check if visitor entered another email address (email correction)
    const newEmail = extractValidEmail(text);
    if (newEmail) {
      state.email = newEmail;
      state.reminder_shown = false;

      const remaining = extractRemainingTextAfterEmail(text, newEmail);
      const remainingWords = remaining.split(/\s+/).filter(Boolean);

      if (remainingWords.length >= 4 && !isQuestionText(remaining)) {
        state.project = remaining;
        return await finalizeAndSaveLead(sessionId, state, currentFlowLang);
      }

      leadCaptureState.set(sessionId, state);
      const promptLang = currentFlowLang;
      if (promptLang === 'ar') return 'تم تحديث بريدك الإلكتروني. والآن، يرجى كتابة نبذة مختصرة عن فكرة مشروعك (4 كلمات على الأقل).';
      if (promptLang === 'fr') return 'Votre adresse e-mail a été mise à jour. Veuillez maintenant décrire votre projet (au moins 4 mots).';
      return "I've updated your email address. Now, please briefly describe your project (at least 4 words).";
    }

    // Check project description validity: at least 4 words, not email, not just a name
    const words = text.trim().split(/\s+/).filter(Boolean);
    const isSingleWordOrName = words.length < 4 || (words.length <= 2 && !text.includes('موقع') && !text.includes('website') && !text.includes('متجر') && !text.includes('store'));
    const isJustEmail = text.includes('@');

    if (isSingleWordOrName || isJustEmail) {
      const promptLang = currentFlowLang;
      if (promptLang === 'ar') return 'يرجى كتابة نبذة مختصرة عن فكرة مشروعك (4 كلمات على الأقل).';
      if (promptLang === 'fr') return 'Veuillez fournir une brève description de votre projet (au moins 4 mots).';
      return "Please provide a short description of what you'd like to build (at least 4 words).";
    }

    state.project = text.trim();
    return await finalizeAndSaveLead(sessionId, state, currentFlowLang);
  }

  return null;
};

// ─── Natural Delay ────────────────────────────────────────────────────────────
const naturalDelay = () =>
  new Promise((r) => setTimeout(r, 300 + Math.random() * 300));

// ─── Main sendChatMessage ──────────────────────────────────────────────────────
export const sendChatMessage = async ({ sessionId, text, history = [], currentLang = 'en' }) => {
  if (!text || text.trim().length === 0) throw new Error('Message cannot be empty.');
  if (text.length > 500) {
    throw new Error(
      currentLang === 'ar'
        ? 'الرسالة تتجاوز الحد الأقصى (500 حرف).'
        : 'Message exceeds the 500-character limit.'
    );
  }

  if (!checkRateLimit(sessionId)) {
    throw new Error(
      currentLang === 'ar'
        ? 'تجاوزت حد الرسائل المسموح. انتظر قليلاً.'
        : 'Rate limit reached. Please wait a moment.'
    );
  }

  const lang = detectLang(text, currentLang);
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';
  const recentHistory = history.slice(-10);

  // 1. Sensitive Data Check (Rule 9)
  if (containsSensitiveData(text)) {
    await naturalDelay();
    return {
      text: isAr
        ? 'يرجى عدم مشاركة أرقام البطاقات المصرفية أو رموز الأمان (CVV) أو كلمات المرور هنا حفاظاً على أمان بياناتك.'
        : isFr
        ? 'Veuillez ne pas partager de numéros de carte bancaire, CVV ou mots de passe ici pour votre sécurité.'
        : 'Please do not share credit card numbers, CVV, or passwords here for your security.',
      isRtl: isAr,
    };
  }

  // 2. Safety / System Prompt Injection Protection (Section 3)
  if (isPromptInjectionOrRoleplay(text)) {
    await naturalDelay();
    return {
      text: isAr
        ? 'لا أستطيع مشاركة التعليمات الداخلية، لكن يسعدني الإجابة عن أسئلتك حول خدماتنا.'
        : isFr
        ? 'Je ne peux pas partager d\'instructions internes, mais je réponds volontiers à vos questions sur nos services.'
        : "I can't share internal instructions, but I'm happy to help with questions about our services.",
      isRtl: isAr,
    };
  }

  // 3. Small Talk (Section 2)
  const normT = text.toLowerCase().trim();
  if (isGreeting(normT)) {
    await naturalDelay();
    return {
      text: isAr
        ? 'أهلاً بك! كيف يمكنني مساعدتك اليوم في مشروعك الرقمي؟'
        : isFr
        ? 'Bonjour ! Comment puis-je vous aider aujourd\'hui pour votre projet ?'
        : 'Hello! How can I help you today with your digital project?',
      isRtl: isAr,
    };
  }

  if (isThanks(normT)) {
    await naturalDelay();
    return {
      text: isAr
        ? 'العفو! هل تحتاج شيئاً آخر؟'
        : isFr
        ? 'De rien ! Puis-je vous aider pour autre chose ?'
        : "You're welcome! Anything else I can help with?",
      isRtl: isAr,
    };
  }

  if (isGoodbye(normT)) {
    await naturalDelay();
    return {
      text: isAr
        ? 'مع السلامة! يسعدنا تواصلك معنا في أي وقت.'
        : isFr
        ? 'Au revoir ! N\'hésitez pas à nous contacter à tout moment.'
        : 'Goodbye! Feel free to reach out anytime.',
      isRtl: isAr,
    };
  }

  // 4. If in active lead flow, prioritize lead flow handler
  const activeLead = leadCaptureState.get(sessionId);
  if (activeLead && activeLead.step !== 'idle') {
    const leadReply = await handleLeadFlow(sessionId, text, recentHistory, lang);
    if (leadReply) {
      await naturalDelay();
      return {
        text: sanitizeAnswer(leadReply),
        isRtl: isAr,
      };
    }
  }

  // 5. Multi-part Question Synthesis (Section 4)
  const multiPartReply = detectMultiPartQuestion(text, lang);
  if (multiPartReply) {
    await naturalDelay();
    return {
      text: sanitizeAnswer(multiPartReply),
      isRtl: isAr,
    };
  }

  // 6. Lead Capture Check (Section 6) (idle mode: hire intent check)
  const leadReply = await handleLeadFlow(sessionId, text, recentHistory, lang);
  if (leadReply) {
    await naturalDelay();
    return {
      text: sanitizeAnswer(leadReply),
      isRtl: isAr,
    };
  }

  // 6. Follow-up Context Resolution using last 10 messages (Section 4)
  const followUpReply = resolveFollowUpTopic(text, recentHistory, lang);
  if (followUpReply) {
    await naturalDelay();
    return {
      text: sanitizeAnswer(followUpReply),
      isRtl: isAr,
    };
  }

  // 7. Specific Knowledge Match (Section 1)
  const matchedAnswer = findBestKnowledgeMatch(text, recentHistory, lang);
  if (matchedAnswer) {
    await naturalDelay();
    return {
      text: sanitizeAnswer(matchedAnswer),
      isRtl: isAr,
    };
  }

  // 8. UNKNOWN TOPIC ADMISSION: Never substitute with services list, projects, or generic pricing!
  addUnansweredQuestion({
    question: text,
    language: isAr ? 'ar' : isFr ? 'fr' : 'en',
    session_id: sessionId,
  });

  await naturalDelay();
  const unknownResponse = isAr
    ? 'لا أملك معلومة دقيقة عن هذا. يرجى مراسلتنا مباشرة عبر [صفحة التواصل](/contact) وسنجيبك بسرعة.'
    : isFr
    ? 'Je n\'ai pas d\'information précise à ce sujet. Veuillez nous contacter directement via notre [page de contact](/contact).'
    : "I don't have precise information about that. Please contact us directly via our [contact page](/contact) and we'll answer you quickly.";

  return {
    text: sanitizeAnswer(unknownResponse),
    isRtl: isAr,
  };
};
