/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        library: {
          wood: '#4A2E18',
          woodLight: '#7C4A2D',
          woodDark: '#2E1A0C',
          parchment: '#F5E6C8',
          paper: '#FDFBF7',
          felt: '#1D4E3E',
          brass: '#C59B27',
          ambientGlow: '#FFA726',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'floatUp 2s ease-out forwards',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.8)' },
          '20%': { opacity: '1', transform: 'translateY(0) scale(1.1)' },
          '80%': { opacity: '1', transform: 'translateY(-20px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-35px) scale(0.9)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
