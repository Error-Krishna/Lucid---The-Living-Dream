/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lucid: {
          bg: '#030514',
          card: 'rgba(9, 14, 38, 0.75)',
          border: 'rgba(99, 102, 241, 0.25)',
          glow: '#6366f1',
          lavender: '#c084fc',
          cyan: '#38bdf8',
          amber: '#f59e0b',
          rose: '#f43f5e',
          text: '#f1f5f9',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Trajan Pro', 'Didot', 'Georgia', 'serif'],
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
