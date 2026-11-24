/**
 * Contact & Social Links Configuration (contact.config)
 *
 * Use this file to manage all public contact methods and social links.
 * If a value is empty ("") or left as a placeholder, the corresponding
 * element (button, card, or badge) is automatically hidden across the site.
 */

export const contactConfig = {
  // Public contact email address
  // Leave empty ("") to hide all email badges, cards, and links
  email: '', // e.g. 'contact@yourdomain.com'

  // WhatsApp phone number in international format
  // International format with or without '+' (e.g. '+213657401196' or '213657401196')
  // The system automatically strips non-digits for wa.me links.
  // Leave empty ("") to hide all WhatsApp buttons, cards, and links
  whatsapp: '213657401196',

  // Social media profile URLs
  // Only profiles with non-empty, valid URLs will be displayed.
  // Left empty by default as requested.
  socials: {
    // linkedin: 'https://linkedin.com/company/kaveron',
    linkedin: '',
    // instagram: 'https://instagram.com/kaveron',
    instagram: '',
    // twitter: 'https://x.com/kaveron',
    twitter: '',
    // github: 'https://github.com/kaveron',
    github: '',
  },
};

/**
 * Checks if a value is considered empty, null, or an obvious placeholder
 */
export const isPlaceholder = (val) => {
  if (!val || typeof val !== 'string') return true;
  const trimmed = val.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  return (
    lower.includes('example.com') ||
    lower.includes('yourdomain.com') ||
    lower.includes('placeholder') ||
    lower === 'hello@kaveron.com' ||
    lower === 'email@example.com' ||
    lower === 'name@example.com' ||
    lower === '+1 555 019 2834'
  );
};

/**
 * Normalizes phone number to digits only for wa.me links (e.g. '213657401196')
 */
export const getCleanWhatsAppNumber = (phone = contactConfig.whatsapp) => {
  if (!phone || isPlaceholder(phone)) return '';
  return phone.replace(/\D/g, '');
};

/**
 * Generates the localized WhatsApp pre-filled link
 */
export const getWhatsAppLink = (currentLang = 'en', phone = contactConfig.whatsapp) => {
  const cleanNumber = getCleanWhatsAppNumber(phone);
  if (!cleanNumber) return '';
  const message = currentLang === 'ar'
    ? 'مرحباً، أود مناقشة مشروع'
    : "Hello, I'd like to discuss a project";
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

export default contactConfig;
