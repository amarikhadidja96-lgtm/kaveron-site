-- Also add ip_hash column to chat_sessions if it doesn't exist (for rate limiting)
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS ip_hash text;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ip_hash ON public.chat_sessions (ip_hash, updated_at DESC);

-- Frontend localStorage keys to remove: 'kaveron_knowledge_base_v6', 'kaveron_chat_sessions_db_v2', 'kaveron_unanswered_questions_db'

INSERT INTO public.knowledge_base (topic, question_en, question_ar, answer_en, answer_ar, keywords, active) VALUES
(
  'services',
  'What services do you offer?',
  'ما هي الخدمات التي تقدمونها؟',
  'We build websites and online stores, landing pages, and web apps and dashboards. Domain and hosting are included with every project for the first year.',
  'نبني المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب ولوحات التحكم، ويشمل كل مشروع الدومين والاستضافة في السنة الأولى.',
  ARRAY['services','what do you do','what do you build','offer','what we build','خدمات','ماذا تقدمون','ما هي خدماتكم','واش ديرو','ماذا تصنعون','que faites-vous','services offerts'],
  true
),
(
  'website_pricing',
  'How much does a website or landing page cost?',
  'كم سعر الموقع أو صفحة الهبوط؟',
  $$Pricing depends on the pages and features of your project. Send a short description through the contact page at [/contact](/contact) and we'll send you a quote quickly.$$,
  'يختلف السعر حسب صفحات ومزايا مشروعك. أرسل وصفاً مختصراً عبر [صفحة التواصل](/contact) وسنرسل لك عرض سعر بسرعة.',
  ARRAY['website price','website cost','landing page price','pricing','price','cost','how much','سعر','اسعار','أسعار','تكلفة','بكم','بكام','كم السعر','كم سعر الموقع','بكم الموقع','شحال الموقع','قداش الموقع','تكلفة موقع','سعر صفحة هبوط','prix site','combien site'],
  true
),
(
  'app_pricing',
  'How much does a web app or dashboard cost?',
  'كم سعر تطبيق الويب أو لوحة التحكم؟',
  'Web apps are priced by custom quote because every app is different. Tell us what it should do at [/contact](/contact).',
  'تطبيقات الويب حسب الطلب لأن كل تطبيق يختلف عن الآخر. أخبرنا بما تريده منه عبر [صفحة التواصل](/contact).',
  ARRAY['app price','app cost','web app price','web app cost','dashboard price','سعر تطبيق','سعر تطبيق ويب','بكم التطبيق','كم سعر تطبيق الويب','شحال تطبيق ويب','قداش تطبيق','تكلفة تطبيق','prix application web','combien application web'],
  true
),
(
  'timeline',
  'How long does a project take to complete?',
  'كم المدة التي يستغرقها إنجاز المشروع؟',
  $$An online store usually takes about 4 to 6 weeks. For other projects the time depends on the scope; send a short description at [/contact](/contact) and we'll give you an estimate.$$,
  'المتجر الإلكتروني يستغرق عادة من 4 إلى 6 أسابيع. أما باقي المشاريع فتعتمد المدة على حجمها، أرسل وصفاً مختصراً عبر [صفحة التواصل](/contact) وسنعطيك تقديراً.',
  ARRAY['how long','timeline','timelines','duration','délai','temps','combien de temps','مدة','المدة','كم يستغرق','كم تستغرق','وقتاش','شحال ياخذ','كم ياخذ','شحال وقت','كم الوقت','متى يجهز','وقت التسليم'],
  true
),
(
  'ecommerce',
  'Do you build online stores and e-commerce websites?',
  'هل تقومون بإنشاء المتاجر الإلكترونية؟',
  'Yes, we build online stores with product pages, a shopping cart and order management, usually in 4 to 6 weeks.',
  'نعم، نبني متاجر إلكترونية بصفحات منتجات وسلة وإدارة للطلبات، وعادة خلال 4 إلى 6 أسابيع.',
  ARRAY['ecommerce','e-commerce','online store','online stores','shop','shopping cart','متجر','متاجر','متجر الكتروني','متجر إلكتروني','سلة','تعملو متاجر','تبنون متاجر','خدمة متاجر','boutique en ligne'],
  true
),
(
  'hosting_domain',
  'Do you provide domain name and hosting?',
  'هل توفرون الدومين والاستضافة؟',
  $$When we build your website, store or web app, the domain name and hosting are included for the first year and we set everything up. After that the renewal is paid separately by the client. We don't offer them as a standalone service.$$,
  'عند بناء موقعك أو متجرك أو تطبيقك يكون الدومين والاستضافة مشمولين في السنة الأولى ونتولى إعدادهما. بعدها يُجدَّدان على حساب العميل، ولا نقدمهما كخدمة مستقلة.',
  ARRAY['hosting','domain','server','hosting_domain','domain only','hosting only','استضافة','دومين','نطاق','سيرفر','استضافة فقط','دومين فقط','هل تتولون الاستضافة والدومين فقط','سعر الاستضافة','hébergement','nom de domaine'],
  true
),
(
  'payment',
  'What payment methods do you accept?',
  'ما هي طرق الدفع المقبولة لديكم؟',
  'We accept payments via PayPal. Terms are agreed together before the project starts and explained in your quote.',
  'نقبل الدفع عبر PayPal. نتفق على الشروط قبل بدء المشروع ونوضحها في عرض السعر.',
  ARRAY['payment','pay','paypal','deposit','how to pay','payment terms','how does payment work','دفع','الدفع','طريقة الدفع','طرق الدفع','كيف أدفع','كيف ادفع','باي بال','كيف تتم عملية الدفع','شحال نخلص','خلص','paiement','comment payer'],
  true
),
(
  'payment_methods',
  'Do you accept bank transfer, crypto, card, or cash?',
  'هل تقبلون التحويل البنكي أو العملات الرقمية أو البطاقة أو الدفع نقداً؟',
  'We accept payments via PayPal. For any other payment method, please contact us at [/contact](/contact).',
  'نقبل الدفع عبر PayPal. لأي طريقة دفع أخرى تواصل معنا عبر [صفحة التواصل](/contact).',
  ARRAY['bank transfer','crypto','cryptocurrency','cash','card','credit card','bitcoin','virement','carte bancaire','تحويل بنكي','عملات رقمية','كريبتو','بطاقة','بطاقة بنكية','كاش','نقدا','تحويل','الدفع عند الاستلام'],
  true
),
(
  'domain_renewal',
  'How much is domain and hosting renewal after the first year?',
  'كم سعر تجديد الدومين والاستضافة بعد السنة الأولى؟',
  'Domain and hosting are included for the first year. Renewal costs after that are explained in your quote.',
  'الدومين والاستضافة مشمولان في السنة الأولى. أما تكلفة التجديد بعدها فتُوضَّح في عرض السعر.',
  ARRAY['renewal','renew domain','renew hosting','domain renewal','renouvellement','تجديد الدومين','تجديد الاستضافة','سعر تجديد','تكلفة التجديد','كم سعر تجديد','تجديد النطاق'],
  true
),
(
  'discounts_guarantees',
  'Do you offer discounts, special promotions, or a money-back guarantee?',
  'هل تقدمون تخفيضات، عروضاً خاصة، أو ضمان استرجاع الأموال؟',
  'Prices and terms are set in your quote. For offers or guarantees, please contact us at [/contact](/contact).',
  'الأسعار والشروط تُحدد في عرض السعر. للعروض أو الضمانات تواصل معنا عبر [صفحة التواصل](/contact).',
  ARRAY['discount','discounts','offer','offers','promo','promotion','guarantee','money-back','money back','refund','تخفيض','تخفيضات','عرض خاص','عروض','خصم','خصومات','ضمان','استرجاع','استرداد','استرجاع الأموال'],
  true
),
(
  'business_info',
  'Where is your office located, and how many projects or clients do you have?',
  'أين يقع مقركم، وكم عدد مشاريعكم أو عملائكم؟',
  $$I don't have precise information about that. Please contact us at [/contact](/contact).$$,
  'لا أملك معلومة دقيقة عن هذا. يرجى مراسلتنا عبر [صفحة التواصل](/contact).',
  ARRAY['office','location','address','where is your office','headquarters','number of projects','how many projects','how many clients','team','how big is your team','عنوان','موقعكم','مقركم','اين مقركم','مكانكم','عدد المشاريع','كم عدد مشاريعكم','عدد العملاء','كم عميل','فريق','فريق العمل'],
  true
),
(
  'out_of_scope',
  'Do you provide logo design, branding, WordPress, games, or marketing?',
  'هل تقدمون خدمات تصميم الشعارات، الهوية البصرية، ووردبريس، الألعاب، أو التسويق؟',
  $$I don't have information about that service. Our regular services are websites and online stores, landing pages, and web apps and dashboards. Please ask us at [/contact](/contact).$$,
  'لا أملك معلومة عن هذه الخدمة. خدماتنا المعتادة هي المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب ولوحات التحكم. يمكنك الاستفسار عبر [صفحة التواصل](/contact).',
  ARRAY['logo','branding','design logo','wordpress','game','video','marketing','social media','smtp','شعار','شعارات','هوية بصرية','ووردبريس','لعبة','العاب','ألعاب','تسويق','فيديو','سوشيال ميديا'],
  true
),
(
  'mobile_apps',
  'Do you build mobile apps?',
  'هل تبنون تطبيقات موبايل؟',
  $$We focus on websites, online stores, landing pages and web apps, so mobile apps are not part of our regular services. Contact us at [/contact](/contact) and we'll tell you what's possible.$$,
  'نركز على المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب، لذلك لا تدخل تطبيقات الموبايل ضمن خدماتنا المعتادة. تواصل معنا عبر [صفحة التواصل](/contact) وسنخبرك بما هو متاح.',
  ARRAY['mobile app','mobile apps','android','ios','iphone','flutter','react native','application mobile','appli mobile','تطبيق موبايل','تطبيق الموبايل','تطبيقات موبايل','تطبيقات الموبايل','تطبيق جوال','تطبيقات الجوال','تطبيقات الهاتف','تطبيق هاتف','اندرويد','أندرويد','ايفون','آيفون','هل تبنون تطبيقات موبايل'],
  true
),
(
  'revisions',
  'How many revisions are included?',
  'كم عدد جولات التعديل المتاحة؟',
  'Revision rounds and adjustments are agreed in your quote before the project starts, ensuring the final result matches your vision.',
  'جولات التعديل يتم الاتفاق عليها وتوضيحها في عرض السعر قبل بدء المشروع، لضمان توافق النتيجة مع رؤيتك.',
  ARRAY['revisions','revision','changes','edits','modification','تعديل','تعديلات','جولات تعديل','تغيير','modifications'],
  true
),
(
  'support',
  'Do you offer support and maintenance after launch?',
  'هل تقدمون الدعم الفني والصيانة بعد الإطلاق؟',
  'Support after launch is agreed per project and explained in your quote.',
  'الدعم بعد الإطلاق يُتفق عليه لكل مشروع ويُوضَّح في عرض السعر.',
  ARRAY['support','maintenance','after launch','warranty','help','suivi','صيانة','دعم','دعم فني','ضمان','بعد الإطلاق','بعد الاطلاق','خدمة ما بعد البيع'],
  true
),
(
  'technologies',
  'Which technologies do you use?',
  'ما هي التقنيات التي تستخدمونها؟',
  'We choose modern technologies that fit each project. You can see the technologies we use in the Tech Stack section of the homepage.',
  'نختار تقنيات حديثة تناسب كل مشروع، ويمكنك الاطلاع على التقنيات التي نستخدمها في قسم التقنيات بالصفحة الرئيسية.',
  ARRAY['technologies','tech stack','frameworks','react','next.js','node','stack technique','outils','تقنيات','تقنية','برمجة','لغات البرمجة','فريمورك','رياكت','باش تخدمو'],
  true
),
(
  'languages',
  'Do you build bilingual websites with Arabic and English RTL?',
  'هل تدعمون اللغتين العربية والإنجليزية؟',
  'Yes, we build bilingual websites and web apps with full English and Arabic RTL support.',
  'نعم، نبني كافة المشاريع بدعم كامل للغتين العربية والإنجليزية مع اتجاه اليمين إلى اليسار (RTL).',
  ARRAY['languages','bilingual','arabic','english','rtl','لغات','لغة','عربي','إنجليزي','انجليزي','ثنائي اللغة','bilingue'],
  true
),
(
  'admin_dashboard',
  'Can I manage my project through an admin dashboard?',
  'هل تتوفر لوحة تحكم لإدارة المشروع؟',
  'Yes, we can add an admin dashboard so you can manage content and orders without touching code.',
  'نعم، يمكننا إضافة لوحة تحكم لتدير المحتوى والطلبات دون كتابة كود.',
  ARRAY['admin','admin dashboard','cms','dashboard','control panel','manage content myself','manage the content myself','manage content','manage my content','manage the content','edit my website','edit website without coding','without touching code','without coding','no code','gérer le contenu','tableau de bord','لوحة تحكم','لوحة إدارة','ادمن','إدارة المحتوى','إدارة المحتوى بنفسي','أدير المحتوى','إدارة موقعي','بنفسي','بدون كود'],
  true
),
(
  'seo',
  'Is SEO included or do you offer monthly SEO plans?',
  'هل السيو مشمول وهل تقدمون خطط سيو شهرية؟',
  'Basic SEO is included with our websites: clean structure, meta tags and fast loading. For ongoing SEO or monthly plans, please ask us at [/contact](/contact).',
  'يشمل كل موقع إعداداً أساسياً للـ SEO: هيكلة نظيفة ووسوم ميتا وسرعة تحميل. أما الخطط الشهرية أو التحسين المستمر فاسأل عنها عبر [صفحة التواصل](/contact).',
  ARRAY['seo','seo monthly','seo plans','monthly seo','meta tags','google ranking','سيو','خطة شهرية','خطط شهرية','تحسين محركات البحث','جوجل','ترتيب جوجل'],
  true
),
(
  'start_project',
  'How do I start a project with you?',
  'كيف أبدأ مشروعاً معكم؟',
  'You can start by sending your project details through our [/contact](/contact) page. If you like, I can also take your details right here to prepare a quote—would you like that?',
  'يمكنك البدء بإرسال تفاصيل مشروعك عبر [صفحة التواصل](/contact). وإن أحببت، يمكنني أيضاً أخذ بياناتك هنا لتحضير عرض سعر لك—هل ترغب في ذلك؟',
  ARRAY['how to start','start a project','begin','hire','get started','كيف أبدأ','كيف ابدأ','كيف أبدأ مشروعاً معكم','كيف نبدأ','حبيت نخدم','بدء مشروع','démarrer'],
  true
),
(
  'process',
  'What is your working process?',
  'ما هي خطوات ومنهجية العمل لديكم؟',
  'We follow 5 clear stages: Discovery, Design, Development, Testing, and Launch & Support.',
  'نتبع 5 مراحل واضحة: الاستكشاف والتخطيط، التصميم، التطوير البرمجي، الفحص، ثم الإطلاق والدعم.',
  ARRAY['process','steps','methodology','how do you work','منهجية','خطوات','طريقة العمل','كيف تعملون','مراحل','processus'],
  true
),
(
  'contact',
  'How can I contact you?',
  'كيف يمكنني التواصل معكم؟',
  'You can reach us through the contact page at [/contact](/contact).',
  'يمكنك التواصل معنا عبر [صفحة التواصل](/contact).',
  ARRAY['contact','reach you','reach us','email','phone','whatsapp','call you','contacter','تواصل','كيف أتواصل','رقم','هاتف','ايميل','إيميل','بريد','اتصال','واتساب'],
  true
),
(
  'portfolio',
  'Can I see your previous work?',
  'هل يمكنني رؤية أعمالكم السابقة؟',
  'Yes, see our Projects page at [/projects](/projects), including a full case study of a luxury interior design website (Arc Design).',
  'نعم، يمكنك زيارة [صفحة المشاريع](/projects) لرؤية أعمالنا، ومنها دراسة حالة كاملة لموقع استوديو تصميم داخلي فاخر (Arc Design).',
  ARRAY['see your work','show me your work','portfolio','examples of your work','previous projects','view projects','browse work','أعمالكم','مشاريعكم','نماذج من أعمالكم','سوابق أعمال','شغلكم','أعمال سابقة','وريني خدمتكم','رؤية أعمالكم','تصفح المشاريع'],
  true
),
(
  'about',
  'Who is Kaveron?',
  'من هي كافيرون؟',
  'Kaveron is a digital agency that builds websites, online stores, landing pages, and web apps and dashboards.',
  'كافيرون هي وكالة رقمية تبني المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب ولوحات التحكم.',
  ARRAY['about','who are you','who is kaveron','من أنتم','من انتم','عن كافيرون','من هي كافيرون','qui êtes-vous'],
  true
)
ON CONFLICT DO NOTHING;
