/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          blue: '#3B82F6',
          dark: '#0F172A',
        }
      },
      borderRadius: {
        'xl': '1rem',
      }
    },
  },
  plugins: [],
}
