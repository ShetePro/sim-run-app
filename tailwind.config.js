/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: {
        mini: '.8rem',
      },
      transitionDuration: {
        '2000': '2000ms',
      }
    },
  },
  plugins: [],
}
