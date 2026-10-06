/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F472B6',
          400: '#E11D48',
          500: '#BE185D', // Main accent maroon
          600: '#9D174D', // Deep brand maroon
          700: '#831843',
          800: '#701A75',
          900: '#4C0519',
        },
        cream: {
          50: '#FFFDFD',
          100: '#FFF7F9',
          200: '#FFF0F4',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px -10px rgba(190, 24, 93, 0.12)',
        'soft-lg': '0 16px 40px -12px rgba(190, 24, 93, 0.18)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.04), 0 10px 25px -10px rgba(190, 24, 93, 0.08)'
      }
    },
  },
  plugins: [],
}
