/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border, 0 0% 89.8%))",
        input: "hsl(var(--input, 0 0% 89.8%))",
        ring: "hsl(var(--ring, 0 0% 3.9%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 0 0% 3.9%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 0 0% 9%))",
          foreground: "hsl(var(--primary-foreground, 0 0% 98%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 0 0% 96.1%))",
          foreground: "hsl(var(--secondary-foreground, 0 0% 9%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84.2% 60.2%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 98%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 0 0% 96.1%))",
          foreground: "hsl(var(--muted-foreground, 0 0% 45.1%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 0 0% 96.1%))",
          foreground: "hsl(var(--accent-foreground, 0 0% 9%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0 0% 100%))",
          foreground: "hsl(var(--popover-foreground, 0 0% 3.9%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))",
          foreground: "hsl(var(--card-foreground, 0 0% 3.9%))",
        },
        burgundy: {
          deep: "#1F0205",
          dark: "#320409",
          DEFAULT: "#4E0A12",
          rich: "#680F1B",
          vibrant: "#8C1625",
        },
        cream: {
          DEFAULT: "#F8F4EF",
          soft: "#FCFAF6",
          parchment: "#F3ECE1",
        },
        sand: {
          DEFAULT: "#EFCEA5",
          warm: "#E2B57E",
        },
      },
      borderRadius: {
        lg: "var(--radius, 0.5rem)",
        md: "calc(var(--radius, 0.5rem) - 2px)",
        sm: "calc(var(--radius, 0.5rem) - 4px)",
      },
      fontFamily: {
        display: ["'After'", "'Plus Jakarta Sans'", "sans-serif"],
        serif: ["'Italiana'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
}
