/**
 * KnowledgeBase Database Entity
 * Central store for Kaveron's factual Q&A data.
 * Fully editable via /admin/knowledge and persisted in localStorage.
 */

// Bump storage key to ensure clients pick up clean, updated knowledge base entries immediately
const STORAGE_KEY = 'kaveron_knowledge_base_v6';

export const initialKnowledgeBase = [
  {
    id: 'kb-services',
    topic: 'services',
    is_active: true,
    question_en: 'What services do you offer?',
    question_ar: 'ما هي الخدمات التي تقدمونها؟',
    answer_en:
      'We build websites and online stores, landing pages, and web apps and dashboards. Domain and hosting are included with every project for the first year.',
    answer_ar:
      'نبني المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب ولوحات التحكم، ويشمل كل مشروع الدومين والاستضافة في السنة الأولى.',
    keywords: [
      'services',
      'what do you do',
      'what do you build',
      'offer',
      'what we build',
      'خدمات',
      'ماذا تقدمون',
      'ما هي خدماتكم',
      'واش ديرو',
      'ماذا تصنعون',
      'que faites-vous',
      'services offerts',
    ],
  },
  {
    id: 'kb-website-pricing',
    topic: 'website_pricing',
    is_active: true,
    question_en: 'How much does a website or landing page cost?',
    question_ar: 'كم سعر الموقع أو صفحة الهبوط؟',
    answer_en:
      'Pricing depends on the pages and features of your project. Send a short description through the contact page at [/contact](/contact) and we\'ll send you a quote quickly.',
    answer_ar:
      'يختلف السعر حسب صفحات ومزايا مشروعك. أرسل وصفاً مختصراً عبر [صفحة التواصل](/contact) وسنرسل لك عرض سعر بسرعة.',
    keywords: [
      'website price',
      'website cost',
      'landing page price',
      'pricing',
      'price',
      'cost',
      'how much',
      'سعر',
      'اسعار',
      'أسعار',
      'تكلفة',
      'بكم',
      'بكام',
      'كم السعر',
      'كم سعر الموقع',
      'بكم الموقع',
      'شحال الموقع',
      'قداش الموقع',
      'تكلفة موقع',
      'سعر صفحة هبوط',
      'prix site',
      'combien site',
    ],
  },
  {
    id: 'kb-app-pricing',
    topic: 'app_pricing',
    is_active: true,
    question_en: 'How much does a web app or dashboard cost?',
    question_ar: 'كم سعر تطبيق الويب أو لوحة التحكم؟',
    answer_en:
      'Web apps are priced by custom quote because every app is different. Tell us what it should do at [/contact](/contact).',
    answer_ar:
      'تطبيقات الويب حسب الطلب لأن كل تطبيق يختلف عن الآخر. أخبرنا بما تريده منه عبر [صفحة التواصل](/contact).',
    keywords: [
      'app price',
      'app cost',
      'web app price',
      'web app cost',
      'dashboard price',
      'سعر تطبيق',
      'سعر تطبيق ويب',
      'بكم التطبيق',
      'كم سعر تطبيق الويب',
      'شحال تطبيق ويب',
      'قداش تطبيق',
      'تكلفة تطبيق',
      'prix application web',
      'combien application web',
    ],
  },
  {
    id: 'kb-timelines',
    topic: 'timeline',
    is_active: true,
    question_en: 'How long does a project take to complete?',
    question_ar: 'كم المدة التي يستغرقها إنجاز المشروع؟',
    answer_en:
      'An online store usually takes about 4 to 6 weeks. For other projects the time depends on the scope; send a short description at [/contact](/contact) and we\'ll give you an estimate.',
    answer_ar:
      'المتجر الإلكتروني يستغرق عادة من 4 إلى 6 أسابيع. أما باقي المشاريع فتعتمد المدة على حجمها، أرسل وصفاً مختصراً عبر [صفحة التواصل](/contact) وسنعطيك تقديراً.',
    keywords: [
      'how long',
      'timeline',
      'timelines',
      'duration',
      'délai',
      'temps',
      'combien de temps',
      'مدة',
      'المدة',
      'كم يستغرق',
      'كم تستغرق',
      'وقتاش',
      'شحال ياخذ',
      'كم ياخذ',
      'شحال وقت',
      'كم الوقت',
      'متى يجهز',
      'وقت التسليم',
    ],
  },
  {
    id: 'kb-ecommerce',
    topic: 'ecommerce',
    is_active: true,
    question_en: 'Do you build online stores and e-commerce websites?',
    question_ar: 'هل تقومون بإنشاء المتاجر الإلكترونية؟',
    answer_en:
      'Yes, we build online stores with product pages, a shopping cart and order management, usually in 4 to 6 weeks.',
    answer_ar:
      'نعم، نبني متاجر إلكترونية بصفحات منتجات وسلة وإدارة للطلبات، وعادة خلال 4 إلى 6 أسابيع.',
    keywords: [
      'ecommerce',
      'e-commerce',
      'online store',
      'online stores',
      'shop',
      'shopping cart',
      'متجر',
      'متاجر',
      'متجر الكتروني',
      'متجر إلكتروني',
      'سلة',
      'تعملو متاجر',
      'تبنون متاجر',
      'خدمة متاجر',
      'boutique en ligne',
    ],
  },
  {
    id: 'kb-hosting-domain',
    topic: 'hosting_domain',
    is_active: true,
    question_en: 'Do you provide domain name and hosting?',
    question_ar: 'هل توفرون الدومين والاستضافة؟',
    answer_en:
      'When we build your website, store or web app, the domain name and hosting are included for the first year and we set everything up. After that the renewal is paid separately by the client. We don\'t offer them as a standalone service.',
    answer_ar:
      'عند بناء موقعك أو متجرك أو تطبيقك يكون الدومين والاستضافة مشمولين في السنة الأولى ونتولى إعدادهما. بعدها يُجدَّدان على حساب العميل، ولا نقدمهما كخدمة مستقلة.',
    keywords: [
      'hosting',
      'domain',
      'server',
      'hosting_domain',
      'domain only',
      'hosting only',
      'استضافة',
      'دومين',
      'نطاق',
      'سيرفر',
      'استضافة فقط',
      'دومين فقط',
      'هل تتولون الاستضافة والدومين فقط',
      'سعر الاستضافة',
      'hébergement',
      'nom de domaine',
    ],
  },
  {
    id: 'kb-payment',
    topic: 'payment',
    is_active: true,
    question_en: 'What payment methods do you accept?',
    question_ar: 'ما هي طرق الدفع المقبولة لديكم؟',
    answer_en:
      'We accept payments via PayPal. Terms are agreed together before the project starts and explained in your quote.',
    answer_ar:
      'نقبل الدفع عبر PayPal. نتفق على الشروط قبل بدء المشروع ونوضحها في عرض السعر.',
    keywords: [
      'payment',
      'pay',
      'paypal',
      'deposit',
      'how to pay',
      'payment terms',
      'how does payment work',
      'دفع',
      'الدفع',
      'طريقة الدفع',
      'طرق الدفع',
      'كيف أدفع',
      'كيف ادفع',
      'باي بال',
      'كيف تتم عملية الدفع',
      'شحال نخلص',
      'خلص',
      'paiement',
      'comment payer',
    ],
  },
  {
    id: 'kb-payment-methods',
    topic: 'payment_methods',
    is_active: true,
    question_en: 'Do you accept bank transfer, crypto, card, or cash?',
    question_ar: 'هل تقبلون التحويل البنكي أو العملات الرقمية أو البطاقة أو الدفع نقداً؟',
    answer_en:
      'We accept payments via PayPal. For any other payment method, please contact us at [/contact](/contact).',
    answer_ar:
      'نقبل الدفع عبر PayPal. لأي طريقة دفع أخرى تواصل معنا عبر [صفحة التواصل](/contact).',
    keywords: [
      'bank transfer',
      'crypto',
      'cryptocurrency',
      'cash',
      'card',
      'credit card',
      'bitcoin',
      'virement',
      'carte bancaire',
      'تحويل بنكي',
      'عملات رقمية',
      'كريبتو',
      'بطاقة',
      'بطاقة بنكية',
      'كاش',
      'نقدا',
      'تحويل',
      'الدفع عند الاستلام',
    ],
  },
  {
    id: 'kb-domain-renewal',
    topic: 'domain_renewal',
    is_active: true,
    question_en: 'How much is domain and hosting renewal after the first year?',
    question_ar: 'كم سعر تجديد الدومين والاستضافة بعد السنة الأولى؟',
    answer_en:
      'Domain and hosting are included for the first year. Renewal costs after that are explained in your quote.',
    answer_ar:
      'الدومين والاستضافة مشمولان في السنة الأولى. أما تكلفة التجديد بعدها فتُوضَّح في عرض السعر.',
    keywords: [
      'renewal',
      'renew domain',
      'renew hosting',
      'domain renewal',
      'renouvellement',
      'تجديد الدومين',
      'تجديد الاستضافة',
      'سعر تجديد',
      'تكلفة التجديد',
      'كم سعر تجديد',
      'تجديد النطاق',
    ],
  },
  {
    id: 'kb-discounts-guarantees',
    topic: 'discounts_guarantees',
    is_active: true,
    question_en: 'Do you offer discounts, special promotions, or a money-back guarantee?',
    question_ar: 'هل تقدمون تخفيضات، عروضاً خاصة، أو ضمان استرجاع الأموال؟',
    answer_en:
      'Prices and terms are set in your quote. For offers or guarantees, please contact us at [/contact](/contact).',
    answer_ar:
      'الأسعار والشروط تُحدد في عرض السعر. للعروض أو الضمانات تواصل معنا عبر [صفحة التواصل](/contact).',
    keywords: [
      'discount',
      'discounts',
      'offer',
      'offers',
      'promo',
      'promotion',
      'guarantee',
      'money-back',
      'money back',
      'refund',
      'تخفيض',
      'تخفيضات',
      'عرض خاص',
      'عروض',
      'خصم',
      'خصومات',
      'ضمان',
      'استرجاع',
      'استرداد',
      'استرجاع الأموال',
    ],
  },
  {
    id: 'kb-business-info',
    topic: 'business_info',
    is_active: true,
    question_en: 'Where is your office located, and how many projects or clients do you have?',
    question_ar: 'أين يقع مقركم، وكم عدد مشاريعكم أو عملائكم؟',
    answer_en:
      'I don\'t have precise information about that. Please contact us at [/contact](/contact).',
    answer_ar:
      'لا أملك معلومة دقيقة عن هذا. يرجى مراسلتنا عبر [صفحة التواصل](/contact).',
    keywords: [
      'office',
      'location',
      'address',
      'where is your office',
      'headquarters',
      'number of projects',
      'how many projects',
      'how many clients',
      'team',
      'how big is your team',
      'عنوان',
      'موقعكم',
      'مقركم',
      'اين مقركم',
      'مكانكم',
      'عدد المشاريع',
      'كم عدد مشاريعكم',
      'عدد العملاء',
      'كم عميل',
      'فريق',
      'فريق العمل',
    ],
  },
  {
    id: 'kb-out-of-scope',
    topic: 'out_of_scope',
    is_active: true,
    question_en: 'Do you provide logo design, branding, WordPress, games, or marketing?',
    question_ar: 'هل تقدمون خدمات تصميم الشعارات، الهوية البصرية، ووردبريس، الألعاب، أو التسويق؟',
    answer_en:
      'I don\'t have information about that service. Our regular services are websites and online stores, landing pages, and web apps and dashboards. Please ask us at [/contact](/contact).',
    answer_ar:
      'لا أملك معلومة عن هذه الخدمة. خدماتنا المعتادة هي المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب ولوحات التحكم. يمكنك الاستفسار عبر [صفحة التواصل](/contact).',
    keywords: [
      'logo',
      'branding',
      'design logo',
      'wordpress',
      'game',
      'video',
      'marketing',
      'social media',
      'smtp',
      'شعار',
      'شعارات',
      'هوية بصرية',
      'ووردبريس',
      'لعبة',
      'العاب',
      'ألعاب',
      'تسويق',
      'فيديو',
      'سوشيال ميديا',
    ],
  },
  {
    id: 'kb-mobile-apps',
    topic: 'mobile_apps',
    is_active: true,
    question_en: 'Do you build mobile apps?',
    question_ar: 'هل تبنون تطبيقات موبايل؟',
    answer_en:
      'We focus on websites, online stores, landing pages and web apps, so mobile apps are not part of our regular services. Contact us at [/contact](/contact) and we\'ll tell you what\'s possible.',
    answer_ar:
      'نركز على المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب، لذلك لا تدخل تطبيقات الموبايل ضمن خدماتنا المعتادة. تواصل معنا عبر [صفحة التواصل](/contact) وسنخبرك بما هو متاح.',
    keywords: [
      'mobile app',
      'mobile apps',
      'android',
      'ios',
      'iphone',
      'flutter',
      'react native',
      'application mobile',
      'appli mobile',
      'تطبيق موبايل',
      'تطبيق الموبايل',
      'تطبيقات موبايل',
      'تطبيقات الموبايل',
      'تطبيق جوال',
      'تطبيقات الجوال',
      'تطبيقات الهاتف',
      'تطبيق هاتف',
      'اندرويد',
      'أندرويد',
      'ايفون',
      'آيفون',
      'هل تبنون تطبيقات موبايل',
    ],
  },
  {
    id: 'kb-revisions',
    topic: 'revisions',
    is_active: true,
    question_en: 'How many revisions are included?',
    question_ar: 'كم عدد جولات التعديل المتاحة؟',
    answer_en:
      'Revision rounds and adjustments are agreed in your quote before the project starts, ensuring the final result matches your vision.',
    answer_ar:
      'جولات التعديل يتم الاتفاق عليها وتوضيحها في عرض السعر قبل بدء المشروع، لضمان توافق النتيجة مع رؤيتك.',
    keywords: [
      'revisions',
      'revision',
      'changes',
      'edits',
      'modification',
      'تعديل',
      'تعديلات',
      'جولات تعديل',
      'تغيير',
      'modifications',
    ],
  },
  {
    id: 'kb-support',
    topic: 'support',
    is_active: true,
    question_en: 'Do you offer support and maintenance after launch?',
    question_ar: 'هل تقدمون الدعم الفني والصيانة بعد الإطلاق؟',
    answer_en:
      'Support after launch is agreed per project and explained in your quote.',
    answer_ar:
      'الدعم بعد الإطلاق يُتفق عليه لكل مشروع ويُوضَّح في عرض السعر.',
    keywords: [
      'support',
      'maintenance',
      'after launch',
      'warranty',
      'help',
      'suivi',
      'صيانة',
      'دعم',
      'دعم فني',
      'ضمان',
      'بعد الإطلاق',
      'بعد الاطلاق',
      'خدمة ما بعد البيع',
    ],
  },
  {
    id: 'kb-technologies',
    topic: 'technologies',
    is_active: true,
    question_en: 'Which technologies do you use?',
    question_ar: 'ما هي التقنيات التي تستخدمونها؟',
    answer_en:
      'We choose modern technologies that fit each project. You can see the technologies we use in the Tech Stack section of the homepage.',
    answer_ar:
      'نختار تقنيات حديثة تناسب كل مشروع، ويمكنك الاطلاع على التقنيات التي نستخدمها في قسم التقنيات بالصفحة الرئيسية.',
    keywords: [
      'technologies',
      'tech stack',
      'frameworks',
      'react',
      'next.js',
      'node',
      'stack technique',
      'outils',
      'تقنيات',
      'تقنية',
      'برمجة',
      'لغات البرمجة',
      'فريمورك',
      'رياكت',
      'باش تخدمو',
    ],
  },
  {
    id: 'kb-languages',
    topic: 'languages',
    is_active: true,
    question_en: 'Do you build bilingual websites with Arabic and English RTL?',
    question_ar: 'هل تدعمون اللغتين العربية والإنجليزية؟',
    answer_en:
      'Yes, we build bilingual websites and web apps with full English and Arabic RTL support.',
    answer_ar:
      'نعم، نبني كافة المشاريع بدعم كامل للغتين العربية والإنجليزية مع اتجاه اليمين إلى اليسار (RTL).',
    keywords: [
      'languages',
      'bilingual',
      'arabic',
      'english',
      'rtl',
      'لغات',
      'لغة',
      'عربي',
      'إنجليزي',
      'انجليزي',
      'ثنائي اللغة',
      'bilingue',
    ],
  },
  {
    id: 'kb-admin-dashboard',
    topic: 'admin_dashboard',
    is_active: true,
    question_en: 'Can I manage my project through an admin dashboard?',
    question_ar: 'هل تتوفر لوحة تحكم لإدارة المشروع؟',
    answer_en:
      'Yes, we can add an admin dashboard so you can manage content and orders without touching code.',
    answer_ar:
      'نعم، يمكننا إضافة لوحة تحكم لتدير المحتوى والطلبات دون كتابة كود.',
    keywords: [
      'admin',
      'admin dashboard',
      'cms',
      'dashboard',
      'control panel',
      'manage content myself',
      'manage the content myself',
      'manage content',
      'manage my content',
      'manage the content',
      'edit my website',
      'edit website without coding',
      'without touching code',
      'without coding',
      'no code',
      'gérer le contenu',
      'tableau de bord',
      'لوحة تحكم',
      'لوحة إدارة',
      'ادمن',
      'إدارة المحتوى',
      'إدارة المحتوى بنفسي',
      'أدير المحتوى',
      'إدارة موقعي',
      'بنفسي',
      'بدون كود',
    ],
  },
  {
    id: 'kb-seo',
    topic: 'seo',
    is_active: true,
    question_en: 'Is SEO included or do you offer monthly SEO plans?',
    question_ar: 'هل السيو مشمول وهل تقدمون خطط سيو شهرية؟',
    answer_en:
      'Basic SEO is included with our websites: clean structure, meta tags and fast loading. For ongoing SEO or monthly plans, please ask us at [/contact](/contact).',
    answer_ar:
      'يشمل كل موقع إعداداً أساسياً للـ SEO: هيكلة نظيفة ووسوم ميتا وسرعة تحميل. أما الخطط الشهرية أو التحسين المستمر فاسأل عنها عبر [صفحة التواصل](/contact).',
    keywords: [
      'seo',
      'seo monthly',
      'seo plans',
      'monthly seo',
      'meta tags',
      'google ranking',
      'سيو',
      'خطة شهرية',
      'خطط شهرية',
      'تحسين محركات البحث',
      'جوجل',
      'ترتيب جوجل',
    ],
  },
  {
    id: 'kb-how-to-start',
    topic: 'start_project',
    is_active: true,
    question_en: 'How do I start a project with you?',
    question_ar: 'كيف أبدأ مشروعاً معكم؟',
    answer_en:
      'You can start by sending your project details through our [/contact](/contact) page. If you like, I can also take your details right here to prepare a quote—would you like that?',
    answer_ar:
      'يمكنك البدء بإرسال تفاصيل مشروعك عبر [صفحة التواصل](/contact). وإن أحببت، يمكنني أيضاً أخذ بياناتك هنا لتحضير عرض سعر لك—هل ترغب في ذلك؟',
    keywords: [
      'how to start',
      'start a project',
      'begin',
      'hire',
      'get started',
      'كيف أبدأ',
      'كيف ابدأ',
      'كيف أبدأ مشروعاً معكم',
      'كيف نبدأ',
      'حبيت نخدم',
      'بدء مشروع',
      'démarrer',
    ],
  },
  {
    id: 'kb-process-steps',
    topic: 'process',
    is_active: true,
    question_en: 'What is your working process?',
    question_ar: 'ما هي خطوات ومنهجية العمل لديكم؟',
    answer_en:
      'We follow 5 clear stages: Discovery, Design, Development, Testing, and Launch & Support.',
    answer_ar:
      'نتبع 5 مراحل واضحة: الاستكشاف والتخطيط، التصميم، التطوير البرمجي، الفحص، ثم الإطلاق والدعم.',
    keywords: [
      'process',
      'steps',
      'methodology',
      'how do you work',
      'منهجية',
      'خطوات',
      'طريقة العمل',
      'كيف تعملون',
      'مراحل',
      'processus',
    ],
  },
  {
    id: 'kb-contact-info',
    topic: 'contact',
    is_active: true,
    question_en: 'How can I contact you?',
    question_ar: 'كيف يمكنني التواصل معكم؟',
    answer_en:
      'You can reach us through the contact page at [/contact](/contact).',
    answer_ar:
      'يمكنك التواصل معنا عبر [صفحة التواصل](/contact).',
    keywords: [
      'contact',
      'reach you',
      'reach us',
      'email',
      'phone',
      'whatsapp',
      'call you',
      'contacter',
      'تواصل',
      'كيف أتواصل',
      'رقم',
      'هاتف',
      'ايميل',
      'إيميل',
      'بريد',
      'اتصال',
      'واتساب',
    ],
  },
  {
    id: 'kb-portfolio',
    topic: 'portfolio',
    is_active: true,
    question_en: 'Can I see your previous work?',
    question_ar: 'هل يمكنني رؤية أعمالكم السابقة؟',
    answer_en:
      'Yes, see our Projects page at [/projects](/projects), including a full case study of a luxury interior design website (Arc Design).',
    answer_ar:
      'نعم، يمكنك زيارة [صفحة المشاريع](/projects) لرؤية أعمالنا، ومنها دراسة حالة كاملة لموقع استوديو تصميم داخلي فاخر (Arc Design).',
    keywords: [
      'see your work',
      'show me your work',
      'portfolio',
      'examples of your work',
      'previous projects',
      'view projects',
      'browse work',
      'أعمالكم',
      'مشاريعكم',
      'نماذج من أعمالكم',
      'سوابق أعمال',
      'شغلكم',
      'أعمال سابقة',
      'وريني خدمتكم',
      'رؤية أعمالكم',
      'تصفح المشاريع',
    ],
  },
  {
    id: 'kb-about',
    topic: 'about',
    is_active: true,
    question_en: 'Who is Kaveron?',
    question_ar: 'من هي كافيرون؟',
    answer_en:
      'Kaveron is a digital agency that builds websites, online stores, landing pages, and web apps and dashboards.',
    answer_ar:
      'كافيرون هي وكالة رقمية تبني المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب ولوحات التحكم.',
    keywords: [
      'about',
      'who are you',
      'who is kaveron',
      'من أنتم',
      'من انتم',
      'عن كافيرون',
      'من هي كافيرون',
      'qui êtes-vous',
    ],
  },
];

const dispatchKbEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaveron_kb_updated'));
  }
};

export const getKnowledgeBase = () => {
  if (typeof window === 'undefined') return initialKnowledgeBase;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialKnowledgeBase));
      return initialKnowledgeBase;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all required fields exist on every entry
      return parsed.map((entry) => {
        const fallback = initialKnowledgeBase.find((i) => i.topic === entry.topic || i.id === entry.id);
        return {
          ...entry,
          is_active: entry.is_active !== false,
          answer_en: entry.answer_en || fallback?.answer_en || '',
          answer_ar: entry.answer_ar || fallback?.answer_ar || '',
          question_en: entry.question_en || fallback?.question_en || '',
          question_ar: entry.question_ar || fallback?.question_ar || '',
        };
      });
    }
    return initialKnowledgeBase;
  } catch (err) {
    console.error('Error reading KnowledgeBase from localStorage:', err);
    return initialKnowledgeBase;
  }
};

export const getKnowledgeEntry = (idOrTopic) => {
  const kb = getKnowledgeBase();
  if (idOrTopic === 'hosting' || idOrTopic === 'hosting_domain' || idOrTopic === 'hosting_and_domain') {
    return kb.find((e) => e.topic === 'hosting_domain') || null;
  }
  if (idOrTopic === 'pricing' || idOrTopic === 'website_pricing') {
    return kb.find((e) => e.topic === 'website_pricing') || null;
  }
  if (idOrTopic === 'timelines' || idOrTopic === 'timeline') {
    return kb.find((e) => e.topic === 'timeline') || null;
  }
  if (idOrTopic === 'support' || idOrTopic === 'maintenance_and_support') {
    return kb.find((e) => e.topic === 'support') || null;
  }
  if (idOrTopic === 'start_project' || idOrTopic === 'how_to_start') {
    return kb.find((e) => e.topic === 'start_project') || null;
  }
  return kb.find((entry) => entry.id === idOrTopic || entry.topic === idOrTopic) || null;
};

export const saveKnowledgeEntry = (entry) => {
  if (!entry || !entry.topic) return null;
  const kb = getKnowledgeBase();
  const id = entry.id || 'kb-' + Date.now();
  const normalized = {
    ...entry,
    id,
    is_active: entry.is_active !== false,
    keywords: Array.isArray(entry.keywords)
      ? entry.keywords
      : (entry.keywords || '').split(',').map((k) => k.trim()).filter(Boolean),
  };

  const idx = kb.findIndex((e) => e.id === id);
  let updated;
  if (idx >= 0) {
    updated = [...kb];
    updated[idx] = normalized;
  } else {
    updated = [normalized, ...kb];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatchKbEvent();
    return normalized;
  } catch (err) {
    console.error('Error saving KnowledgeBase entry:', err);
    return null;
  }
};

export const deleteKnowledgeEntry = (id) => {
  const kb = getKnowledgeBase();
  const updated = kb.filter((e) => e.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatchKbEvent();
  } catch (err) {
    console.error('Error deleting KnowledgeBase entry:', err);
  }
};

export const resetKnowledgeBase = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialKnowledgeBase));
    dispatchKbEvent();
    return initialKnowledgeBase;
  } catch (err) {
    console.error('Error resetting KnowledgeBase:', err);
    return initialKnowledgeBase;
  }
};
