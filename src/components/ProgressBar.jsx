import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '../utils';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Progress Bar component showing project completion
 */
function ProgressBar({ stats }) {
    const { themeConfig, isDark } = useTheme();
    const { total, completed, percentage } = stats;

    // Determine progress color based on percentage
    const getProgressColor = () => {
        if (percentage >= 100) return isDark ? 'from-neon-green to-emerald-400' : 'from-green-400 to-emerald-500';
        if (percentage >= 75) return isDark ? 'from-neon-blue to-cyan-400' : 'from-blue-400 to-cyan-500';
        if (percentage >= 50) return isDark ? 'from-neon-purple to-indigo-500' : 'from-purple-400 to-indigo-500';
        return isDark ? 'from-neon-purple via-pink-500 to-neon-red' : 'from-purple-400 via-pink-400 to-red-400';
    };

    return (
        <div className="flex-1 min-w-[200px] md:min-w-[300px]">
            {/* Label Row */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className={isDark ? 'text-gray-500' : 'text-slate-400'} />
                    <span className={cn(
                        'text-sm font-medium',
                        isDark ? 'text-gray-400' : 'text-slate-500'
                    )}>
                        Progress
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Percentage with animation */}
                    <motion.span
                        key={percentage}
                        initial={{ scale: 1.2, color: isDark ? '#33FF99' : '#22c55e' }}
                        animate={{ scale: 1, color: isDark ? '#f3f4f6' : '#334155' }}
                        className={cn('font-bold text-sm', themeConfig.textPrimary)}
                    >
                        {percentage}%
                    </motion.span>
                    <span className={cn(
                        'text-xs',
                        isDark ? 'text-gray-500' : 'text-slate-400'
                    )}>
                        ({completed}/{total})
                    </span>
                    
                    {/* Completion indicator */}
                    {percentage === 100 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={cn(
                                'p-0.5 rounded-full',
                                isDark ? 'bg-neon-green/20' : 'bg-green-100'
                            )}
                        >
                            <CheckCircle size={14} className={isDark ? 'text-neon-green' : 'text-green-500'} />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className={cn(
                'relative w-full h-2.5 rounded-full overflow-hidden',
                isDark ? 'bg-gray-700/30' : 'bg-slate-200'
            )}>
                {/* Background shimmer effect */}
                <div className={cn(
                    'absolute inset-0 opacity-30',
                    isDark ? 'bg-white/5' : 'bg-slate-100'
                )} />

                {/* Progress Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className={cn(
                        'h-full rounded-full bg-gradient-to-r relative overflow-hidden',
                        getProgressColor(),
                        isDark && 'shadow-[0_0_15px_rgba(184,51,255,0.4)]'
                    )}
                >
                    {/* Animated shine effect */}
                    <motion.div
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: 'easeInOut'
                        }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    />
                </motion.div>
            </div>
        </div>
    );
}

export default ProgressBar;
