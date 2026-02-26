import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Apple system palette */
        apple: {
          blue:    '#007AFF',
          green:   '#34C759',
          red:     '#FF3B30',
          orange:  '#FF9500',
          purple:  '#AF52DE',
          indigo:  '#5856D6',
          gray:    '#8E8E93',
          bg:      '#F2F2F7',
          bg2:     '#EFEFF4',
          fill:    'rgba(120,120,128,0.12)',
          fill2:   'rgba(120,120,128,0.08)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text',
          'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
      borderRadius: {
        apple: '10px',
        'apple-lg': '14px',
        'apple-xl': '18px',
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'apple':    '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        'apple-md': '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
        'apple-lg': '0 12px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)',
        'apple-modal': '0 24px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        spring:        'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-soft': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-out-expo':'cubic-bezier(0.16, 1, 0.3, 1)',
        'apple':       'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '500': '500ms',
      },
      backdropBlur: {
        apple: '20px',
        'apple-xl': '32px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.94) translateY(16px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'kpi-in': {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.96)' },
          '60%':  { transform: 'translateY(-4px) scale(1.01)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        'nav-item': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 300ms cubic-bezier(0.16,1,0.3,1)',
        'slide-up': 'slide-up 400ms cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scale-in 300ms cubic-bezier(0.34,1.56,0.64,1)',
        'modal-in': 'modal-in 380ms cubic-bezier(0.34,1.2,0.64,1)',
        'kpi-in':   'kpi-in 500ms cubic-bezier(0.34,1.2,0.64,1) both',
        shimmer:    'shimmer 1.6s ease-in-out infinite',
        'nav-item': 'nav-item 300ms cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
