/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nova paleta de cores para a Machado Advogados Associados
        primary: {
          light: "#E3E9F2", // Azul claro para fundos secundários
          DEFAULT: "#203354", // Azul marinho principal (logo, títulos)
          dark: "#14213d",
        },
        accent: {
          light: "#d2b48e", // Laranja claro
          DEFAULT: "#ba9a71", // Laranja principal (botões, destaques)
          dark: "#9e835f",
        },
        neutral: {
          white: "#FFFFFF",
          light: "#F5F5F5", // Cinza claro para fundos
          medium: "#D4D4D4", // Cinza intermediário
          dark: "#333333", // Cinza escuro para textos
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}