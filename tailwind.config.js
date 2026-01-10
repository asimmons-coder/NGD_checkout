/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ngd': {
          'dark': '#4a4a4a',
          'gray': '#6b6b6b',
          'light': '#f5f3f0',
          'cream': '#f9f7f4',
          'taupe': '#c4b7a6',
          'brown': '#8b7355',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Montserrat', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
