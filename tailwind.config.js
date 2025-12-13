/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            // Custom Colors
            colors: {
                deepblack: '#0F0F12',
                gunmetal: '#18181B',
                cardbg: 'rgba(255, 255, 255, 0.05)',
                neon: {
                    red: '#FF3366',
                    blue: '#33E1FF',
                    purple: '#B833FF',
                    green: '#33FF99',
                    orange: '#FF9933',
                },
            },
            // Typography
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            // Shadows
            boxShadow: {
                'neon-red': '0 0 20px rgba(255, 51, 102, 0.5)',
                'neon-blue': '0 0 20px rgba(51, 225, 255, 0.5)',
                'neon-purple': '0 0 20px rgba(184, 51, 255, 0.5)',
                'neon-green': '0 0 20px rgba(51, 255, 153, 0.5)',
                glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
            },
            // Animations
            animation: {
                'gradient-slow': 'gradient-shift 15s ease infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'bounce-gentle': 'bounce-gentle 1s ease-in-out infinite',
            },
            keyframes: {
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                },
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            // Background Size
            backgroundSize: {
                '400%': '400% 400%',
                '200%': '200% 100%',
            },
            // Border Radius
            borderRadius: {
                '4xl': '2rem',
            },
            // Backdrop Blur
            backdropBlur: {
                xs: '2px',
            },
            // Transitions
            transitionTimingFunction: {
                'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'smooth-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            },
            // Z-index scale
            zIndex: {
                60: '60',
                70: '70',
                80: '80',
                90: '90',
                100: '100',
            },
        },
    },
    plugins: [],
};
