/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: {
          950: '#1B1522',
          900: '#241B2F',
          800: '#2F2439',
          700: '#3B2E48'
        },
        paper: {
          50: '#FBF9F4',
          100: '#F2EFE6',
          200: '#E8E3D6'
        },
        gold: {
          400: '#D6A75A',
          500: '#C08A3E',
          600: '#A06F2C'
        },
        teal: {
          600: '#1E5C55',
          700: '#174A44'
        },
        ink: {
          900: '#14181F',
          800: '#211A2A',
          600: '#4A4353'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 24, 31, 0.06), 0 8px 24px -8px rgba(20, 24, 31, 0.18)',
        liftDark: '0 1px 2px rgba(0,0,0,0.4), 0 12px 28px -10px rgba(0,0,0,0.55)'
      },
      spacing: {
        18: '4.5rem'
      }
    }
  },
  plugins: []
}
