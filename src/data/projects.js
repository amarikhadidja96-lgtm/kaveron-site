/**
 * Projects Database Entity
 * Centralized data store for all portfolio items & case studies.
 *
 * Schema:
 *  - id: string (unique slug)
 *  - title: string
 *  - title_ar: string
 *  - description: string
 *  - description_ar: string
 *  - category: string ('Website' | 'Landing Page' | 'Online Store' | 'Web App')
 *  - category_ar: string
 *  - tech_stack: string[]
 *  - client_name: string
 *  - client_name_ar: string
 *  - project_url: string
 *  - year: string
 *  - featured: boolean
 *  - is_concept: boolean
 *  - challenge: string
 *  - challenge_ar: string
 *  - solution: string
 *  - solution_ar: string
 *  - result: string
 *  - result_ar: string
 *  - images: string[] (first image is the primary cover)
 */

export const projects = [
  {
    id: 'arc-design',
    title: 'Arc Design: Luxury Interior Design Website',
    title_ar: 'Arc Design: موقع استوديو تصميم داخلي فاخر',
    description:
      'An elegant, multilingual website for a luxury interior design studio, presenting its services, portfolio, packages and client reviews, with a consultation booking flow and a private admin portal to manage the site.',
    description_ar:
      'موقع أنيق متعدد اللغات لاستوديو تصميم داخلي فاخر، يعرض الخدمات والأعمال والباقات وآراء العملاء، مع نظام حجز استشارة وبوابة إدارة خاصة للتحكم في الموقع.',
    category: 'Website',
    category_ar: 'موقع إلكتروني',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    client_name: 'Arc Design',
    client_name_ar: 'آرك ديزاين',
    project_url: 'https://arc-design-sigma.vercel.app',
    year: '2026',
    featured: true,
    is_concept: false,
    challenge:
      'The studio needed a website that reflects its luxury positioning, speaks to clients in English, French and Arabic, and turns visitors into consultation requests.',
    challenge_ar:
      'احتاج الاستوديو إلى موقع يعكس هويته الفاخرة، ويخاطب العملاء بالإنجليزية والفرنسية والعربية، ويحوّل الزوار إلى طلبات استشارة.',
    solution:
      'A refined, image-led design with a trilingual interface, a clear services and packages structure, a project gallery with detail pages, a consultation form with a direct WhatsApp option, and an admin portal so the studio can manage its content.',
    solution_ar:
      'تصميم راقٍ يعتمد على الصور، مع واجهة بثلاث لغات، وهيكلة واضحة للخدمات والباقات، ومعرض مشاريع بصفحات تفصيلية، ونموذج استشارة مع خيار واتساب مباشر، وبوابة إدارة تتيح للاستوديو تحديث المحتوى.',
    result:
      'A polished online presence for the studio, where clients can explore projects, compare packages and book a consultation in a few clicks.',
    result_ar:
      'حضور رقمي احترافي للاستوديو، يمكن للعملاء من خلاله تصفح المشاريع ومقارنة الباقات وحجز استشارة بنقرات قليلة.',
    images: [
      '/projects/arc-design/cover.jpg',
      '/projects/arc-design/services.jpg',
      '/projects/arc-design/packages.jpg',
      '/projects/arc-design/mobile.jpg',
      '/projects/arc-design/services-detail.jpg',
    ],
  },
];

export const getProjectsByLang = (lang = 'en') => {
  return projects.map((project) => ({
    ...project,
    title: lang === 'ar' ? project.title_ar : project.title,
    description: lang === 'ar' ? project.description_ar : project.description,
    category: lang === 'ar' ? project.category_ar : project.category,
    client_name: lang === 'ar' ? project.client_name_ar : project.client_name,
    challenge: lang === 'ar' ? project.challenge_ar : project.challenge,
    solution: lang === 'ar' ? project.solution_ar : project.solution,
    result: lang === 'ar' ? project.result_ar : project.result,
  }));
};

