import React from 'react';
import SectionTitle from './common/SectionTitle';

// Clean SVG icons for all 10 technologies
const techIcons = {
  React: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </svg>
  ),
  'Next.js': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9 8.5v7l6.8-7.8v7.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Node.js': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 2.5l8 4.6v9.2l-8 4.6-8-4.6V7.1l8-4.6z" />
      <path d="M12 7.5v9m-4-6.5l8 4.5" />
    </svg>
  ),
  TypeScript: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7 9h6m-3 0v7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14.5c.5.8 1.4 1.2 2.5 1 1-.2 1.5-1 1.5-1.7 0-1.8-3-1.2-3-2.6 0-.7.6-1.4 1.6-1.4.9 0 1.6.4 2 1.1" strokeLinecap="round" />
    </svg>
  ),
  Firebase: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4.5 17.5L6.5 4.5l3.5 6.5-5.5 6.5z" strokeLinejoin="round" />
      <path d="M19.5 17.5l-2-12.5-4 7.5 6 5z" strokeLinejoin="round" />
      <path d="M4.5 17.5l7.5 4 7.5-4-7.5-13-7.5 13z" strokeLinejoin="round" />
    </svg>
  ),
  PostgreSQL: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <ellipse cx="12" cy="6" rx="7.5" ry="3.5" />
      <path d="M4.5 6v6c0 1.9 3.4 3.5 7.5 3.5s7.5-1.6 7.5-3.5V6" />
      <path d="M4.5 12v6c0 1.9 3.4 3.5 7.5 3.5s7.5-1.6 7.5-3.5v-6" />
    </svg>
  ),
  'Tailwind CSS': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 12c1.5-3 3.5-3.5 5.5-2.5 1.5.8 2.5 2 4.5 1.5 2-.5 3-2 3.5-3.5-1.5 3-3.5 3.5-5.5 2.5-1.5-.8-2.5-2-4.5-1.5-2 .5-3 2-3.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17c1.5-3 3.5-3.5 5.5-2.5 1.5.8 2.5 2 4.5 1.5 2-.5 3-2 3.5-3.5-1.5 3-3.5 3.5-5.5 2.5-1.5-.8-2.5-2-4.5-1.5-2 .5-3 2-3.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Figma: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="15.5" cy="12" r="3.5" />
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2h3.5v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
    </svg>
  ),
};

const technologies = [
  { name: 'React', key: 'React' },
  { name: 'Next.js', key: 'Next.js' },
  { name: 'Node.js', key: 'Node.js' },
  { name: 'TypeScript', key: 'TypeScript' },
  { name: 'Firebase', key: 'Firebase' },
  { name: 'PostgreSQL', key: 'PostgreSQL' },
  { name: 'Tailwind CSS', key: 'Tailwind CSS' },
  { name: 'Figma', key: 'Figma' },
];

export const TechStack = ({ t }) => {
  // Duplicate array 2x for seamless marquee looping
  const marqueeItems = [...technologies, ...technologies];

  return (
    <section className="relative py-20 bg-[#0A0A0A] overflow-hidden border-t border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <SectionTitle
          badge={t.techStack.badge}
          title={t.techStack.title}
          subtitle={t.techStack.subtitle}
        />
      </div>

      {/* Infinite Horizontal Marquee Container */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Edge Gradient Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-36 md:w-52 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-36 md:w-52 bg-gradient-to-l from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent z-20" />

        {/* Marquee Track */}
        <div className="animate-marquee gap-4 sm:gap-6 items-center px-4">
          {marqueeItems.map((tech, index) => {
            const Icon = techIcons[tech.key] || techIcons.React;

            return (
              <div
                key={`${tech.name}-${index}`}
                className="group shrink-0 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#111111]/85 border border-white/[0.08] backdrop-blur-md transition-all duration-300 hover:border-[#00FF88]/40 hover:bg-[#151515] hover:shadow-[0_0_20px_rgba(0,255,136,0.22)] cursor-default select-none"
              >
                <div className="w-5 h-5 text-[#71717A] group-hover:text-[#00FF88] group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-full h-full" />
                </div>
                <span className="text-sm font-medium text-[#A1A1AA] group-hover:text-white transition-colors duration-200">
                  {tech.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechStack;

