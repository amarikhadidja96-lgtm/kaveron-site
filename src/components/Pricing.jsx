import React from 'react';
import { Check, ArrowRight, Sparkles, Zap } from 'lucide-react';
import SectionTitle from './common/SectionTitle';
import Button from './common/Button';
import { getPlansByLang } from '../data/plans';

export const Pricing = ({ t, currentLang, onNavigate }) => {
  const plans = getPlansByLang(currentLang);
  const sectionT = t.pricingSection;
  const isRtl = currentLang === 'ar';

  // Fixed slug-based routes: Plan 1 → /contact?plan=websites, Plan 2 → /contact?plan=apps
  const planRoutes = { websites: 'websites', apps: 'apps' };

  const handleAction = (planId) => {
    const slug = planRoutes[planId] || planId;
    const url = `/contact?plan=${slug}`;
    if (onNavigate) onNavigate(url);
    else window.location.href = url;
  };

  const handleContactLink = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate('/contact');
    else window.location.href = '/contact';
  };

  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FF88]/[0.04] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <SectionTitle
          badge={sectionT.badge}
          title={sectionT.title}
          subtitle={sectionT.subtitle}
          className="mb-16 md:mb-20 text-center"
        />

        {/* Two Cards — centered, max 900px, equal height via CSS grid with align-items stretch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[900px] mx-auto" style={{ alignItems: 'stretch' }}>
          {plans.map((plan) => {
            const isPopular = plan.is_popular;
            const btnLabel = plan.id === 'websites'
              ? sectionT.getQuote
              : sectionT.requestQuote;

            return (
              <div
                key={plan.id}
                className={`relative rounded-[24px] backdrop-blur-xl p-8 flex flex-col transition-all duration-300 ${
                  isPopular
                    ? 'bg-[#121212] border-2 border-[#00FF88] shadow-[0_0_40px_rgba(0,255,136,0.22)]'
                    : 'bg-[#111111]/90 border border-white/[0.08] hover:border-[#00FF88] hover:shadow-[0_0_40px_rgba(0,255,136,0.22)]'
                }`}
              >
                {/* Subtle top neon line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/60 to-transparent rounded-t-[24px]" />

                {/* "Most Requested" Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#00FF88] text-[#0A0A0A] text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_18px_rgba(0,255,136,0.55)] uppercase whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{sectionT.popularBadge}</span>
                  </div>
                )}

                <div className="flex-1">
                  {/* Plan Name */}
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight mb-4 mt-1">
                    {plan.name}
                  </h3>

                  {/* Price Block: small label in JetBrains Mono + large price in Space Grotesk */}
                  <div className="mb-6 pb-6 border-b border-white/[0.08] min-h-[92px] flex flex-col justify-end">
                    {plan.show_price ? (
                      <>
                        <span className="font-mono text-xs text-[#00FF88] uppercase tracking-wider block mb-1.5">
                          {plan.price_label}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          {plan.currency && (
                            <span className="text-2xl font-heading font-bold text-[#00FF88]">
                              {plan.currency}
                            </span>
                          )}
                          <span className="text-4xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
                            {plan.price}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-xs text-[#71717A] uppercase tracking-wider block mb-1.5">
                          // {isRtl ? 'نطاق مخصص' : 'TAILORED SCOPE'}
                        </span>
                        <span className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
                          {plan.price_label}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6 min-h-[44px]">
                    {plan.description}
                  </p>

                  {/* Feature Checklist — grows to fill space */}
                  <ul className="space-y-3.5 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#D4D4D8]">
                        <div className="w-5 h-5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-[#00FF88]" strokeWidth={3} />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <Button
                    onClick={() => handleAction(plan.id)}
                    variant={isPopular ? 'primary' : 'outline'}
                    size="lg"
                    className={`w-full justify-center font-bold group ${
                      isPopular ? 'shadow-[0_0_20px_rgba(0,255,136,0.35)] hover:shadow-[0_0_30px_rgba(0,255,136,0.55)]' : ''
                    }`}
                  >
                    <span>{btnLabel}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Domain & Hosting Renewal Note */}
        {sectionT.hostingNote && (
          <p className="mt-6 text-center text-xs font-mono text-[#71717A]">
            * {sectionT.hostingNote}
          </p>
        )}

        {/* Bottom Note */}
        <div className="mt-8 text-center max-w-xl mx-auto">
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            {sectionT.customNote}{' '}
            <a
              href="/contact"
              onClick={handleContactLink}
              className="text-[#00FF88] hover:text-[#00E57A] transition-colors underline underline-offset-4 font-semibold"
            >
              {sectionT.customNoteLink}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
