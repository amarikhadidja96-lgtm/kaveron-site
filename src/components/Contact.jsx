import React, { useState, useEffect, useRef } from 'react';
import { Mail, MessageCircle, Clock, Send, CheckCircle2, ArrowRight, ArrowLeft, X, Sparkles, AlertCircle } from 'lucide-react';
import SectionTitle from './common/SectionTitle';
import Button from './common/Button';
import BackToHome from './common/BackToHome';
import { submitLead } from '../lib/leads';

export const Contact = ({
  t,
  currentLang,
  initialPlan = null,
  initialProject = null,
  onClearPlan,
  onBackToHome,
  onNavigate,
}) => {
  const isRtl = currentLang === 'ar';
  const contactT = t.contactSection;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: 'Websites & Landing Pages',
    budget: '$1500-$5000',
    message: '',
    honeypot: '', // spam protection honeypot
  });

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const lastSubmitTime = useRef(0);

  // Sync initialPlan if passed (?plan=websites or ?plan=apps)
  useEffect(() => {
    if (initialPlan) {
      const lower = initialPlan.toLowerCase().trim();
      if (lower === 'websites' || lower.includes('website') || lower.includes('landing')) {
        setSelectedPlan(isRtl ? 'المواقع والمتاجر وصفحات الهبوط' : 'Websites, Online Stores & Landing Pages');
        setFormData((prev) => ({ ...prev, service_type: 'Websites & Landing Pages' }));
      } else if (lower === 'apps' || lower.includes('app')) {
        setSelectedPlan(isRtl ? 'تطبيقات الويب' : 'Web Apps');
        setFormData((prev) => ({ ...prev, service_type: 'Web Apps' }));
      } else {
        setSelectedPlan(initialPlan);
        setFormData((prev) => ({ ...prev, service_type: 'Other / Not sure yet' }));
      }
    }
  }, [initialPlan, isRtl]);

  // Sync initialProject and pre-fill message
  useEffect(() => {
    if (initialProject) {
      const prefilled = isRtl
        ? `أنا مهتم بمشروع مشابه لـ ${initialProject}`
        : `I'm interested in a project similar to ${initialProject}`;
      setFormData((prev) => ({ ...prev, message: prefilled }));
    }
  }, [initialProject, isRtl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on edit
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = contactT.validation.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = contactT.validation.emailRequired;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = contactT.validation.emailInvalid;
      }
    }

    if (!formData.message.trim() || formData.message.trim().length < 8) {
      newErrors.message = contactT.validation.messageRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Honeypot check: bot detected if filled
    if (formData.honeypot) {
      console.warn('Bot detected via honeypot.');
      setIsSubmitted(true);
      return;
    }

    // 2. Simple rate limit (min 8s between submissions)
    const now = Date.now();
    if (now - lastSubmitTime.current < 8000) {
      setErrors((prev) => ({ ...prev, general: contactT.validation.rateLimit }));
      return;
    }

    // 3. Validation
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const leadPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.service_type,
        budget: formData.budget,
        message: formData.message,
        source: selectedPlan ? 'pricing' : initialProject ? 'project_modal' : 'contact_form',
        selected_plan: selectedPlan,
        language: currentLang || 'en',
        honeypot: formData.honeypot || '',
      };

      // 4. Submit to Edge Function / Supabase
      await submitLead(leadPayload);

      lastSubmitTime.current = Date.now();
      setIsSubmitted(true);
      // Reset form fields
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: 'Websites & Landing Pages',
        budget: '$1500-$5000',
        message: '',
        honeypot: '',
      });
      setSelectedPlan(null);
      if (onClearPlan) onClearPlan();
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ general: contactT.validation?.unexpectedError || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrors({});
  };

  const removeSelectedPlan = () => {
    setSelectedPlan(null);
    if (onClearPlan) onClearPlan();
  };

  return (
    <section id="contact" className="relative py-16 md:py-24 bg-[#0A0A0A] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-10 w-[450px] h-[450px] bg-[#00FF88]/[0.035] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#00FF88]/[0.025] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back to Home + Breadcrumb */}
        {onBackToHome && (
          <BackToHome
            onNavigate={onNavigate || (() => onBackToHome())}
            isRtl={isRtl}
            label={contactT.backToHome || (isRtl ? 'العودة إلى الرئيسية →' : '← Back to Home')}
            breadcrumbs={[
              { label: contactT.breadcrumbHome || 'Home', href: '/' },
              { label: contactT.breadcrumbContact || (isRtl ? 'تواصل معنا' : 'Contact') },
            ]}
          />
        )}

        {/* Section Header */}
        <SectionTitle
          as="h1"
          badge={contactT.badge}
          title={contactT.title}
          subtitle={contactT.subtitle}
          className="mb-16 md:mb-20 text-center"
        />

        {/* Two-Column Layout (Stacked on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start max-w-6xl mx-auto">
          {/* Left Column: Contact Methods & Hours (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="font-mono text-xs text-[#00FF88] tracking-widest uppercase mb-2 block">
                {contactT.getConnectedBadge || '// GET CONNECTED'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight mb-4">
                {contactT.cards.emailTitle}
              </h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-8">
                {contactT.subtitle}
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4">
              {/* Email Card */}
              <a
                href={`mailto:${contactT.cards.emailValue}`}
                className="group p-5 rounded-[18px] bg-[#111111]/90 border border-white/[0.08] backdrop-blur-xl flex items-center gap-4 transition-all duration-300 hover:border-[#00FF88]/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.18)] hover:-translate-y-1 block"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center text-[#00FF88] shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.35)] transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider block">
                    {contactT.cards.emailTitle}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-white group-hover:text-[#00FF88] transition-colors">
                    {contactT.cards.emailValue}
                  </span>
                  <span className="text-xs text-[#A1A1AA] block mt-0.5">
                    {contactT.cards.emailSub}
                  </span>
                </div>
              </a>

              {/* WhatsApp Card */}
              <a
                href={`https://wa.me/213657401196`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-[18px] bg-[#111111]/90 border border-white/[0.08] backdrop-blur-xl flex items-center gap-4 transition-all duration-300 hover:border-[#00FF88]/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.18)] hover:-translate-y-1 block"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center text-[#00FF88] shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.35)] transition-all">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider block">
                    {contactT.cards.whatsappTitle}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-white group-hover:text-[#00FF88] transition-colors">
                    {contactT.cards.whatsappValue}
                  </span>
                  <span className="text-xs text-[#A1A1AA] block mt-0.5">
                    {contactT.cards.whatsappSub}
                  </span>
                </div>
              </a>

              {/* Working Hours Card */}
              <div className="p-5 rounded-[18px] bg-[#111111]/70 border border-white/[0.06] backdrop-blur-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#A1A1AA] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider block">
                    {contactT.cards.hoursTitle}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white block">
                    {contactT.cards.hoursValue}
                  </span>
                  <span className="text-xs text-[#A1A1AA] block mt-0.5">
                    {contactT.cards.hoursSub}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glass Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[24px] bg-[#111111]/90 border border-white/[0.1] backdrop-blur-xl p-7 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
              {/* Subtle top neon border accent */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/50 to-transparent" />

              {isSubmitted ? (
                /* Success State with Animated Check */
                <div className="py-12 px-4 text-center flex flex-col items-center animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-[#00FF88]/15 border-2 border-[#00FF88] flex items-center justify-center text-[#00FF88] mb-6 shadow-[0_0_30px_rgba(0,255,136,0.4)] animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-3">
                    {contactT.success.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#A1A1AA] max-w-md leading-relaxed mb-8">
                    {contactT.success.text}
                  </p>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="md"
                    className="font-semibold"
                  >
                    <span>{contactT.success.anotherBtn}</span>
                    <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                  </Button>
                </div>
              ) : (
                /* Active Form */
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Honeypot hidden input (Spam protection) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* General Error Banner if any */}
                  {errors.general && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.general}</span>
                    </div>
                  )}

                  {/* Preselected Plan Notification Pill */}
                  {selectedPlan && (
                    <div className="p-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-between text-xs text-[#00FF88] font-mono">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {contactT.form.selectedPlanBadge}{' '}
                          <strong className="text-white font-bold">{selectedPlan}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeSelectedPlan}
                        className="text-[#A1A1AA] hover:text-white flex items-center gap-1 text-[11px] underline cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>{contactT.form.clearPlan}</span>
                      </button>
                    </div>
                  )}

                  {/* Full Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-mono text-[#D4D4D8] mb-1.5"
                      >
                        {contactT.form.nameLabel}
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        placeholder={contactT.form.namePlaceholder}
                        className={`w-full px-4 py-3 rounded-xl bg-[#161616] border text-sm text-white placeholder-[#52525B] focus:outline-none transition-all ${errors.name
                            ? 'border-red-500/60 focus:border-red-500'
                            : 'border-white/10 focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.25)]'
                          }`}
                      />
                      {errors.name && (
                        <p id="contact-name-error" className="mt-1 text-xs text-red-400">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-mono text-[#D4D4D8] mb-1.5"
                      >
                        {contactT.form.emailLabel}
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        dir="ltr"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        placeholder={contactT.form.emailPlaceholder}
                        className={`w-full px-4 py-3 rounded-xl bg-[#161616] border text-sm text-white placeholder-[#52525B] focus:outline-none transition-all ${errors.email
                            ? 'border-red-500/60 focus:border-red-500'
                            : 'border-white/10 focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.25)]'
                          }`}
                      />
                      {errors.email && (
                        <p id="contact-email-error" className="mt-1 text-xs text-red-400">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Service Type Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-xs font-mono text-[#D4D4D8] mb-1.5"
                      >
                        {contactT.form.phoneLabel}
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        dir="ltr"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={contactT.form.phonePlaceholder}
                        className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-sm text-white placeholder-[#52525B] focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.25)] transition-all"
                      />
                    </div>

                    {/* Service Type Selector */}
                    <div>
                      <label
                        htmlFor="contact-service"
                        className="block text-xs font-mono text-[#D4D4D8] mb-1.5"
                      >
                        {contactT.form.serviceLabel}
                      </label>
                      <select
                        id="contact-service"
                        name="service_type"
                        value={formData.service_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.25)] transition-all cursor-pointer"
                      >
                        <option value="Websites & Landing Pages">
                          {isRtl ? 'المواقع وصفحات الهبوط' : 'Websites & Landing Pages'}
                        </option>
                        <option value="Online Store">
                          {isRtl ? 'متجر إلكتروني' : 'Online Store'}
                        </option>
                        <option value="Web Apps">
                          {isRtl ? 'تطبيقات الويب' : 'Web Apps'}
                        </option>
                        <option value="Other / Not sure yet">
                          {isRtl ? 'أخرى / لست متأكداً بعد' : 'Other / Not sure yet'}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Budget Selector */}
                  <div>
                    <label
                      htmlFor="contact-budget"
                      className="block text-xs font-mono text-[#D4D4D8] mb-1.5"
                    >
                      {contactT.form.budgetLabel}
                    </label>
                    <select
                      id="contact-budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.25)] transition-all cursor-pointer"
                    >
                      <option value="Under $500">{contactT.form?.budgets?.[0] || 'Under $500'}</option>
                      <option value="$500-$1500">{contactT.form?.budgets?.[1] || '$500 - $1,500'}</option>
                      <option value="$1500-$5000">{contactT.form?.budgets?.[2] || '$1,500 - $5,000'}</option>
                      <option value="$5000+">{contactT.form?.budgets?.[3] || '$5,000+'}</option>
                    </select>
                  </div>

                  {/* Project Details Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-mono text-[#D4D4D8] mb-1.5"
                    >
                      {contactT.form.messageLabel}
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      placeholder={contactT.form.messagePlaceholder}
                      className={`w-full px-4 py-3 rounded-xl bg-[#161616] border text-sm text-white placeholder-[#52525B] focus:outline-none transition-all resize-none ${errors.message
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-white/10 focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.25)]'
                        }`}
                    />
                    {errors.message && (
                      <p id="contact-message-error" className="mt-1 text-xs text-red-400">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full justify-center font-bold text-base shadow-[0_0_25px_rgba(0,255,136,0.35)] hover:shadow-[0_0_35px_rgba(0,255,136,0.6)] py-4"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                          <span>{contactT.form.submittingBtn}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{contactT.form.submitBtn}</span>
                          <Send className="w-4 h-4 rtl:rotate-180" />
                        </div>
                      )}
                    </Button>

                    {/* Privacy Agreement Line */}
                    <p className="text-center text-xs text-[#A1A1AA] mt-3.5 leading-relaxed font-normal">
                      {isRtl ? (
                        <>
                          بإرسال هذا النموذج فإنك توافق على{' '}
                          <a
                            href="/privacy"
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate?.('/privacy') || (window.location.href = '/privacy');
                            }}
                            className="text-[#00FF88] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00FF88] rounded px-0.5"
                          >
                            سياسة الخصوصية
                          </a>
                          .
                        </>
                      ) : (
                        <>
                          By sending this form you agree to the{' '}
                          <a
                            href="/privacy"
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate?.('/privacy') || (window.location.href = '/privacy');
                            }}
                            className="text-[#00FF88] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00FF88] rounded px-0.5"
                          >
                            Privacy Policy
                          </a>
                          .
                        </>
                      )}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
