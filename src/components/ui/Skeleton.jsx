import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils';

/**
 * Skeleton loading component with shimmer effect
 */
export function Skeleton({ className, ...props }) {
    return (
        <motion.div
            className={cn(
                'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800',
                'bg-[length:200%_100%] rounded animate-pulse',
                className
            )}
            animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            }}
            {...props}
        />
    );
}

/**
 * Task card skeleton
 */
export function TaskCardSkeleton() {
    return (
        <div className="w-full min-h-[100px] rounded-xl p-4 bg-white/5 border border-white/10">
            <div className="flex justify-between items-start gap-2 mb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
}

/**
 * Column skeleton with multiple task placeholders
 */
export function ColumnSkeleton() {
    return (
        <div className="min-w-[85vw] md:min-w-[350px] h-full rounded-xl bg-black/20 border border-white/5 p-4">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-4">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
            </div>
        </div>
    );
}

/**
 * Full board skeleton
 */
export function BoardSkeleton() {
    return (
        <div className="flex gap-4 p-4 overflow-hidden">
            <ColumnSkeleton />
            <ColumnSkeleton />
            <ColumnSkeleton />
        </div>
    );
}

/**
 * Sidebar skeleton
 */
export function SidebarSkeleton() {
    return (
        <div className="w-[280px] h-full p-4 space-y-4 bg-black/20">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    );
}

export default Skeleton;
