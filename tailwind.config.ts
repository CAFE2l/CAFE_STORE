import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          red: {
            400: '#E74C3C',
            500: '#C0392B',
            600: '#A93226',
          },
          orange: {
            400: '#F39C12',
            500: '#E67E22',
            600: '#CA6F1E',
          },
          yellow: {
            400: '#F9CA24',
            500: '#F1C40F',
            600: '#D4AC0D',
          },
          dark: {
            900: '#111111',
            800: '#1A1A1A',
            700: '#2C2C2C',
            600: '#3A3A3A',
          },
          gray: {
            400: '#A0A0A0',
            300: '#C0C0C0',
            200: '#E0E0E0',
          },
        },
        background: {
          base: '#111111',
          surface: '#2C2C2C',
          card: '#1A1A1A',
        },
        border: {
          subtle: '#2C2C2C',
          highlight: 'rgba(230,126,34,0.45)',
        },
        accent: {
          primary: '#E67E22',
          secondary: '#C0392B',
          glow: '#F1C40F',
        },
        text: {
          primary: '#ffffff',
          secondary: '#F5F5F5',
          muted: '#A0A0A0',
        },
        status: {
          success: '#22c55e',
          error: '#E74C3C',
          info: '#F39C12',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        badge: '4px',
        button: '8px',
      },
      keyframes: {
        flame: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow:
              '0 0 8px rgba(230,126,34,0.28), 0 0 18px rgba(192,57,43,0.12)',
          },
          '50%': {
            boxShadow:
              '0 0 18px rgba(230,126,34,0.62), 0 0 44px rgba(241,196,15,0.22)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        flame: 'flame 1.8s ease-out infinite',
        'slide-up': 'slideUp 0.28s ease-out both',
        'fade-in': 'fadeIn 0.25s ease-out both',
        fadeUp: 'fadeUp 0.5s ease-out both',
        fadeIn: 'fadeIn 0.35s ease-out both',
        scaleIn: 'scaleIn 0.25s ease-out both',
        shimmer: 'shimmer 1.5s linear infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        slideInRight: 'slideInRight 0.45s ease-out both',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounceSoft: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
