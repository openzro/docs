/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./{src,mdx}/**/*.{js,mjs,jsx,mdx}'],
  darkMode: 'class',
  theme: {
    fontSize: {
      '2xs': ['0.75rem', { lineHeight: '1.25rem' }],
      xs: ['0.8125rem', { lineHeight: '1.5rem' }],
      sm: ['0.875rem', { lineHeight: '1.5rem' }],
      base: ['1rem', { lineHeight: '1.75rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    typography: require('./typography'),
    extend: {
      colors: {
        // Brand palette per the openZro CLAUDE.md spec. The shorthand
        // `openzro` alias maps to the primary (violet-600) so existing
        // Tailwind classes like text-openzro / bg-openzro keep working
        // after the rebrand.
        openzro: '#7c3aed',
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Semantic aliases mapped to the --oz-* CSS variables in
        // src/styles/tailwind.css. Components use `bg-page`,
        // `bg-page-soft`, `border-default`, etc. and the values
        // automatically follow the active theme (light vs dark).
        // Adding a new semantic surface = one row here + one
        // --oz-* var in tailwind.css.
        page:        'var(--oz-bg)',
        'page-soft': 'var(--oz-bg-soft)',
        'page-dark': 'var(--oz-bg-dark)',
        ink:         'var(--oz-text)',
        'ink-muted': 'var(--oz-text-muted)',
        'oz-link':       'var(--oz-primary)',
        'oz-link-hover': 'var(--oz-primary-hover)',
        'oz-soft':       'var(--oz-primary-soft)',
        'oz-border':     'var(--oz-border)',
      },
      boxShadow: {
        glow: '0 0 4px rgb(0 0 0 / 0.1)',
      },
      maxWidth: {
        lg: '33rem',
        '2xl': '40rem',
        '3xl': '50rem',
        '5xl': '66rem',
      },
      opacity: {
        1: '0.01',
        2.5: '0.025',
        7.5: '0.075',
        15: '0.15',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
