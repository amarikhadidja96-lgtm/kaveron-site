import React from 'react';

/**
 * Reusable Badge component using JetBrains Mono font.
 * Ideal for small status labels, category tags, and section kickers.
 */
export const Badge = ({
  children,
  withDot = true,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111]/90 border border-white/10 backdrop-blur-md font-mono text-xs text-[#A1A1AA] hover:border-[#00FF88]/40 transition-colors duration-300 ${className}`}
    >
      {withDot && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
        </span>
      )}
      <span className="tracking-wide text-[#E4E4E7] font-medium">{children}</span>
    </div>
  );
};

export default Badge;

