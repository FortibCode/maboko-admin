import type { Config } from 'tailwindcss';

/**
 * Charte graphique Maboko (§VIII du cahier de charges).
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maboko: {
          principale: '#4A2A18',
          secondaire: '#B35B28',
          accent: '#EAA023',
          fond: '#FAF4E7',
          bordure: '#E8DCC8',
          texte: '#7A6A5C',
          succes: '#5F7548',
          danger: '#9E2B22',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
