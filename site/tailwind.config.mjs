/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        paper: '#f7f5f0',
        washi: '#ffffff',
        border: '#e8e4de',
        muted: '#777777',
        charcoal: '#2b2b2b',
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
