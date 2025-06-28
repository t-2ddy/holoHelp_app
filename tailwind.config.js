/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        towagreen: "#84CC16",
        towaprimary: "#a083c9",
        towasecondary: "#c3b4e5",
        towa3: '#ded9f6'
      },
      fontFamily: {
        'sour': ['Sour Gummy Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}