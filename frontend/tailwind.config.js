/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#070a0f',
          900: '#0b0f17',
          850: '#101622',
          800: '#161e2e',
          700: '#212d45',
          600: '#324263',
        },
        cyan: {
          electric: '#00F2FE',
          glow: '#06B6D4',
          dim: 'rgba(6, 182, 212, 0.15)',
        },
        ai: {
          violet: '#8B5CF6',
          soft: '#A78BFA',
          glow: 'rgba(139, 92, 246, 0.15)',
        },
        threat: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#10B981',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -5px rgba(0, 242, 254, 0.3)',
        'ai-glow': '0 0 20px -5px rgba(139, 92, 246, 0.3)',
        'threat-glow': '0 0 20px -5px rgba(239, 68, 68, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
