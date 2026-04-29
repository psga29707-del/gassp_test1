/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#F4ECE1',
        'warm-surface': '#FBF8F1',
        'warm-primary': '#8C5A35',
        'warm-text': '#3E2723',
      }
    },
  },
  plugins: [],
}

