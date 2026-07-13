import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2A130B",
        ember: "#C91F14",
        flame: "#FFB81C",
        coal: "#FFF9EF",
        paper: "#2A130B",
        bone: "#5E4335",
        smoke: "#8A7568",
      },
      fontFamily: {
        display: ["Chewy", "Barlow", "sans-serif"],
        body: ["Barlow", "sans-serif"],
      },
      boxShadow: {
        panel: "0 18px 46px rgba(106, 52, 18, 0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;
