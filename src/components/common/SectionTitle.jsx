import React from 'react';
import { motion } from 'framer-motion';
import Badge from './Badge';
import { slideUp, staggerContainer } from '../../utils/motion';

/**
 * Reusable Section Title component with badge, headline, and subtitle.
 * Animates in when scrolled into view.
 */
export const SectionTitle = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
  as = 'h2',
}) => {
  const alignmentClasses = {
    center: 'text-center items-center',
    left: 'text-left items-start rtl:text-right rtl:items-start',
    right: 'text-right items-end rtl:text-left rtl:items-start',
  };

  const HeadingTag = as;
  const container = staggerContainer(0.08, 0);
  const item = slideUp(0);

  return (
    <motion.div
      className={`flex flex-col ${alignmentClasses[align] || alignmentClasses.center} ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {badge && (
        <motion.div variants={item}>
          <Badge className="mb-4">{badge}</Badge>
        </motion.div>
      )}
      {title && (
        <motion.div variants={item}>
          <HeadingTag className="text-fluid-h2 font-heading font-bold text-white tracking-tight leading-tight mb-4">
            {title}
          </HeadingTag>
        </motion.div>
      )}
      {subtitle && (
        <motion.p
          className="text-fluid-body text-[#A1A1AA] max-w-2xl leading-relaxed font-normal"
          variants={item}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};

export default SectionTitle;
