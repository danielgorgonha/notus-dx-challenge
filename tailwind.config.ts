import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
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
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        // Notus DX Challenge custom colors
        notus: {
          blue: '#0066FF',
          dark: '#0A0A0F',
          gray: '#1A1A1F',
        },
        // Accent colors
        'accent-green': '#00D9A0',
        'accent-purple': '#8B5CF6',
        'accent-red': '#FF4757',
        'accent-yellow': '#FFC107',
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addUtilities }) {
      // Glass effect cards
      addComponents({
        '.glass-card': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-0.25rem)',
            boxShadow: '0 25px 50px -12px rgba(234, 179, 8, 0.2)',
          },
        },
        // Primary button with gradient
        '.btn-primary': {
          backgroundImage: 'linear-gradient(to right, rgb(250, 204, 21), rgb(234, 179, 8))',
          color: 'rgb(20, 83, 45)',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          borderRadius: '0.75rem',
          fontWeight: '600',
          boxShadow: '0 10px 15px -3px rgba(234, 179, 8, 0.3), 0 4px 6px -2px rgba(234, 179, 8, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-0.125rem)',
            boxShadow: '0 20px 25px -5px rgba(234, 179, 8, 0.4), 0 10px 10px -5px rgba(234, 179, 8, 0.4)',
          },
        },
        // Sidebar navigation
        '.nav-item': {
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          marginLeft: '0.5rem',
          marginRight: '0.5rem',
          borderRadius: '0.75rem',
          color: 'rgb(203, 213, 225)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(51, 65, 85, 0.5)',
            color: 'white',
          },
          '&.active': {
            backgroundColor: 'rgba(234, 179, 8, 0.2)',
            color: 'rgb(253, 224, 71)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          },
        },
        // Privy Modal Customization
        '[data-privy-modal]': {
          backdropFilter: 'blur(24px)',
          '[data-privy-modal-content]': {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '[data-privy-modal-header]': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          'button[data-privy-button]': {
            backgroundImage: 'linear-gradient(to right, rgb(37, 99, 235), rgb(16, 185, 129))',
            border: '0',
            '&:hover': {
              backgroundImage: 'linear-gradient(to right, rgb(29, 78, 216), rgb(5, 150, 105))',
            },
          },
          'input[data-privy-input]': {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            '&::placeholder': {
              color: 'rgb(148, 163, 184)',
            },
          },
          '[data-privy-wallet-button]': {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(51, 65, 85, 0.5)',
            },
          },
          'button:not([data-privy-wallet-button]):not([data-privy-social-button])': {
            backgroundImage: 'linear-gradient(to right, rgb(37, 99, 235), rgb(16, 185, 129))',
            color: 'white',
            fontWeight: '600',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            borderRadius: '0.75rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '0',
            '&:hover': {
              backgroundImage: 'linear-gradient(to right, rgb(29, 78, 216), rgb(5, 150, 105))',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
          },
          '[data-privy-social-button]': {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(51, 65, 85, 0.5)',
            },
          },
        },
      })

      // Custom scrollbar utilities
      addUtilities({
        '.token-selector-scroll': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1e293b',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#64748b',
            borderRadius: '3px',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              background: '#94a3b8',
            },
            '&:active': {
              background: '#cbd5e1',
            },
          },
          // Firefox scrollbar styles
          scrollbarWidth: 'thin',
          scrollbarColor: '#64748b #1e293b',
        },
      })
    }),
  ],
}

export default config

