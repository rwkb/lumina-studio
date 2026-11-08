import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9F6F2',
        foreground: '#2C2C2C',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#2C2C2C',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#2C2C2C',
        },
        primary: {
          DEFAULT: '#E8B4B8',
          foreground: '#2C2C2C',
        },
        secondary: {
          DEFAULT: '#D4A5A5',
          foreground: '#2C2C2C',
        },
        muted: {
          DEFAULT: '#F3EEE8',
          foreground: '#6B6B6B',
        },
        accent: {
          DEFAULT: '#F7EAEB',
          foreground: '#2C2C2C',
        },
        destructive: {
          DEFAULT: '#B5524F',
          foreground: '#FFFFFF',
        },
        border: '#EAE3DA',
        input: '#E3DBD1',
        ring: '#D4A5A5',
        blush: {
          50: '#FDF7F7',
          100: '#FBEEEF',
          200: '#F5DADC',
          300: '#EFCACD',
          400: '#E8B4B8',
          500: '#D89AA0',
          600: '#B9737A',
          700: '#94545B',
        },
        rose: {
          300: '#E0BEBE',
          400: '#D4A5A5',
          500: '#BF8B8B',
          600: '#9E6C6C',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F5EDD9',
          200: '#EBDAB0',
          300: '#DFC486',
          400: '#CFAE63',
          500: '#B8924A',
          600: '#8F6F34',
          700: '#6E5427',
        },
        sage: {
          50: '#F1F6F3',
          100: '#DFEBE4',
          500: '#5C8A74',
          600: '#466E5C',
          700: '#37584A',
        },
        ink: {
          900: '#2C2C2C',
          700: '#4A4A4A',
          500: '#6B6B6B',
          300: '#B5AFA8',
          200: '#E3DDD5',
          100: '#EFEAE3',
        },
        warning: '#C9913B',
        error: '#B5524F',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(44, 44, 44, 0.04), 0 8px 24px -12px rgba(44, 44, 44, 0.10)',
        lift: '0 2px 4px rgba(44, 44, 44, 0.04), 0 20px 40px -16px rgba(44, 44, 44, 0.18)',
        glow: '0 0 0 1px rgba(232, 180, 184, 0.6), 0 12px 32px -12px rgba(232, 180, 184, 0.7)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
