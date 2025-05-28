/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0369a1',
          light: '#38bdf8',
          dark: '#075985',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        },
        secondary: {
          DEFAULT: '#4f46e5',
          light: '#818cf8',
          dark: '#3730a3'
        },
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706'
        },
        background: {
          DEFAULT: '#f9fafb',
          dark: '#f3f4f6'
        }
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'serif']
      }
    }
  },
  plugins: []
}
