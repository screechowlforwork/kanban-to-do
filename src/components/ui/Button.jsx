import { motion } from 'framer-motion';
import { cn } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';
import { buttonPress } from '../../lib/animations';

/**
 * Animated button component with variants
 */
export function Button({
    children,
    variant = 'default',
    size = 'md',
    className,
    disabled,
    ...props
}) {
    const { isDark } = useTheme();

    const variants = {
        default: isDark
            ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200',
        primary: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg',
        danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg',
        ghost: isDark
            ? 'hover:bg-white/10 text-gray-400 hover:text-white'
            : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700',
        neon: 'bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple border border-neon-purple/30 shadow-[0_0_15px_rgba(184,51,255,0.2)]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-xl',
        icon: 'p-2 rounded-lg',
    };

    return (
        <motion.button
            whileHover={disabled ? undefined : { scale: 1.02 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            className={cn(
                'font-medium transition-all duration-200 inline-flex items-center justify-center gap-2',
                variants[variant],
                sizes[size],
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </motion.button>
    );
}

/**
 * Icon button variant
 */
export function IconButton({ icon: Icon, size = 20, className, ...props }) {
    return (
        <Button variant="ghost" size="icon" className={className} {...props}>
            <Icon size={size} />
        </Button>
    );
}

export default Button;
