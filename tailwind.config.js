/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        port: {
          dark: '#0a0e1a',
          navy: '#0d1b2a',
          steel: '#1b2d45',
          blue: '#1e4d8c',
          cyan: '#00c2e0',
          amber: '#f59e0b',
          green: '#10b981',
          red: '#ef4444',
          gray: '#64748b',
        }
      },
      backgroundImage: {
        'port-bg': "url('/src/assets/bg-port.jpg')",
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
      }
    }
  },
  plugins: []
}
