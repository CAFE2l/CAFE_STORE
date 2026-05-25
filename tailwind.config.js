const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: 'rgba(255,255,255,0.06)',
          hover: 'rgba(255,255,255,0.04)',
        },
        brand: {
          DEFAULT: '#F97316',
          light: '#FB923C',
          dark: '#EA580C',
          glow: 'rgba(249,115,22,0.4)',
        },
      },
      boxShadow: {
        'led-brand': '0 0 12px 2px rgba(249,115,22,0.5), 0 0 32px 4px rgba(249,115,22,0.2)',
        'led-sm': '0 0 8px 1px rgba(249,115,22,0.35)',
        card: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        glass: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-led': 'pulseLed 2.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.93)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        pulseLed: {
          '0%,100%': { boxShadow: '0 0 8px 1px rgba(249,115,22,0.3)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(249,115,22,0.6)' },
        },
      },
      backdropBlur: { xs: '2px' },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34,1.56,0.64,1)',
        smooth: 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    plugin(function ({ addComponents }) {
      // provide any extra admin helpers if needed later
    }),
  ],
}
