/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./views/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'bizcochito': {
          'beige': '#E8DED3',
          'red': '#C74444',
          'dark-red': '#8B2E2E',
        },
      },
    },
  },
  plugins: [],
}
