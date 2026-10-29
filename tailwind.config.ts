import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          DEFAULT: '#1E1612',
          soft: '#2A2019',
          mist: '#3A2D22',
        },
        creme: {
          DEFAULT: '#F6EFE6',
          soft: '#EFE4D4',
          deep: '#E3D2BC',
        },
        caramel: {
          DEFAULT: '#C07A3A',
          deep: '#A9642B',
          light: '#D9A46C',
        },
        sauge: {
          DEFAULT: '#6B7F5E',
          deep: '#586B4C',
          soft: '#8DA07F',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 10px 30px -12px rgba(30, 22, 18, 0.25)',
        'warm-lg': '0 24px 50px -20px rgba(30, 22, 18, 0.35)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        bump: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(18px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-6deg)' },
          '75%': { transform: 'rotate(6deg)' },
        },
        'draw-check': {
          from: { strokeDashoffset: '48' },
          to: { strokeDashoffset: '0' },
        },
        'grow-x': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-down': 'fade-down 0.5s ease-out both',
        'scale-in': 'scale-in 0.5s ease-out both',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        bump: 'bump 0.4s ease-out',
        marquee: 'marquee 28s linear infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) both',
        wiggle: 'wiggle 0.5s ease-in-out',
        'draw-check': 'draw-check 0.6s ease-out 0.2s both',
        'grow-x': 'grow-x 0.8s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
