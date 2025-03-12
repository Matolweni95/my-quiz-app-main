const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './pages/**/*.{html,js,jsx,ts,tsx}',
    './components/**/*.{html,js,jsx,ts,tsx}',
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // or 'media' for system preference
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
        },
        background: {
          DEFAULT: 'var(--body-background)',
          card: 'var(--card-background)',
        },
        text: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'heading-lg': 'var(--heading-large)',
        'heading-md': 'var(--heading-medium)',
        'heading-sm': 'var(--heading-small)',
        'base': 'var(--text-base)',
      },
      spacing: {
        'icon': '1000px',
        'iconwidth': '70px'
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
      },
      transitionProperty: {
        'all': 'all',
      },
      transitionDuration: {
        'default': '200ms',
      },
      transitionTimingFunction: {
        'default': 'ease-in-out',
      },
    },
  },
  plugins: [],
};
