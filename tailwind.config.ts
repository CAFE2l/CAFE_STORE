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
        background: {
          base: '#070707',
          surface: '#121212',
          card: '#1b1b1b',
        },
        border: {
          subtle: 'rgba(255,255,255,0.10)',
          highlight: 'rgba(255,193,7,0.40)',
        },
        accent: {
          primary: '#ff6a00',
          secondary: '#e11d2e',
          glow: '#ffd21f',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e8e0d4',
          muted: '#a79f95',
        },
        status: {
          success: '#22c55e',
          error: '#ef233c',
          info: '#ffd21f',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
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
              '0 0 8px rgba(200,135,58,0.28), 0 0 18px rgba(200,135,58,0.12)',
          },
          '50%': {
            boxShadow:
              '0 0 18px rgba(200,135,58,0.62), 0 0 44px rgba(200,135,58,0.26)',
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
