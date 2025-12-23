/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        bold: '700',
      },
      borderRadius: {
        lg: '8px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.4)',
        lg: '0 4px 16px rgba(0, 0, 0, 0.5)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        border: '#2A2A2A',
        primary: '#00D4E5',
        accent: '#00BFA6',
        highlight: '#00BFA6',
        purple: '#A855F7',
      },
    },
  },
  plugins: [],
};
