import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B3A8F",
          dark: "#0F2459",
          light: "#2B54BF",
        },
        brand: {
          amber: "#F59E0B",
          emerald: "#10B981",
        },
      },
    },
  },
  plugins: [],
};
export default config;
