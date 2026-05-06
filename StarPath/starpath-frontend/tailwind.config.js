/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd5fe',
          300: '#8eb7fd',
          400: '#598ef9',
          500: '#3366f4',
          600: '#1d47e9',
          700: '#1535d6',
          800: '#172bad',
          900: '#192a88',
          950: '#141c53',
        },
        surface: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#141d36',
          600: '#1a2444',
          500: '#202c52',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'star-glow': 'starGlow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        starGlow: {
          '0%': { filter: 'drop-shadow(0 0 4px #fbbf24)' },
          '100%': { filter: 'drop-shadow(0 0 12px #f59e0b) drop-shadow(0 0 24px #fbbf24)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
