/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "card-gradient": "linear-gradient(to bottom, #1e3a8a, #0284c7)", // sky-600 to blue-800
        "btn-gradientprimary": "linear-gradient(to right, #4ade80, #16a34a)",
        "btn-gradientsecondary": "linear-gradient(to right, #d1d5db, #6b7280)",
        "btn-gradientblue": "linear-gradient(to right, #330df3ff, #5e55c4ff)",
      },
    },
  },
  safelist: [
    {
      pattern:
        /(bg|text|hover:bg)-(sky|purple|red|green|blue)-(100|200|300|400|500|600|700)/,
    },
    "font-bold",
    "inline-block",
    "px-6",
    "py-3",
    "rounded-xl",
    "shadow-lg",
    "transition",
  ],
  plugins: [],
};
