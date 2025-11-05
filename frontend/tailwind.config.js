/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'meow': ['"Meow Script"', 'cursive'],
      },
      colors: {
        primary: '#2E7D62', // Verde script - CTA primário
        'primary-hover': '#256B54', // Verde hover
        secondary: '#F4F0E6', // Creme do convite - fundo base
        accent: '#121212', // Preto carvão - texto/ícones
        'brand-light': '#E7F3EE', // Verde claro - chips/superfícies
        border: '#D9D4C7', // Cinza contorno - borda suave
      },
      boxShadow: {
        'subtle': '0 8px 24px rgba(18, 18, 18, 0.06)',
      },
      borderRadius: {
        'card': '20px',
      },
      backdropBlur: {
        'xs': '4px',
      }
    },
  },
  plugins: [],
}
