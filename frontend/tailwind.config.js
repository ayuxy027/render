/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C89B00',
        secondary: '#D0B67A',
        'primary-dark': '#9C7F00',
        background: '#C8C4A6',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#333333',
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              color: '#C89B00',
              backgroundColor: 'rgba(236, 236, 236, 0.5)',
              borderRadius: '0.25rem',
              padding: '0.1rem 0.3rem',
            },
            a: {
              color: '#C89B00',
              '&:hover': {
                color: '#9C7F00',
              },
            },
            blockquote: {
              borderLeftColor: '#D0B67A',
            },
            h1: {
              color: '#C89B00',
            },
            h2: {
              color: '#C89B00',
            },
            h3: {
              color: '#C89B00',
            },
            h4: {
              color: '#C89B00',
            },
            'ul > li::marker': {
              color: '#C89B00',
            },
            'ol > li::marker': {
              color: '#C89B00',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}