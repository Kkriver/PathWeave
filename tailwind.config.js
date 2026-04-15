/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        panel: 'var(--color-panel)',
        ink: 'var(--color-ink)',
        amberline: 'var(--color-amberline)',
        gridline: 'var(--color-gridline)',
        mist: 'var(--color-mist)',
        sand: {
          50: '#f9f9f8',
          100: '#f1f0ec',
          200: '#e7e4dc',
        },
        ember: {
          200: '#f2d9b0',
          400: '#d4ab6b',
          500: '#c99745',
          700: '#8f6331',
        },
        sage: {
          100: '#edf1ed',
          300: '#c8d3cb',
          500: '#819486',
          700: '#56645a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', '"Iowan Old Style"', '"Palatino Linotype"', 'serif'],
      },
      boxShadow: {
        soft: '0 24px 60px -28px rgba(22, 22, 20, 0.16)',
        precision:
          'inset 0 1px 0 rgba(255,255,255,0.78), inset 0 -1px 0 rgba(26,26,26,0.04), 0 20px 40px -24px rgba(26,26,26,0.18)',
        precisionSm:
          'inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -1px 0 rgba(26,26,26,0.03), 0 10px 24px -18px rgba(26,26,26,0.14)',
      },
      borderColor: {
        precision: 'rgba(26, 26, 26, 0.08)',
      },
      backgroundImage: {
        weave:
          'linear-gradient(to right, var(--color-gridline) 0.5px, transparent 0.5px), linear-gradient(to bottom, var(--color-gridline) 0.5px, transparent 0.5px)',
        loomGlow:
          'radial-gradient(circle at top left, rgba(201, 151, 69, 0.14), transparent 30%), radial-gradient(circle at top right, rgba(129, 148, 134, 0.1), transparent 26%), linear-gradient(180deg, rgba(249,249,248,0.96), rgba(246,245,242,0.98))',
      },
      backgroundSize: {
        weave: '40px 40px',
      },
    },
  },
  plugins: [],
}
