import React from 'react';

/**
 * Reusable Button component for Kaveron Agency.
 * Supports primary (neon green solid) and outline (glass/white/neon border) styles.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  icon: Icon,
  iconPosition = 'right',
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#00FF88] text-[#0A0A0A] hover:bg-[#00E57A] shadow-[0_0_20px_rgba(0,255,136,0.35)] hover:shadow-[0_0_28px_rgba(0,255,136,0.55)] border border-[#00FF88]',
    outline:
      'bg-transparent text-[#FFFFFF] border border-white/15 hover:border-[#00FF88] hover:text-[#00FF88] hover:bg-[#00FF88]/5 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]',
    ghost:
      'bg-transparent text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-white/5 border border-transparent',
    glass:
      'bg-[#111111]/80 backdrop-blur-md text-[#FFFFFF] border border-white/10 hover:border-[#00FF88]/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.25)]',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
    variantStyles[variant] || variantStyles.primary
  } ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClasses} {...props}>
      {content}
    </button>
  );
};

export default Button;

