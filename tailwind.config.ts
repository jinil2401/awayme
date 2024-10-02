import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#4D869C",
        heading: "#171A1F",
        subHeading: "#9095A0",
        placeholder: "#BCC1CA",
        stroke: "#BCC1CA",
        error: "#913838",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        archivo: ["Archivo"],
      },
      boxShadow: {
        button: "0 5px 10px 0 rgba(0, 0, 0, 0.15)",
        buttonHover: "0 3px 6px 0 rgba(0, 0, 0, 0.15)",
        card: "0 0 2px 0 rgba(23, 26, 31, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
