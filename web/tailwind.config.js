/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Marca
        blue: {
          DEFAULT: '#1B70B0',
          l:       '#2484CC',
          d:       '#145690',
        },
        green:  '#10B981',
        amber:  '#F59E0B',
        red:    '#EF4444',

        // Superfícies — lidas das CSS vars (dark/light via [data-theme])
        bg:    'var(--bg)',
        s1:    'var(--s1)',
        s2:    'var(--s2)',
        s3:    'var(--s3)',

        // Texto
        t1:    'var(--t1)',
        t2:    'var(--t2)',
        t3:    'var(--t3)',

        // Bordas
        bdr:   'var(--bdr)',
        bdr2:  'var(--bdr2)',

        // Outros
        inp:   'var(--inp)',
        icon:  'var(--icon-clr)',
        'sb-bg': 'var(--sb-bg)',
        'nav-bg': 'var(--nav-bg)',
      },

      backgroundImage: {
        'blue-grad': 'linear-gradient(135deg, var(--blue-d, #145690), var(--blue-l, #2484CC))',
        'green-grad': 'linear-gradient(135deg, #059669, #10B981)',
        'red-grad':   'linear-gradient(135deg, #DC2626, #EF4444)',
      },

      boxShadow: {
        'blue-glow': '0 3px 9px var(--blue-glow)',
        'blue-btn':  '0 3px 10px var(--blue-glow)',
        'green-btn': '0 3px 10px rgba(16,185,129,0.3)',
        'red-btn':   '0 3px 10px rgba(239,68,68,0.3)',
        'sh':        'var(--sh)',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      borderRadius: {
        DEFAULT: '8px',
      },

      animation: {
        'spin-fast': 'spin 0.7s linear infinite',
      },
    },
  },
  plugins: [],
}
