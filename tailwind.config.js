/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces — near-black with a faint cool tint, matching the mockups
        ink: {
          900: '#0c0d10',
          800: '#131519',
          700: '#191c21',
          600: '#222630',
          500: '#2c313b',
        },
        // Dad = warm orange
        dad: {
          DEFAULT: '#ff6a2b',
          soft: 'rgba(255,106,43,0.14)',
          ring: 'rgba(255,106,43,0.30)',
        },
        // Kid = cool blue
        kid: {
          DEFAULT: '#3b88f5',
          soft: 'rgba(59,136,245,0.14)',
          ring: 'rgba(59,136,245,0.30)',
        },
        reviewed: '#27c06a',
        tovisit: '#3b88f5',
        grape: '#a855f7',
        muted: '#8a909c',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro',
          'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        sheet: '0 -8px 40px rgba(0,0,0,0.55)',
        pin: '0 4px 14px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
