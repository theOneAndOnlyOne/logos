/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
      },
      maxWidth: {
        'content': 'var(--max-width, 800px)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            fontFamily: 'inherit',
            a: {
              color: 'var(--link-color)',
              '&:hover': {
                color: 'var(--link-hover-color)',
              },
            },
            h1: {
              fontSize: '2em',
              marginTop: '0.5em',
              marginBottom: '0.5em',
              lineHeight: '1.2',
            },
            h2: {
              fontSize: '1.5em',
              marginTop: '0.5em',
              marginBottom: '0.5em',
              lineHeight: '1.2',
            },
            h3: {
              fontSize: '1.25em',
              marginTop: '0.5em',
              marginBottom: '0.5em',
              lineHeight: '1.2',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              fontWeight: '400',
            },
            pre: {
              backgroundColor: 'var(--code-bg)',
              color: 'inherit',
              fontSize: '0.9em',
            },
            strong: {
              fontWeight: '600',
              color: 'inherit',
            },
            hr: {
              borderColor: 'var(--border-color)',
              marginTop: '2em',
              marginBottom: '2em',
            },
            blockquote: {
              fontWeight: '400',
              fontStyle: 'italic',
              color: 'inherit',
              borderLeftColor: 'var(--border-color)',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            'ul > li::before': {
              backgroundColor: 'var(--text-color)',
            },
            'ol > li::before': {
              color: 'inherit',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

