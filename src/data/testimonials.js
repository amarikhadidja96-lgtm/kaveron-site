/**
 * Testimonials Database Entity
 * Schema:
 *  - id: string
 *  - name: string (English name)
 *  - name_ar: string (Arabic name)
 *  - role: string (English role / company)
 *  - role_ar: string (Arabic role / company)
 *  - quote: string (English client testimonial quote)
 *  - quote_ar: string (Arabic client testimonial quote)
 *  - rating: number (1 to 5)
 *  - avatar: string (URL or avatar image)
 */

export const testimonials = [
  {
    id: 'test-1',
    name: 'Marcus Vance',
    name_ar: 'ماركوس فانس',
    role: 'Founder & CEO at Novafy',
    role_ar: 'المؤسس والرئيس التنفيذي، نوفافاي',
    quote:
      'Kaveron delivered our web application with clean code architecture and responsive design. The interface is intuitive and works smoothly across all devices.',
    quote_ar:
      'طوّرت كافيرون تطبيق الويب الخاص بنا بهيكلية برمجية منظمة وتصميم متجاوب، والواجهة سلسة وتعمل بمرونة على مختلف الأجهزة.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
    companyLogoText: 'NOVAFY',
  },
  {
    id: 'test-2',
    name: 'Elena Rostova',
    name_ar: 'إيلينا روستوفا',
    role: 'Head of Product at Apex Flow',
    role_ar: 'مديرة المنتجات في أبيكس فلو',
    quote:
      'Working with Kaveron was straightforward. They provided clean UI design and reliable development that matched our project requirements.',
    quote_ar:
      'التعامل مع كافيرون كان واضحاً ومباشراً؛ قدموا تصميماً حديثاً وتطويراً متكاملاً لبى كافة متطلباتنا.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&h=160&q=80',
    companyLogoText: 'APEX FLOW',
  },
  {
    id: 'test-3',
    name: 'Tariq Al-Mansoor',
    name_ar: 'طارق المنصور',
    role: 'Co-Founder & CTO at Kredo Pay',
    role_ar: 'المؤسس الشريك والمدير التقني، كريدو باي',
    quote:
      'The bilingual English and Arabic support was implemented accurately. The landing page and client portal load fast and work well on mobile.',
    quote_ar:
      'تم تنفيذ دعم اللغتين العربية والإنجليزية بشكل احترافي. صفحة الهبوط وبوابة العملاء سريعة في التحميل ومتجاوبة تماماً على الهواتف.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
    companyLogoText: 'KREDO PAY',
  },
];

export const getTestimonialsByLang = (lang = 'en') => {
  return testimonials.map((item) => ({
    id: item.id,
    name: lang === 'ar' ? item.name_ar : item.name,
    role: lang === 'ar' ? item.role_ar : item.role,
    quote: lang === 'ar' ? item.quote_ar : item.quote,
    rating: item.rating,
    avatar: item.avatar,
    companyLogoText: item.companyLogoText,
  }));
};

