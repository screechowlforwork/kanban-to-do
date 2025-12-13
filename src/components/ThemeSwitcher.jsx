import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { cn } from '../utils';

const THEME_OPTIONS = [
    { id: THEMES.dark, icon: Moon, label: 'Dark Mode' },
    { id: THEMES.light, icon: Sun, label: 'Light Mode' },
    { id: THEMES.gradient, icon: Sparkles, label: 'Dynamic Mode' },
];

/**
 * Theme Switcher component
 * Floating button group for switching between themes
 */
function ThemeSwitcher({ isInline = false }) {
    const { theme, setTheme, themeConfig, isDark } = useTheme();

    return (
        <motion.div
            initial={isInline ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={isInline ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
                isInline ? 'relative' : 'fixed z-50',
                !isInline && 'bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-[calc(1.5rem+env(safe-area-inset-right))]',
                'flex items-center gap-1 p-1.5 rounded-full',
                'backdrop-blur-xl shadow-lg',
                isDark
                    ? 'bg-black/40 border border-white/10'
                    : 'bg-white/80 border border-slate-200'
            )}
            role="radiogroup"
            aria-label="Theme selector"
        >
            {THEME_OPTIONS.map(({ id, icon: Icon, label }) => (
                <motion.button
                    key={id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTheme(id)}
                    title={label}
                    aria-label={label}
                    aria-checked={theme === id}
                    role="radio"
                    className={cn(
                        'p-2.5 rounded-full transition-all duration-300 relative',
                        theme === id
                            ? isDark
                                ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(184,51,255,0.5)]'
                                : 'bg-slate-800 text-white shadow-md'
                            : isDark
                                ? 'text-gray-400 hover:text-white hover:bg-white/10'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    )}
                >
                    <Icon size={18} />
                    
                    {/* Active indicator dot */}
                    {theme === id && (
                        <motion.div
                            layoutId="theme-indicator"
                            className={cn(
                                'absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                                isDark ? 'bg-neon-green' : 'bg-green-500'
                            )}
                        />
                    )}
                </motion.button>
            ))}
        </motion.div>
    );
}

export default ThemeSwitcher;
