/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF4E8",
        ink: "#2A2622",
        char: "#1C1A17",
        chili: "#E8572D",
        herb: "#4F7942",
        steel: "#8C8478",
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "ticket-perf":
          "radial-gradient(circle, transparent 6px, var(--tw-gradient-stops)) ",
      },
    },
  },
  plugins: [],
};
