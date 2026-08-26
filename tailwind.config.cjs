/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        hanabishi: {
          1: "#cd9200",
          2: "#ffffff",
        },
        seigaiha: {
          1: "#9aa5ab",
        },
        primary: {
          50: "#f8f3ed",
          100: "#e9e6dd",
          200: "#bcaf9c",
          300: "#d9a439",
          400: "#d49f34",
          500: "#c8982b",
          600: "#be8f24",
          700: "#b98c21",
          800: "#b6891e",
          900: "#b2851a",
          950: "#172554",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        paper: "#f8f3ed",
        ink: "#151410",
        leaf: "#cd9200",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Source Sans Pro"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
