/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mono: {
          white: '#FFFFFF',
          offwhite: '#FAFAFA',
          light: '#F3F3F3',
          border: '#EAEAEA',
          subtle: '#E5E5E5',
          muted: '#8A8A8A',
          dark: '#333333',
          black: '#0A0A0A',
        },
        // Harmonize legacy tokens to the new White First + Black Premium design system
        luxury: {
          black: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#FAFAFA',
          border: '#EAEAEA',
          gold: {
            light: '#262626',
            DEFAULT: '#0A0A0A',
            dark: '#000000',
            glow: 'rgba(10, 10, 10, 0.08)',
          },
          ivory: {
            DEFAULT: '#0A0A0A',
            muted: '#555555',
            subtle: '#8A8A8A',
          }
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'gold-glow': '0 0 20px rgba(0, 0, 0, 0.06)',
        'gold-sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'luxury': '0 10px 30px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}

