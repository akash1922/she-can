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
          red: '#ED0707',
          redHover: '#B80000',
          dark: '#0D0705',
          charcoal: '#26201E',
          wood: '#1F1346', // meteorite variant from original stylesheet
          grayLight: '#EBEBEF',
          grayDark: '#727586'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
