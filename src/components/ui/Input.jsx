import { forwardRef } from 'react';
import { cn } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Styled input component
 */
export const Input = forwardRef(function Input({
    className,
    type = 'text',
    error,
    ...props
}, ref) {
    const { themeConfig, isDark } = useTheme();

    return (
        <input
            ref={ref}
            type={type}
            className={cn(
                'w-full p-3 rounded-lg outline-none transition-all duration-300',
                themeConfig.inputBg,
                isDark
                    ? 'focus:border-neon-purple focus:shadow-[0_0_15px_rgba(184,51,255,0.2)]'
                    : 'focus:border-purple-500 focus:shadow-md focus:ring-1 focus:ring-purple-200',
                error && 'border-red-500 focus:border-red-500',
                className
            )}
            {...props}
        />
    );
});

/**
 * Styled textarea component
 */
export const Textarea = forwardRef(function Textarea({
    className,
    error,
    ...props
}, ref) {
    const { themeConfig, isDark } = useTheme();

    return (
        <textarea
            ref={ref}
            className={cn(
                'w-full p-3 rounded-lg outline-none transition-all duration-300 resize-none',
                themeConfig.inputBg,
                isDark
                    ? 'focus:border-neon-purple focus:shadow-[0_0_15px_rgba(184,51,255,0.2)]'
                    : 'focus:border-purple-500 focus:shadow-md focus:ring-1 focus:ring-purple-200',
                error && 'border-red-500 focus:border-red-500',
                className
            )}
            {...props}
        />
    );
});

/**
 * Styled select component
 */
export const Select = forwardRef(function Select({
    className,
    children,
    ...props
}, ref) {
    const { isDark } = useTheme();

    return (
        <select
            ref={ref}
            className={cn(
                'px-3 py-2 rounded-lg border outline-none cursor-pointer appearance-none pr-8',
                'bg-no-repeat bg-right',
                isDark
                    ? 'bg-white/10 text-gray-100 border-white/20 focus:border-neon-purple'
                    : 'bg-white text-slate-700 border-slate-200 focus:border-purple-500',
                className
            )}
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.25em 1.25em'
            }}
            {...props}
        >
            {children}
        </select>
    );
});

export default Input;
