import React from 'react';

/**
 * Reusable Glassmorphic Card component.
 * Features dark background (#111111), fine border rgba(255,255,255,0.08),
 * subtle backdrop blur, and slight lift + neon green glow on hover.
 */
export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative group rounded-[18px] bg-[#111111]/90 border border-white/[0.08] backdrop-blur-xl p-6 md:p-8 transition-all duration-300 ${
        hoverEffect
          ? 'hover:-translate-y-1.5 hover:border-[#00FF88]/40 hover:shadow-[0_0_25px_rgba(0,255,136,0.22)]'
          : ''
      } ${className}`}
      {...props}
    >
      {/* Subtle top inner highlight border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[18px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#00FF88]/40 transition-colors duration-300" />
      {children}
    </div>
  );
};

export default Card;

