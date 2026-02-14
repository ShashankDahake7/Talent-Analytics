/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50: '#f6f6f5',
          100: '#e7e6e4',
          200: '#d1cfcb',
          300: '#b3b0a9',
          400: '#8e8a80',
          500: '#737066',
          600: '#5f5b52',
          700: '#4e4b43',
          800: '#434139',
          900: '#3b3932',
          950: '#1f1e1b',
        },
        sage: {
          50: '#f4f6f2',
          100: '#e5eae0',
          200: '#ccd6c2',
          300: '#a8ba9a',
          400: '#7d9674',
          500: '#5f7a58',
          600: '#4b6144',
          700: '#3d4e38',
          800: '#343f30',
          900: '#2d3529',
          950: '#161b14',
        },
        amber: {
          glow: '#f59e0b',
          soft: '#fbbf24',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};