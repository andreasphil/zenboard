const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: { preflight: false },
  content: ["./src/**/*.{ts,tsx,css}"],
  plugins: [require("@tailwindcss/line-clamp")],

  theme: {
    borderRadius: {
      DEFAULT: "var(--border-radius)",
      none: "none",
      full: "9999px",
      small: "var(--border-radius-small)",
      large: "var(--border-radius-large)",
    },
    borderWidth: {
      DEFAULT: "var(--border-width)",
      large: "var(--border-width-large)",
    },
    boxShadow: {
      low: "var(--shadow-elevation-low)",
      medium: "var(--shadow-elevation-medium)",
      high: "var(--shadow-elevation-high)",
      outline: "var(--outline)",
    },
    colors: {
      inherit: "inherit",
      current: "currentColor",
      transparent: "transparent",
      black: "var(--black)",
      white: "var(--white)",
      neutral: {
        50: "var(--neutral-50)",
        100: "var(--neutral-100)",
        200: "var(--neutral-200)",
        300: "var(--neutral-300)",
        400: "var(--neutral-400)",
        500: "var(--neutral-500)",
        600: "var(--neutral-600)",
        700: "var(--neutral-700)",
        800: "var(--neutral-800)",
        900: "var(--neutral-900)",
        950: "var(--neutral-950)",
      },
      primary: {
        DEFAULT: "var(--primary)",
        50: "var(--primary-50)",
        100: "var(--primary-100)",
        200: "var(--primary-200)",
        300: "var(--primary-300)",
        400: "var(--primary-400)",
        500: "var(--primary-500)",
      },

      // Contextual colors
      tw: {
        red: colors.rose[500],
        orange: colors.orange[400],
        yellow: colors.amber[400],
        green: colors.emerald[500],
        blue: colors.sky[500],
        purple: colors.indigo[500],
      },
    },
    fontSize: {
      small: "var(--font-size-small)",
      base: "var(--font-size)",
      h6: "var(--font-size-h6)",
      h5: "var(--font-size-h5)",
      h4: "var(--font-size-h4)",
      h3: "var(--font-size-h3)",
      h2: "var(--font-size-h2)",
      h1: "var(--font-size-h1)",
    },
    fontWeight: {
      normal: "var(--font-weight-normal)",
      medium: "var(--font-weight-medium)",
      bold: "var(--font-weight-bold)",
    },
    lineHeight: {
      none: 1,
      normal: "var(--line-height)",
    },

    extend: {
      fontFamily: {
        mono: ["Fira Code", ...defaultTheme.fontFamily.mono],
      },

      transitionDuration: {
        DEFAULT: "var(--transition-duration)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--transition-timing-function)",
      },
      opacity: {
        disabled: "var(--disabled-opacity)",
      },
      backgroundColor: {
        base: "var(--c-bg)",
        surface: {
          DEFAULT: "var(--c-surface-bg)",
          variant: "var(--c-surface-variant-bg)",
        },
      },
      borderColor: {
        DEFAULT: "var(--c-border)",
        variant: "var(--c-border-variant)",
      },
      textColor: {
        base: "var(--c-fg)",
        variant: "var(--c-fg-variant)",
        surface: {
          DEFAULT: "var(--c-surface-fg)",
          variant: "var(--c-surface-variant)",
        },
      },
    },
  },
};
