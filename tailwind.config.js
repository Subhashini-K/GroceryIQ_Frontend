/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A56DB',
        success: '#057A55',
        warning: '#C27803',
        danger: '#E02424',
        surface: '#FFFFFF',
        // Specific colors for the enhanced login page
        login: {
          indigo: '#6366F1',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 8px 15px -8px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
      }
    },
  },
  plugins: [],
}
