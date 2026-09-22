/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050507',
        accent: '#5a67d8', // subtle cool blue-violet
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'ripple': 'ripple 1s cubic-bezier(0, 0, 0.2, 1) forwards',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 1 },
          '100%': { transform: 'scale(4)', opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
