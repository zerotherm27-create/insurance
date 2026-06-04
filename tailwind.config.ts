import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1F3D',
          dark: '#0A1628',
          light: '#162B52',
          card: '#1A2F57',
        },
        gold: {
          DEFAULT: '#F6B21A',
          soft: '#D9A441',
          muted: '#B8892E',
          pale: '#F6E9C4',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #0A1628 0%, #0F1F3D 50%, #162B52 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F6B21A 0%, #D9A441 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(26,47,87,0.8) 0%, rgba(15,31,61,0.9) 100%)',
      },
    },
  },
  plugins: [],
}
export default config
