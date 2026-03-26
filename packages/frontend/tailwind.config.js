/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      /* ============================================
         Colors - Semantic Mapping
         All colors map to CSS variables
         ============================================ */
      colors: {
        // Background Hierarchy
        background: {
          DEFAULT: 'var(--bg-page)',
          page: 'var(--bg-page)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          overlay: 'var(--bg-overlay)',
          input: 'var(--bg-input)',
          tooltip: 'var(--bg-tooltip)',
          // Legacy aliases
          primary: 'var(--bg-page)',
          secondary: 'var(--bg-surface)',
          tertiary: 'var(--bg-elevated)',
          muted: 'var(--bg-muted)',
          hover: 'var(--bg-hover)',
          active: 'var(--bg-active)',
          card: 'var(--bg-card)',
        },
        
        // Text Hierarchy  
        foreground: {
          DEFAULT: 'var(--text-primary)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },
        
        // Border Hierarchy
        border: {
          DEFAULT: 'var(--border-default)',
          default: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          hover: 'var(--border-hover)',
          // Legacy aliases
          primary: 'var(--border-default)',
          secondary: 'var(--border-subtle)',
        },
        
        // Brand Colors
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          light: 'var(--brand-light)',
          dark: 'var(--brand-dark)',
        },
        
        // Primary (alias for brand, shadcn/ui compatibility)
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          foreground: 'var(--primary-foreground)',
        },
        
        // Trading Colors
        buy: {
          DEFAULT: 'var(--color-buy)',
          hover: 'var(--color-buy-hover)',
          light: 'var(--color-buy-light)',
          bg: 'var(--color-buy-bg)',
        },
        sell: {
          DEFAULT: 'var(--color-sell)',
          hover: 'var(--color-sell-hover)',
          light: 'var(--color-sell-light)',
          bg: 'var(--color-sell-bg)',
        },
        
        // Feedback Colors
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          light: 'var(--color-success-light)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
          light: 'var(--color-danger-light)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
          light: 'var(--color-warning-light)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          hover: 'var(--color-info-hover)',
          light: 'var(--color-info-light)',
        },
        
        // Risk States
        risk: {
          safe: 'var(--risk-safe)',
          'safe-bg': 'var(--risk-safe-bg)',
          warning: 'var(--risk-warning)',
          'warning-bg': 'var(--risk-warning-bg)',
          danger: 'var(--risk-danger)',
          'danger-bg': 'var(--risk-danger-bg)',
        },
        
        // shadcn/ui compatibility
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      
      /* ============================================
         Typography - Linked to CSS Variables
         Changing --text-base scales the entire system
         ============================================ */
      fontSize: {
        '2xs': ['var(--text-2xs)', { lineHeight: 'var(--text-2xs-line)' }],
        'xs': ['var(--text-xs)', { lineHeight: 'var(--text-xs-line)' }],
        'sm': ['var(--text-sm)', { lineHeight: 'var(--text-sm-line)' }],
        'base': ['var(--text-base)', { lineHeight: 'var(--text-base-line)' }],
        'lg': ['var(--text-lg)', { lineHeight: 'var(--text-lg-line)' }],
        'xl': ['var(--text-xl)', { lineHeight: 'var(--text-xl-line)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--text-2xl-line)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--text-3xl-line)' }],
      },
      
      /* ============================================
         Font Family - System Font Stack
         ============================================ */
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"HarmonyOS Sans SC"',
          '"Microsoft YaHei"',
          '"Source Han Sans SC"',
          '"Noto Sans SC"',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          '"Fira Code"',
          '"Source Code Pro"',
          'monospace',
        ],
      },
      
      /* ============================================
         Border Radius
         ============================================ */
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      
      /* ============================================
         Spacing
         ============================================ */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      
      /* ============================================
         Shadows
         ============================================ */
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      
      /* ============================================
         Transitions
         ============================================ */
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      
      /* ============================================
         Animations
         ============================================ */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
