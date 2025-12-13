import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle, Pencil, ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import { Select } from './ui';
import { PRIORITIES, PRIORITY_OPTIONS } from '../lib/constants';
import { scaleFade } from '../lib/animations';

// Priority styling configurations
const PRIORITY_STYLES_DARK = {
    High: {
        line: 'bg-neon-red shadow-[0_0_10px_#FF3366]',
        badge: 'bg-neon-red/10 text-neon-red border-neon-red/20',
        glow: 'hover:shadow-[0_0_20px_rgba(255,51,102,0.3)] hover:border-neon-red/30',
    },
    Medium: {
        line: 'bg-neon-purple shadow-[0_0_10px_#B833FF]',
        badge: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20',
        glow: 'hover:shadow-[0_0_20px_rgba(184,51,255,0.3)] hover:border-neon-purple/30',
    },
    Low: {
        line: 'bg-neon-blue shadow-[0_0_10px_#33E1FF]',
        badge: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20',
        glow: 'hover:shadow-[0_0_20px_rgba(51,225,255,0.3)] hover:border-neon-blue/30',
    },
    default: {
        line: 'bg-gray-500',
        badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        glow: 'hover:shadow-white/20 hover:border-white/30',
    }
};

const PRIORITY_STYLES_LIGHT = {
    High: {
        line: 'bg-red-500',
        badge: 'bg-red-100 text-red-600 border-red-200',
        glow: 'hover:shadow-lg hover:shadow-red-100 hover:border-red-300',
    },
    Medium: {
        line: 'bg-purple-500',
        badge: 'bg-purple-100 text-purple-600 border-purple-200',
        glow: 'hover:shadow-lg hover:shadow-purple-100 hover:border-purple-300',
    },
    Low: {
        line: 'bg-blue-500',
        badge: 'bg-blue-100 text-blue-600 border-blue-200',
        glow: 'hover:shadow-lg hover:shadow-blue-100 hover:border-blue-300',
    },
    default: {
        line: 'bg-gray-400',
        badge: 'bg-gray-100 text-gray-600 border-gray-200',
        glow: 'hover:shadow-md hover:border-gray-300',
    }
};

// iOS touch delay before showing action buttons
const IOS_TOUCH_DELAY = 150;

/**
 * Task Card component with iOS-optimized touch handling
 */
function TaskCard({ task, deleteTask, updateTask, isOverlay }) {
    const { themeConfig, isDark, theme } = useTheme();
    const [editMode, setEditMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [flash, setFlash] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const prevColumnId = useRef(task.columnId);
    const titleInputRef = useRef(null);
    const touchTimerRef = useRef(null);
    const isTouchDevice = useRef(false);

    // Detect touch device
    useEffect(() => {
        isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    // Detect task completion (moved to done column)
    useEffect(() => {
        if (prevColumnId.current !== 'done' && task.columnId === 'done') {
            setFlash(true);
            // Haptic feedback on iOS
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            const timer = setTimeout(() => setFlash(false), 600);
            return () => clearTimeout(timer);
        }
        prevColumnId.current = task.columnId;
    }, [task.columnId]);

    // Focus title input when entering edit mode
    useEffect(() => {
        if (editMode && titleInputRef.current) {
            // iOS Safari: Delay focus to ensure keyboard opens properly
            setTimeout(() => {
                titleInputRef.current?.focus();
                titleInputRef.current?.select();
            }, 100);
        }
    }, [editMode]);

    // Cleanup touch timer
    useEffect(() => {
        return () => {
            if (touchTimerRef.current) {
                clearTimeout(touchTimerRef.current);
            }
        };
    }, []);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
        // iOS: Critical touch-action settings
        touchAction: 'manipulation',
        // iOS: Force GPU layer for smooth dragging
        WebkitTransform: CSS.Translate.toString(transform) || 'translateZ(0)',
    };

    const toggleEditMode = useCallback((e) => {
        e?.stopPropagation();
        e?.preventDefault();
        setEditMode(prev => !prev);
        setIsExpanded(false);
        setIsDeleting(false);
        setShowActions(false);
    }, []);

    const toggleExpanded = useCallback((e) => {
        e?.stopPropagation();
        if (!editMode && !isDragging) {
            setIsExpanded(prev => !prev);
        }
    }, [editMode, isDragging]);

    // iOS: Handle touch start for showing action buttons
    const handleTouchStart = useCallback(() => {
        if (isTouchDevice.current && !editMode) {
            touchTimerRef.current = setTimeout(() => {
                setShowActions(true);
            }, IOS_TOUCH_DELAY);
        }
    }, [editMode]);

    // iOS: Handle touch end
    const handleTouchEnd = useCallback(() => {
        if (touchTimerRef.current) {
            clearTimeout(touchTimerRef.current);
        }
    }, []);

    const handleDelete = useCallback((e) => {
        e?.stopPropagation();
        e?.preventDefault();
        deleteTask(task.id);
    }, [deleteTask, task.id]);

    const PRIORITY_STYLES = isDark ? PRIORITY_STYLES_DARK : PRIORITY_STYLES_LIGHT;
    const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.default;

    // Drag placeholder
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    'w-full min-h-[100px] rounded-xl border-2 border-dashed',
                    isDark ? 'border-neon-purple/30 bg-neon-purple/5' : 'border-purple-300 bg-purple-50'
                )}
                aria-hidden="true"
            />
        );
    }

    // Edit mode view
    if (editMode) {
        return (
            <motion.div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...scaleFade}
                onClick={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                className={cn(
                    'relative flex flex-col p-4 w-full rounded-xl z-50',
                    'border-2 shadow-2xl',
                    theme === 'gradient'
                        ? 'bg-black/60 backdrop-blur-xl border-white/30'
                        : isDark
                            ? 'bg-[#1A1A1E] border-neon-purple/50'
                            : 'bg-white border-purple-400'
                )}
                role="form"
                aria-label="Edit task"
            >
                {/* Edit Header */}
                <div className="flex justify-between items-center mb-4 gap-2">
                    <Select
                        value={task.priority || PRIORITIES.MEDIUM}
                        onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="text-sm touch-target"
                    >
                        {PRIORITY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleEditMode}
                        className={cn(
                            'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors touch-target',
                            isDark
                                ? 'bg-neon-green/10 text-neon-green active:bg-neon-green/20'
                                : 'bg-green-100 text-green-600 active:bg-green-200'
                        )}
                    >
                        Done
                    </motion.button>
                </div>

                {/* Title Input - iOS: font-size 16px to prevent zoom */}
                <input
                    ref={titleInputRef}
                    className={cn(
                        'bg-transparent font-semibold text-lg mb-3 outline-none w-full',
                        'text-[16px]', // iOS: Prevent zoom
                        themeConfig.textPrimary,
                        'placeholder:opacity-50'
                    )}
                    value={task.title}
                    placeholder="Task title"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            setEditMode(false);
                        }
                        if (e.key === 'Escape') {
                            setEditMode(false);
                        }
                    }}
                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                    autoComplete="off"
                    autoCorrect="on"
                    spellCheck="true"
                />

                {/* Content Textarea - iOS: font-size 16px to prevent zoom */}
                <textarea
                    className={cn(
                        'bg-transparent text-sm resize-none outline-none min-h-[100px] w-full',
                        'text-[16px]', // iOS: Prevent zoom
                        themeConfig.textSecondary,
                        'placeholder:opacity-50'
                    )}
                    rows={4}
                    value={task.content}
                    placeholder="Add details..."
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setEditMode(false);
                        }
                    }}
                    onChange={(e) => updateTask(task.id, { content: e.target.value })}
                    autoComplete="off"
                    autoCorrect="on"
                    spellCheck="true"
                />
            </motion.div>
        );
    }

    // Default view
    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            onMouseEnter={() => !isTouchDevice.current && setShowActions(true)}
            onMouseLeave={() => {
                setShowActions(false);
                setIsDeleting(false);
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={cn(
                'group relative flex w-full rounded-xl overflow-hidden',
                isExpanded ? 'min-h-[200px]' : 'min-h-[100px]',
                'transition-all duration-200 ease-out',
                isOverlay && 'scale-105 shadow-2xl rotate-2 z-50',
                theme === 'gradient'
                    ? 'bg-white/10 backdrop-blur-xl border border-white/20'
                    : isDark
                        ? 'bg-[#1A1A1E] border border-white/10'
                        : 'bg-white border border-slate-200 shadow-sm',
                pStyle.glow,
                flash && (isDark
                    ? 'ring-2 ring-neon-green bg-neon-green/10'
                    : 'ring-2 ring-green-400 bg-green-50')
            )}
            role="article"
            aria-label={`Task: ${task.title}`}
            data-draggable="true"
        >
            {/* Priority Line */}
            <motion.div 
                layoutId={`priority-${task.id}`}
                className={cn(
                    'absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full',
                    pStyle.line
                )} 
            />

            {/* Drag Handle - iOS: touch-none is critical */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    'flex items-center justify-center px-3 min-w-[44px]',
                    'cursor-grab active:cursor-grabbing',
                    'touch-none select-none', // iOS: Critical for drag
                    isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                )}
                style={{ touchAction: 'none' }} // iOS: Extra enforcement
                aria-label="Drag to reorder"
            >
                <GripVertical size={18} />
            </div>

            {/* Main Card Body - Tap to expand */}
            <div
                onClick={toggleExpanded}
                onTouchEnd={(e) => {
                    // iOS: Prevent ghost clicks
                    if (!isDragging) {
                        toggleExpanded(e);
                    }
                }}
                className="flex-1 flex flex-col p-3 pl-1 cursor-pointer min-w-0"
                style={{ touchAction: 'manipulation' }}
            >
                {/* Header Row */}
                <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            'font-medium leading-snug text-base',
                            'break-words line-clamp-2',
                            themeConfig.textPrimary
                        )}>
                            {task.title}
                        </h3>
                    </div>
                    {task.priority && (
                        <motion.span
                            layoutId={`badge-${task.id}`}
                            className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full font-semibold border uppercase tracking-wider shrink-0',
                                pStyle.badge
                            )}
                        >
                            {task.priority}
                        </motion.span>
                    )}
                </div>

                {/* Content */}
                <div className="flex items-start gap-2 min-h-[36px]">
                    <p className={cn(
                        'flex-1 text-sm leading-relaxed font-light',
                        'break-words whitespace-pre-wrap',
                        isExpanded ? '' : 'line-clamp-2',
                        themeConfig.textSecondary
                    )}>
                        {task.content || (
                            <span className="italic opacity-50">No description</span>
                        )}
                    </p>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown
                            size={16}
                            className={cn(
                                'shrink-0 mt-1 transition-colors',
                                isDark ? 'text-gray-500' : 'text-gray-400'
                            )}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Action Buttons - Show on hover (desktop) or touch (mobile) */}
            <AnimatePresence>
                {(showActions || isDeleting) && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={cn(
                            'absolute right-2 top-2 z-10 flex gap-1'
                        )}
                    >
                        {!isDeleting ? (
                            <>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleEditMode}
                                    onTouchEnd={(e) => {
                                        e.stopPropagation();
                                        toggleEditMode(e);
                                    }}
                                    className={cn(
                                        'p-2.5 rounded-lg transition-colors touch-target',
                                        isDark
                                            ? 'bg-white/10 active:bg-white/20 text-gray-300'
                                            : 'bg-slate-100 active:bg-slate-200 text-slate-500'
                                    )}
                                    aria-label="Edit task"
                                >
                                    <Pencil size={16} />
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDeleting(true);
                                    }}
                                    onTouchEnd={(e) => {
                                        e.stopPropagation();
                                        setIsDeleting(true);
                                    }}
                                    className={cn(
                                        'p-2.5 rounded-lg transition-colors touch-target',
                                        isDark
                                            ? 'bg-white/10 active:bg-red-500/20 text-gray-300 active:text-red-400'
                                            : 'bg-slate-100 active:bg-red-100 text-slate-500 active:text-red-500'
                                    )}
                                    aria-label="Delete task"
                                >
                                    <Trash2 size={16} />
                                </motion.button>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={cn(
                                    'flex gap-2 p-2 rounded-lg backdrop-blur-sm border',
                                    isDark
                                        ? 'bg-black/60 border-red-500/30'
                                        : 'bg-white/90 border-red-200'
                                )}
                            >
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleDelete}
                                    onTouchEnd={(e) => {
                                        e.stopPropagation();
                                        handleDelete(e);
                                    }}
                                    className="text-red-400 active:text-red-300 text-xs font-bold px-3 py-1.5 touch-target"
                                >
                                    Delete
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDeleting(false);
                                    }}
                                    onTouchEnd={(e) => {
                                        e.stopPropagation();
                                        setIsDeleting(false);
                                    }}
                                    className={cn(
                                        'text-xs px-3 py-1.5 touch-target',
                                        isDark ? 'text-gray-400 active:text-white' : 'text-slate-500 active:text-slate-700'
                                    )}
                                >
                                    Cancel
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion Flash Overlay */}
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-[1px]"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                            className={cn(
                                'p-3 rounded-full',
                                isDark
                                    ? 'bg-neon-green/20 shadow-[0_0_20px_rgba(51,255,153,0.5)]'
                                    : 'bg-green-100 shadow-lg'
                            )}
                        >
                            <CheckCircle size={32} className={isDark ? 'text-neon-green' : 'text-green-500'} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default memo(TaskCard);
