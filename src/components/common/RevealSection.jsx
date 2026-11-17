import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, slideUp } from '../../utils/motion';

/**
 * Wrapper that animates its children in with a staggered slide-up
 * when the section scrolls into view.
 */
export const RevealSection = ({ children, className = '', delay = 0 }) => {
  const container = staggerContainer(0.08, delay);

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
};

export const RevealItem = ({ children, className = '' }) => {
  const item = slideUp(0);
  return (
    <motion.div
      className={className}
      variants={item}
    >
      {children}
    </motion.div>
  );
};

export default RevealSection;
