
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Inbox, ChevronDown, ChevronRight } from 'lucide-react';
import TaskCard from './TaskCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import { ConfirmDialog } from './ui';
// import { staggerContainer } from '../lib/animations'; // Removed entirely

// Column theme configurations
const COLUMN_THEMES_DARK = {
    todo: {
        borderColor: 'border-gray-600',
        textColor: 'text-gray-400',
        bgGlow: 'bg-gray-500',
        shadowGlow: 'shadow-[0_0_15px_rgba(75,85,99,0.3)]',
        dropBg: 'bg-gray-500/10',
    },
    doing: {
        borderColor: 'border-neon-blue',
        textColor: 'text-neon-blue',
        bgGlow: 'bg-neon-blue',
        shadowGlow: 'shadow-[0_0_15px_rgba(51,225,255,0.3)]',
        dropBg: 'bg-neon-blue/10',
    },
    done: {
        borderColor: 'border-neon-green',
        textColor: 'text-neon-green',
        bgGlow: 'bg-neon-green',
        shadowGlow: 'shadow-[0_0_15px_rgba(51,255,153,0.3)]',
        dropBg: 'bg-neon-green/10',
    },
    default: {
        borderColor: 'border-neon-purple',
        textColor: 'text-neon-purple',
        bgGlow: 'bg-neon-purple',
        shadowGlow: 'shadow-[0_0_15px_rgba(184,51,255,0.3)]',
        dropBg: 'bg-neon-purple/10',
    }
};

const COLUMN_THEMES_LIGHT = {
    todo: {
        borderColor: 'border-slate-400',
        textColor: 'text-slate-600',
        bgGlow: 'bg-slate-400',
        shadowGlow: '',
        dropBg: 'bg-slate-100',
    },
    doing: {
        borderColor: 'border-blue-500',
        textColor: 'text-blue-600',
        bgGlow: 'bg-blue-500',
        shadowGlow: '',
        dropBg: 'bg-blue-50',
    },
    done: {
        borderColor: 'border-green-500',
        textColor: 'text-green-600',
        bgGlow: 'bg-green-500',
        shadowGlow: '',
        dropBg: 'bg-green-50',
    },
    default: {
        borderColor: 'border-purple-500',
        textColor: 'text-purple-600',
        bgGlow: 'bg-purple-500',
        shadowGlow: '',
        dropBg: 'bg-purple-50',
    }
};

/**
 * Column Container with Vertical Accordion layout for mobile
 */
function ColumnContainer({
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
}) {
    const { isDark, theme: appTheme, themeConfig } = useTheme();
    const [editMode, setEditMode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Accordion state: Default open
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Detect mobile for conditional logic
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(typeof window !== 'undefined' && window.innerWidth < 1024);
    }, []);

    const tasksIds = useMemo(() => tasks.map(task => task.id), [tasks]);

    // Sortable hook for column reordering
    const {
        setNodeRef: setSortableRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: { type: 'Column', column },
        disabled: editMode,
    });

    // Separate droppable hook for task drops
    const {
        setNodeRef: setDroppableRef,
        isOver,
    } = useDroppable({
        id: `column-drop-${column.id}`,
        data: { type: 'Column', column },
    });



    const setNodeRef = (node) => {
        setSortableRef(node);
        setDroppableRef(node);
    };

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        touchAction: 'manipulation', // Allow vertical scrolling
        WebkitTransform: CSS.Transform.toString(transform) || 'translateZ(0)',
    };

    // Get theme based on column ID
    const COLUMN_THEMES = isDark ? COLUMN_THEMES_DARK : COLUMN_THEMES_LIGHT;
    const theme = COLUMN_THEMES[column.id] || COLUMN_THEMES.default;

    // Haptic feedback on drop
    useEffect(() => {
        if (isOver && navigator.vibrate) navigator.vibrate(10);
    }, [isOver]);

    // Function to toggle accordion (Mobile only)
    const toggleLegacy = (e) => {
        if (!editMode && isMobile) {
            // Prevent toggling if clicking buttons
            if (e.target.closest('button') || e.target.closest('input')) return;
            setIsCollapsed(!isCollapsed);
        }
    };

    // Drag placeholder view
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    'w-full lg:min-w-[350px] lg:w-[350px] rounded-xl flex flex-col opacity-60',
                    'h-[100px] lg:h-full', // Smaller placeholder on mobile
                    'border-2 border-dashed',
                    isDark ? 'border-neon-purple/50 bg-neon-purple/5' : 'border-purple-300 bg-purple-50',
                    'mb-4 lg:mb-0' // Margin for mobile vertical stack
                )}
            />
        );
    }
    
    // Determine active styles for "Mailbox" drop state
    const isMailboxActive = isCollapsed && isOver;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            layout
            id={`column-${column.id}`}
            data-column={column.id}
            className={cn(
                // Scroll margin for navigation offset
                'scroll-mt-32',
                // Mobile: Full width, vertical stack with margin
                'w-full mb-4 shrink-0 flex flex-col rounded-xl',
                // Desktop: Fixed width, full height, no margin (gap handles it)
                'lg:mb-0 lg:min-w-[350px] lg:w-[350px] lg:h-full lg:max-h-full',
                
                // Height handling:
                'transition-all duration-300',
                
                // Base background: Tinted Glass
                themeConfig.cardBg,
                
                // Drop zone feedback
                // When collapsed (Mailbox): specific feedback on Header instead (handled below)
                // When open: global feedback
                (!isCollapsed && isOver) && cn(
                    'ring-2',
                    isDark ? 'ring-neon-purple/70' : 'ring-purple-400',
                    theme.dropBg
                ),
                
                // Mailbox Active State (Collapsed Drop) - Global container tweak
                isMailboxActive && 'scale-[1.02] shadow-lg ring-2 ring-offset-2 ring-primary/50'
            )}
        >
            {/* Column Header - Clickable on mobile */}
            <div
                {...attributes}
                {...listeners}
                onClick={toggleLegacy}
                className={cn(
                    'sticky top-0 z-10 h-[60px] shrink-0 cursor-grab rounded-t-xl p-4 flex items-center justify-between transition-colors duration-300',
                    'group select-none',
                    
                    // Default Header Styles
                    'bg-transparent border-b',
                    themeConfig.borderColor,
                            
                    // Mailbox Active Styles (Collapsed Drop)
                    // Highlight the header strongly to invite drop
                    isMailboxActive && cn(
                        'rounded-xl border-b-0', // Round bottom corners too when collapsed active
                        isDark 
                            ? 'bg-neon-purple/20 border-neon-purple/50' 
                            : 'bg-purple-100 border-purple-400'
                    )
                )}
                style={{ touchAction: 'none' }}
            >
                <div className="flex gap-3 items-center">
                    {/* Mobile Only: Chevron */}
                    <div className="lg:hidden text-gray-400">
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                    </div>

                    {/* Task Count Badge */}
                    <motion.div
                        key={tasks.length}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className={cn(
                            'flex justify-center items-center min-w-[28px] px-2 py-0.5 text-xs rounded-full font-bold',
                            appTheme === 'gradient' ? 'bg-white/20' : isDark ? 'bg-white/5' : 'bg-slate-100',
                            theme.textColor
                        )}
                    >
                        {tasks.length}
                    </motion.div>

                    {/* Column Title */}
                    {!editMode ? (
                        <h2 
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditMode(true);
                            }}
                            className={cn(
                                'font-semibold text-sm tracking-wide uppercase cursor-pointer hover:opacity-70 transition-opacity',
                                theme.textColor
                            )}
                        >
                            {column.title}
                        </h2>
                    ) : (
                        <input
                            autoFocus
                            className={cn(
                                'bg-transparent outline-none font-semibold text-sm uppercase tracking-wide',
                                'text-[16px]', // iOS: Prevent zoom
                                theme.textColor
                            )}
                            value={column.title}
                            onChange={(e) => updateColumn(column.id, e.target.value)}
                            onBlur={() => setEditMode(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') setEditMode(false);
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                        />
                    )}
                </div>

                {/* Delete Column Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleting(true);
                    }}
                    className={cn(
                        'opacity-0 group-hover:opacity-100 transition-opacity p-2.5 rounded-lg touch-target',
                        // Mobile: Always visible if preferred, or rely on group-hover
                        'opacity-100 lg:opacity-0 touch-visible',
                        isDark
                            ? 'text-gray-500 hover:text-red-400 active:text-red-400 hover:bg-white/5 active:bg-white/10'
                            : 'text-slate-400 hover:text-red-500 active:text-red-500 hover:bg-slate-100 active:bg-red-50'
                    )}
                    aria-label="Delete column"
                >
                    <Trash2 size={18} />
                </motion.button>
            </div>

            {/* Decorative Glow Line (Always visible) */}
            <div className={cn('h-[2px] w-full', theme.bgGlow, theme.shadowGlow)} />

            {/* Content Area - Collapsible on Mobile */}
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            'flex-1 flex flex-col',
                            'lg:h-full lg:opacity-100 lg:block' // Force visible on desktop
                        )}
                    >
                        {/* Task List Container */}
                        <div
                            className={cn(
                                'flex-1 flex flex-col gap-3 p-3',
                                // Mobile: Min height for drop target only when open
                                'min-h-[150px]',
                                // Desktop: Scrollable area
                                'lg:overflow-y-auto lg:overflow-x-hidden no-scrollbar'
                            )}
                            style={{
                                overscrollBehaviorY: 'contain',
                                WebkitOverflowScrolling: 'touch',
                            }}
                        >
                            <SortableContext items={tasksIds} strategy={verticalListSortingStrategy}>
                                <AnimatePresence mode="popLayout">
                                    {tasks.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            deleteTask={deleteTask}
                                            updateTask={updateTask}
                                        />
                                    ))}
                                </AnimatePresence>
                            </SortableContext>

                            {/* Empty State */}
                            <AnimatePresence>
                                {tasks.length === 0 && !isOver && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={cn(
                                            'flex flex-col items-center justify-center p-8 mt-4',
                                            'min-h-[120px]',
                                            'border border-dashed rounded-xl text-center',
                                            isDark
                                                ? 'border-white/10 bg-white/5 text-gray-500'
                                                : 'border-slate-300 bg-slate-50 text-slate-400'
                                        )}
                                    >
                                        <Inbox size={32} className="mb-2 opacity-50" />
                                        <p className="text-sm font-medium">No tasks yet</p>
                                        <p className="text-xs opacity-75 mt-1">Drop items here</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Active Drop Zone Indicator */}
                            <AnimatePresence>
                                {isOver && tasks.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={cn(
                                            'flex items-center justify-center p-8',
                                            'min-h-[120px]',
                                            'border-2 border-dashed rounded-xl',
                                            isDark
                                                ? 'border-neon-purple/70 bg-neon-purple/10 text-neon-purple'
                                                : 'border-purple-400 bg-purple-100 text-purple-600'
                                        )}
                                    >
                                        <motion.p 
                                            className="text-sm font-semibold"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        >
                                            Drop here ✓
                                        </motion.p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Add Task Button */}
                        <div className="p-3 pt-0">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={cn(
                                    'flex gap-2 items-center justify-center w-full py-3 rounded-lg touch-target',
                                    'border border-dashed transition-all duration-200 bg-transparent',
                                    'font-medium text-sm',
                                    themeConfig.addTaskButton
                                )}
                                onClick={() => createTask(column.id)}
                            >
                                <Plus size={18} />
                                Add Task
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Column Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleting}
                onClose={() => setIsDeleting(false)}
                onConfirm={() => deleteColumn(column.id)}
                title="Delete Column?"
                message={
                    tasks.length > 0
                        ? `Are you sure you want to delete "${column.title}"? This column contains ${tasks.length} task${tasks.length > 1 ? 's' : ''} that will also be deleted.`
                        : `Are you sure you want to delete "${column.title}"?`
                }
                confirmText="Delete Column"
                variant="danger"
            />
        </motion.div>
    );
}

export default memo(ColumnContainer);

