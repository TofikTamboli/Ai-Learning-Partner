/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#FF6321',
        'brand-black': '#0a0a0a',
        'brand-paper': '#f5f0e8',
        'brand-gray': '#6b6b6b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #0a0a0a',
        'brutal-lg': '6px 6px 0px 0px #0a0a0a',
        'brutal-xl': '8px 8px 0px 0px #0a0a0a',
      },
    },
  },
  plugins: [],
};
