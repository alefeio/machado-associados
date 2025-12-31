/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",

    // Necessário para Flowbite + Flowbite-React funcionar
    "./node_modules/flowbite-react/lib/**/*.js",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#E3E9F2",
          DEFAULT: "#203354",
          dark: "#14213d",
        },
        accent: {
          light: "#d2b48e",
          DEFAULT: "#ba9a71",
          dark: "#9e835f",
        },
        neutral: {
          white: "#FFFFFF",
          light: "#F5F5F5",
          medium: "#D4D4D4",
          dark: "#333333",
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

    // Plugin obrigatório para Flowbite
    require('flowbite/plugin'),
  ],
}
