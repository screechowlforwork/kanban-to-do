/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        deepblack: "#0F0F12",
        gunmetal: "#18181B",
        cardbg: "rgba(255, 255, 255, 0.05)",
        neon: {
          red: "#FF3366",
          blue: "#33E1FF",
          purple: "#B833FF",
          green: "#33FF99",
        },
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
      },
      boxShadow: {
        "neon-red": "0 0 10px rgba(255, 51, 102, 0.5)",
        "neon-blue": "0 0 10px rgba(51, 225, 255, 0.5)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      animation: {
        "gradient-slow": "gradient-shift 15s ease infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundSize: {
        "400%": "400% 400%",
      },
    },
  },
  plugins: [],
};
