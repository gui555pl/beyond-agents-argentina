/**
 * Design Aurora — tokens importados de DESIGN-aurora.md.
 *
 * - Aurora Violet é a ÚNICA cor de ação.
 * - Display weight em 500 (nunca bold pesado).
 * - Profundidade por hairline + contraste sutil de surface, sem drop shadows.
 * - Pills de jornada (5 tons pastel) só dentro de UI de produto.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#7c3aed',
          active: '#6d28d9',
          light: '#a78bfa',
        },
        'on-primary': '#ffffff',

        // Surface
        canvas: {
          DEFAULT: '#0a0a0f',
          soft: '#12121a',
        },
        surface: {
          card: '#1a1a27',
          strong: '#252536',
          overlay: '#0f0f1a',
        },

        // Hairlines
        hairline: {
          DEFAULT: '#2a2a40',
          soft: '#1e1e30',
          strong: '#3a3a55',
        },

        // Text
        ink: '#f0efe8',
        body: {
          DEFAULT: '#a8a5b8',
          strong: '#d4d2e0',
        },
        muted: {
          DEFAULT: '#6b6880',
          soft: '#4a4760',
        },

        // Journey pills (assinatura de aceleração — só em UI de produto)
        journey: {
          thinking: '#dfa88f',
          discovery: '#9fc9a2',
          build: '#9fbbe0',
          scale: '#c0a8dd',
          done: '#c08532',
        },

        // Semantic
        success: '#1f8a65',
        danger: '#cf2d56',
        warning: '#d97706',

        // Vertical badges
        vertical: {
          gov: '#3b82f6',
          health: '#10b981',
          legal: '#f59e0b',
          ed: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Aurora display + body scale (px-based, conforme DESIGN-aurora §Typography)
        'display-mega': ['72px', { lineHeight: '1.1', letterSpacing: '-2px', fontWeight: '500' }],
        'display-lg': ['40px', { lineHeight: '1.15', letterSpacing: '-1px', fontWeight: '500' }],
        'display-md': ['28px', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '500' }],
        'display-sm': ['22px', { lineHeight: '1.3', letterSpacing: '-0.2px', fontWeight: '500' }],
        'title-md': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'title-sm': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        caption: ['13px', { lineHeight: '1.4' }],
        'caption-uppercase': ['11px', { lineHeight: '1.4', letterSpacing: '0.88px', fontWeight: '600' }],
        button: ['14px', { lineHeight: '1', fontWeight: '500' }],
      },
      borderRadius: {
        // Aurora radius scale
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      spacing: {
        // Section rhythm
        section: '80px',
      },
      backgroundImage: {
        'aurora-radial':
          'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        'aurora-radial-soft':
          'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.08) 0%, transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 280ms ease-out',
        'slide-in': 'slideIn 320ms ease-out',
        'pulse-soft': 'pulseSoft 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
};
