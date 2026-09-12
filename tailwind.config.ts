import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts}',
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
          DEFAULT: '#F5A623',
          soft: '#E0951E',
          muted: '#B8892E',
          pale: '#F6E9C4',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          alt: '#F6F5F2',
        },
        ink: '#111827',
      },
      fontFamily: {
        serif: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #0A1628 0%, #0F1F3D 50%, #162B52 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F5A623 0%, #E0951E 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(26,47,87,0.8) 0%, rgba(15,31,61,0.9) 100%)',
      },
    },
  },
  plugins: [],
}
export default config
