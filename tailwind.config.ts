import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          red: { 400: '#E74C3C', 500: '#C0392B', 600: '#A93226' },
          orange: { 400: '#F39C12', 500: '#E67E22', 600: '#CA6F1E' },
          yellow: { 400: '#F9CA24', 500: '#F1C40F', 600: '#D4AC0D' },
          dark: { 900: '#111111', 800: '#1A1A1A', 700: '#2C2C2C', 600: '#3A3A3A' },
          gray: { 400: '#A0A0A0', 300: '#C0C0C0', 200: '#E0E0E0' },
        },
        brand: {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dark: '#ea580c',
          muted: '#9a3412',
          glow: 'rgba(249,115,22,0.35)',
        },
        glass: {
          white: 'rgba(255,255,255,0.05)',
          dark: 'rgba(0,0,0,0.35)',
          border: 'rgba(255,255,255,0.08)',
        },
        surface: {
          base: '#0a0a0a',
          1: '#111111',
          2: '#1a1a1a',
          3: '#222222',
          4: '#2a2a2a',
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url('/textures/noise.svg')",
        'led-scan': 'linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.6) 50%, transparent 100%)',
        'orange-glow-orb': 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
        'glass-surface': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 8px 2px rgba(249,115,22,0.25)',
        'glow-md': '0 0 20px 6px rgba(249,115,22,0.30)',
        'glow-lg': '0 0 40px 10px rgba(249,115,22,0.35)',
        'glow-xl': '0 0 60px 16px rgba(249,115,22,0.40)',
        'led-border': '0 0 0 1px rgba(249,115,22,0.5), 0 0 12px rgba(249,115,22,0.25)',
        'led-brand': '0 0 12px 2px #F9731660, 0 0 32px 4px #F9731625',
        'led-white': '0 0 10px 1px rgba(255,255,255,0.15), 0 0 24px 2px rgba(255,255,255,0.06)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
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
      backdropBlur: {
        xs: '2px',
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
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(230,126,34,0.28), 0 0 18px rgba(192,57,43,0.12)' },
          '50%': { boxShadow: '0 0 18px rgba(230,126,34,0.62), 0 0 44px rgba(241,196,15,0.22)' },
        },
        pulseLed: {
          '0%,100%': { boxShadow: '0 0 8px 1px #F9731640' },
          '50%': { boxShadow: '0 0 20px 4px #F9731680' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 12px 3px rgba(249,115,22,0.25)' },
          '50%': { boxShadow: '0 0 28px 8px rgba(249,115,22,0.45)' },
        },
        glowBrand: {
          from: { textShadow: '0 0 8px #F9731660' },
          to: { textShadow: '0 0 20px #F97316, 0 0 40px #F9731640' },
        },
        ledScan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(500%)' },
        },
        bounceBadge: {
          '0%': { transform: 'scale(0.5)' },
          '100%': { transform: 'scale(1)' },
        },
        favoriteBurst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
      animation: {
        flame: 'flame 1.8s ease-out infinite',
        'slide-up': 'slideUp 0.28s ease-out both',
        'fade-in': 'fadeIn 0.35s ease-out both',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        shimmer: 'shimmer 2s linear infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        'pulse-led': 'pulseLed 2.5s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'glow-brand': 'glowBrand 3s ease-in-out infinite alternate',
        'led-scan': 'ledScan 2.5s linear infinite',
        'bounce-badge': 'bounceBadge 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounceSoft: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-animate')],
};

export default config;
