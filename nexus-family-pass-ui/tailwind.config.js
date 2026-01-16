/** @type {import('tailwindcss').Config} */
// =====================================================
// TAILWIND CSS CONFIGURATION FILE
// Defines custom theme, colors, and design system for Nexus Family Pass
// =====================================================
module.exports = {
  // Define which files Tailwind should scan for class usage
  content: [
    "./src/**/*.{html,ts}", // Scan all HTML and TypeScript files in src directory
  ],
  theme: {
    extend: {
      // Custom color palette matching PRD brand guidelines
      colors: {
        // Primary brand color - deep blue used for headers, primary buttons
        primary: {
          50: '#e6eef7',   // Lightest shade for backgrounds
          100: '#c1d4eb',  // Light shade for hover states
          200: '#98b8de',  // Light accent color
          300: '#6f9bd1',  // Medium light shade
          400: '#5085c7',  // Medium shade
          500: '#2c5282',  // Main primary color from PRD (#2c5282)
          600: '#264a75',  // Darker shade for active states
          700: '#1f3f65',  // Dark shade for text on light backgrounds
          800: '#183454',  // Very dark shade
          900: '#0f2440',  // Darkest shade for high contrast
        },
        // Secondary/accent color - teal used for highlights, CTAs
        accent: {
          50: '#e6f7f6',   // Lightest teal for subtle backgrounds
          100: '#c1ebe8',  // Light teal
          200: '#98ddd8',  // Light accent
          300: '#6fcfc8',  // Medium light
          400: '#50c4bc',  // Medium shade
          500: '#319795',  // Main accent color from PRD (#319795)
          600: '#2c8886',  // Darker teal
          700: '#257674',  // Dark teal
          800: '#1e6361',  // Very dark teal
          900: '#144d4b',  // Darkest teal
        },
        // Semantic colors for status indicators
        success: {
          500: '#38a169',  // Green for success states, confirmations
          600: '#2f855a',  // Darker green for hover
        },
        warning: {
          500: '#ed8936',  // Orange for warnings, low availability
          600: '#dd6b20',  // Darker orange for hover
        },
        danger: {
          500: '#e53e3e',  // Red for errors, destructive actions
          600: '#c53030',  // Darker red for hover
        },
        // Neutral colors for text, borders, backgrounds
        neutral: {
          50: '#f7fafc',   // Page backgrounds
          100: '#edf2f7',  // Card backgrounds
          200: '#e2e8f0',  // Borders
          300: '#cbd5e0',  // Disabled states
          400: '#a0aec0',  // Placeholder text
          500: '#718096',  // Secondary text
          600: '#4a5568',  // Primary text
          700: '#2d3748',  // Headings
          800: '#1a202c',  // Dark text
          900: '#171923',  // Darkest text
        },
      },
      // Custom font family stack
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Primary font stack
        display: ['Poppins', 'sans-serif'],         // Font for headings
      },
      // Custom spacing values for consistent layout
      spacing: {
        '18': '4.5rem',   // 72px - for larger gaps
        '22': '5.5rem',   // 88px - for section spacing
      },
      // Custom border radius values
      borderRadius: {
        'xl': '1rem',     // 16px - for cards
        '2xl': '1.5rem',  // 24px - for modals
      },
      // Custom box shadow values for depth
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',           // Subtle card shadow
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',    // Card hover shadow
        'modal': '0 8px 32px rgba(0, 0, 0, 0.16)',         // Modal shadow
      },
      // Animation durations
      transitionDuration: {
        '250': '250ms',   // Standard transition
        '350': '350ms',   // Slower transition for modals
      },
    },
  },
  // Tailwind plugins - none needed for now
  plugins: [],
};
