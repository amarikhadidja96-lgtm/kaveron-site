import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap, Smartphone, Layers, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import Card from './common/Card';
import SectionTitle from './common/SectionTitle';
import { slideUp, staggerContainer } from '../utils/motion';

// Map icon names from translation to Lucide icon components
const iconMap = {
  Globe: Globe,
  Zap: Zap,
  Smartphone: Smartphone,
  Layers: Layers,
};

export const Services = ({ t, onNavigate }) => {
  return (
    <section id="services" className="relative py-20 md:py-28 bg-[#0A0A0A]">
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-[#00FF88]/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00FF88]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <SectionTitle
          badge={t.services.badge}
          title={t.services.title}
          subtitle={t.services.subtitle}
          className="mb-16 md:mb-20 text-center"
        />

        {/* 3 Glass Cards:
            - 1 col  below md (< 768px)
            - 2 cols at md (768–1023px) — 3rd card centered via col-span-2
            - 3 cols at lg (≥ 1024px)
        */}
        <motion.div
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {t.services.items.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Globe;
            // Third card spans both columns in 2-col layout so it centers
            const isThirdCard = index === 2;

            return (
              <motion.div
                key={service.id}
                variants={slideUp(0)}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                className={`${isThirdCard ? 'md:col-span-2 md:max-w-md md:mx-auto md:w-full lg:col-span-1 lg:max-w-none lg:mx-0' : ''}`}
              >
                <Card className="flex flex-col justify-between h-full group">
                <div>
                  {/* Neon Green Icon Badge */}
                  <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center text-[#00FF88] mb-6 group-hover:scale-110 group-hover:bg-[#00FF88]/20 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.35)] transition-all duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Card Title */}
                  <h3 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-[#00FF88] transition-colors duration-200">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6 font-normal">
                    {service.description}
                  </p>

                  {/* 3 Feature Bullet Points */}
                  <ul className="space-y-2.5 mb-8 border-t border-white/[0.06] pt-5">
                    {service.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#D4D4D8]">
                        <CheckCircle2 className="w-4 h-4 text-[#00FF88] shrink-0 mt-0.5" />
                        <span className="leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learn More link with hover effect */}
                <div className="pt-2">
                  <a
                    href={service.href}
                    onClick={(e) => {
                      if (service.href === '/contact' && onNavigate) {
                        e.preventDefault();
                        onNavigate('/contact');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-[#00FF88] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88] rounded p-1"
                  >
                    <span>{t.services.learnMore}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
                  </a>
                </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* "Included with every project" strip */}
        <div className="mt-12 max-w-6xl mx-auto rounded-2xl bg-[#111111]/70 border border-white/[0.07] backdrop-blur-md px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 flex-wrap">
          <span className="font-mono text-xs text-[#00FF88] tracking-widest uppercase shrink-0">
            {t.services.includedLabel || '// Included with every project'}
          </span>
          {(t.services.included || [
            'Domain & Hosting — 1st Year',
            'Responsive Design',
            'Basic SEO',
          ]).map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[#D4D4D8]">
              <ShieldCheck className="w-4 h-4 text-[#00FF88] shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
