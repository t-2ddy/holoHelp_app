/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        towagreen: "#84CC16", // greeeeen
        towaprimary: "#a083c9",
        towasecondary: "#c3b4e5",
        towa3: '#ded9f6'
      },
    },
  },
  plugins: [],
}