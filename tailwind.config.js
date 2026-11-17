/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0A',
          card: '#111111',
          'card-hover': '#161616',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(0, 255, 136, 0.4)',
        },
        neon: {
          green: '#00FF88',
          'green-glow': 'rgba(0, 255, 136, 0.35)',
          'green-dark': '#00CC6A',
          'green-subtle': 'rgba(0, 255, 136, 0.08)',
        },
        body: '#A1A1AA',
        heading: '#FFFFFF',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        arabic: ['"Cairo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 255, 136, 0.35)',
        'neon-sm': '0 0 10px rgba(0, 255, 136, 0.25)',
        'neon-lg': '0 0 35px rgba(0, 255, 136, 0.45)',
        'neon-subtle': '0 0 15px rgba(0, 255, 136, 0.15)',
      },
      borderRadius: {
        card: '16px',
        'card-lg': '20px',
        'card-sm': '12px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 6s ease-in-out infinite alternate',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%': { transform: 'scale(0.95) translate(0px, 0px)', opacity: '0.25' },
          '50%': { transform: 'scale(1.1) translate(40px, -20px)', opacity: '0.45' },
          '100%': { transform: 'scale(1.0) translate(-30px, 30px)', opacity: '0.3' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

