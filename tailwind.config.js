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
        apple: {
          blue: '#0A84FF',
          green: '#30D158',
          orange: '#FF9F0A',
          red: '#FF375F',
          purple: '#BF5AF2',
          cyan: '#64D2FF',
          yellow: '#FFD60A',
          cardLight: 'rgba(255, 255, 255, 0.75)',
          cardDark: 'rgba(28, 28, 30, 0.75)',
          modalLight: 'rgba(255, 255, 255, 0.90)',
          modalDark: 'rgba(44, 44, 46, 0.85)',
        },
      },
      borderRadius: {
        '4xl': '32px',
        '5xl': '40px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'sans-serif'],
        rounded: ['"SF Pro Rounded"', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        '3xl': '32px',
      },
    },
  },
  plugins: [],
}
