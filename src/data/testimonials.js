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
      'kaveron delivered our SaaS web application weeks ahead of schedule. The code architecture is rock-solid, animations are buttery smooth, and our conversion rate jumped by 42% within the first month.',
    quote_ar:
      'قامت كافيرون بتسليم تطبيق الويب لمنصتنا قبل الموعد بأسابيع. بنية الكود قوية للغاية، والانتقالات فائقة السلاسة، وارتفع معدل التحويل لدينا بنسبة 42٪ خلال الشهر الأول.',
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
      'Finding an agency that truly excels at both world-class UI design and robust engineering is rare. kaveron built our full-stack web application flawlessly. Our user satisfaction score is holding strong at 4.9.',
    quote_ar:
      'من النادر العثور على وكالة تجمع بين التصميم المبتكر والهندسة البرمجية القوية. طوّرت كافيرون تطبيق الويب المتكامل لمنصتنا باحترافية، وتقييم رضا المستخدمين 4.9.',
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
      'The speed and polish kaveron brought to our fintech landing page and customer portal was exceptional. Their bilingual LTR/RTL support and performance optimization were best-in-class.',
    quote_ar:
      'كانت السرعة والإتقان الذي قدمته كافيرون في صفحة الهبوط وبوابة العملاء استثنائية. دعمهم ثنائي اللغة وتجهيز تجربة المستخدم باللغتين العربية والإنجليزية كان الأفضل على الإطلاق.',
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

