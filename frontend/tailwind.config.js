/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0B1F3A',
          'navy-dark': '#071529',
          blue: '#1B4F8A',
          'blue-light': '#2563EB',
          slate: '#1E293B',
          gray: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
