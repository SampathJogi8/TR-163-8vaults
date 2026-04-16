/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        card: '#0a0a0a',
        accent: '#7c3aed',
        border: 'rgba(255, 255, 255, 0.05)',
        'border-hover': 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
