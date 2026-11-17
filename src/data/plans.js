/**
 * Plans Database Entity
 *
 * Schema:
 *  - id: string
 *  - name: string
 *  - name_ar: string
 *  - price: string              — placeholder, edit freely
 *  - price_ar: string
 *  - price_label: string        — shown above the price (e.g. "Starting from")
 *  - price_label_ar: string
 *  - currency: string
 *  - show_price: boolean        — if false, render price_label as the large display text
 *  - description: string
 *  - description_ar: string
 *  - features: string[]
 *  - features_ar: string[]
 *  - is_popular: boolean
 *  - order: number
 */

export const plans = [
  {
    id: 'websites',
    name: 'Websites, Online Stores & Landing Pages',
    name_ar: 'المواقع والمتاجر وصفحات الهبوط',
    price: '',
    price_ar: '',
    price_label: 'Custom Quote',
    price_label_ar: 'عرض سعر مخصص',
    currency: '',
    show_price: false,
    description: 'Modern, fast, and conversion-focused websites, online stores, and landing pages tailored to your brand.',
    description_ar: 'مواقع ومتاجر إلكترونية وصفحات هبوط عصرية وسريعة ومصممة لتحقيق أهداف عملك.',
    features: [
      'Modern responsive design for all devices',
      'Online stores available',
      'Basic SEO setup',
      'Contact form connected to a database',
      'Bilingual support (EN/AR) available',
      'Domain & hosting included for the first year',
      'Revision rounds and launch support',
      'Optional admin dashboard',
    ],
    features_ar: [
      'تصميم عصري متجاوب مع كل الأجهزة',
      'متاجر إلكترونية متاحة',
      'إعداد أساسي لمحركات البحث',
      'نموذج تواصل مرتبط بقاعدة بيانات',
      'دعم لغتين (عربي/إنجليزي) متاح',
      'الدومين والاستضافة مشمولان في السنة الأولى',
      'جولات تعديل ودعم عند الإطلاق',
      'لوحة تحكم اختيارية',
    ],
    is_popular: true,
    order: 1,
  },
  {
    id: 'apps',
    name: 'Web Apps',
    name_ar: 'تطبيقات الويب',
    price: '',
    price_ar: '',
    price_label: 'Custom Quote',
    price_label_ar: 'حسب الطلب',
    currency: '',
    show_price: false,
    description: 'Full-stack web applications and platforms built for scale, performance, and real users.',
    description_ar: 'تطبيقات ومنصات ويب متكاملة مبنية للتوسع والأداء العالي.',
    features: [
      'UI/UX design tailored to your idea',
      'Database, login and user accounts',
      'Admin dashboard and analytics',
      'Scalable architecture',
      'Domain & hosting included for the first year',
      'Dedicated support after launch',
    ],
    features_ar: [
      'تصميم UI/UX مخصص لفكرتك',
      'قاعدة بيانات وتسجيل دخول وحسابات مستخدمين',
      'لوحة تحكم وإحصائيات',
      'بنية قابلة للتوسع',
      'الدومين والاستضافة مشمولان في السنة الأولى',
      'دعم مخصص بعد الإطلاق',
    ],
    is_popular: false,
    order: 2,
  },
];

export const getPlansByLang = (lang = 'en') => {
  return plans
    .sort((a, b) => a.order - b.order)
    .map((plan) => ({
      ...plan,
      name: lang === 'ar' ? plan.name_ar : plan.name,
      price: lang === 'ar' ? plan.price_ar : plan.price,
      price_label: lang === 'ar' ? plan.price_label_ar : plan.price_label,
      description: lang === 'ar' ? plan.description_ar : plan.description,
      features: lang === 'ar' ? plan.features_ar : plan.features,
    }));
};
