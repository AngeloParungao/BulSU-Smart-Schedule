/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'bulsu' : "url('/src/assets/university.png')",
      },
    },
  },
  plugins: [],
}

