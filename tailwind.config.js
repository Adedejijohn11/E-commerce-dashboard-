/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#059669', // Darker emerald green
        'dark-green': '#047857', // Even darker for hover states
        'light-green': '#d1fae5', // Lighter tint for backgrounds
        'text-dark': '#1f2937',
        'text-gray': '#6b7280',
      },
    },
  },
  plugins: [],
}
