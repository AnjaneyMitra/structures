/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Theme Colors
        background: '#f8f9fa',
        foreground: '#0c0c1d',
        primary: {
          DEFAULT: '#ff00c8',
          foreground: '#ffffff',
        },
        // Secondary & Accent Colors
        secondary: {
          DEFAULT: '#f0f0ff',
          foreground: '#0c0c1d',
        },
        accent: {
          DEFAULT: '#00ffcc',
          foreground: '#0c0c1d',
        },
        // UI Component Colors
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0c0c1d',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#0c0c1d',
        },
        muted: {
          DEFAULT: '#f0f0ff',
          foreground: '#0c0c1d',
        },
        // Additional semantic colors
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        border: '#e5e7eb',
        input: '#f3f4f6',
        ring: '#ff00c8',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
}
