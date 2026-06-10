import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#175633",
          mint: "#e7f3ec",
          orange: "#e86f45",
          ink: "#17221c"
        }
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 86, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
