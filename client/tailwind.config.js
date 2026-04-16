/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",          // Violet-700
        "primary-light": "#8b5cf6",   // Violet-500
        "primary-dark": "#6d28d9",    // Violet-800
        secondary: "#db2777",         // Pink-600
        "secondary-light": "#ec4899", // Pink-500
        accent: "#f9fafb",            // Gray-50 (light bg)
        charcoal: "#111827",          // Gray-900 (dark text)
        surface: "#ffffff",           // White
        "surface-light": "#f3f4f6",   // Gray-100
        muted: "#6b7280",             // Gray-500
        "dark-border": "#e5e7eb",     // Gray-200
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      boxShadow: {
        'glow': '0 0 0 3px rgba(124, 58, 237, 0.12)',
        'glow-lg': '0 0 0 4px rgba(124, 58, 237, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        'gradient-surface': 'linear-gradient(135deg, #f9fafb, #ffffff)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}