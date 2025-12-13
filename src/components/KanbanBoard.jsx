import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Menu, Search, Keyboard } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    pointerWithin,
    MeasuringStrategy,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import ColumnContainer from './ColumnContainer';
import ColumnDock from './ColumnDock';
import TaskCard from './TaskCard';
import ThemeSwitcher from './ThemeSwitcher';
import ProgressBar from './ProgressBar';
import { useKanban, useAppShortcuts } from '../hooks';
import { cn } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import { DND_CONFIG } from '../lib/constants';
import { staggerContainer, staggerItem } from '../lib/animations';

/**
 * Main Kanban Board component
 * With dynamic snap toggle for smooth mobile drag-and-drop
 */
function KanbanBoard({ projectId, onToggleSidebar }) {
    const { themeConfig, isDark, theme } = useTheme();
    const searchInputRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Use custom hook for all kanban logic
    const {
        columns,
        tasksByColumn,
        columnIds,
        activeColumn,
        activeTask,
        searchQuery,
        stats,
        createColumn,
        updateColumn,
        deleteColumn,
        createTask,
        updateTask,
        deleteTask,
        setSearchQuery,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
    } = useKanban(projectId);

    // Determine if currently dragging (for snap toggle)
    const isDragging = !!(activeColumn || activeTask);

    // DnD sensors configuration
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: DND_CONFIG.MOUSE_ACTIVATION_DISTANCE,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: DND_CONFIG.TOUCH_DELAY,
                tolerance: DND_CONFIG.TOUCH_TOLERANCE,
            },
        })
    );

    // DnD measuring configuration
    const measuringConfig = useMemo(() => ({
        droppable: {
            strategy: MeasuringStrategy.Always,
        },
    }), []);

    // Keyboard shortcut: Focus search
    const focusSearch = useCallback(() => {
        searchInputRef.current?.focus();
    }, []);

    // Keyboard shortcut: Create new task in first column
    const handleNewTask = useCallback(() => {
        if (columns.length > 0) {
            createTask(columns[0].id);
        }
    }, [columns, createTask]);

    // Setup keyboard shortcuts
    useAppShortcuts({
        onSearch: focusSearch,
        onNewTask: handleNewTask,
        onToggleSidebar,
    });

    // Detect mobile for conditional logic
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Dynamic Sortable Strategy
    const sortableStrategy = isMobile 
        ? verticalListSortingStrategy 
        : horizontalListSortingStrategy;

    // AutoScroll optimized for layout direction
    const autoScrollConfig = useMemo(() => ({
        enabled: true,
        threshold: {
            x: isMobile ? 0 : 0.2, // Mobile: No horizontal scroll
            y: isMobile ? 0.2 : 0, // Mobile: Vertical scroll only
        },
        acceleration: 0,
        maxSpeed: 12,
        layoutShiftCompensation: false,
    }), [isMobile]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col h-[100dvh] overflow-hidden"
        >
            {/* Header Bar */}
            <div className="flex-shrink-0 overflow-hidden relative z-40 bg-inherit">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-4 md:px-8 py-5"
                >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                'p-2 rounded-lg transition-colors md:hidden touch-target shrink-0',
                                isDark
                                    ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            )}
                            onClick={onToggleSidebar}
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={24} />
                        </motion.button>
                        
                        {/* Mobile Theme Switcher */}
                        <div className="md:hidden">
                            <ThemeSwitcher isInline />
                        </div>

                        <div className="flex-1 md:flex-none">
                            <ProgressBar stats={stats} />
                        </div>
                    </div>
                    
                    {/* Search Input */}
                    <div className="relative w-full md:w-[300px] shrink-0">
                        <Search 
                            size={18} 
                            className={cn(
                                'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
                                isDark ? 'text-gray-500' : 'text-slate-400'
                            )} 
                        />
                        <input
                            ref={searchInputRef}
                            type="text"
                            className={cn(
                                'w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all duration-300',
                                'text-[16px]', // iOS: Prevent zoom on focus
                                themeConfig.inputBg,
                                isDark
                                    ? 'focus:border-neon-purple focus:shadow-[0_0_15px_rgba(184,51,255,0.2)]'
                                    : theme === 'gradient'
                                        ? 'focus:border-white/50 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                        : 'focus:border-purple-500 focus:shadow-md focus:ring-1 focus:ring-purple-200'
                            )}
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        {/* Keyboard shortcut hint */}
                        <div className={cn(
                            'absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs',
                            isDark ? 'text-gray-600' : 'text-slate-400'
                        )}>
                            <kbd className={cn(
                                'px-1.5 py-0.5 rounded border text-[10px] font-mono',
                                isDark 
                                    ? 'border-white/10 bg-white/5' 
                                    : 'border-slate-200 bg-slate-100'
                            )}>/</kbd>
                        </div>
                    </div>
                </motion.div>

                {/* DnD Context & Board */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    measuring={measuringConfig}
                    autoScroll={autoScrollConfig}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                >
                    {/* 
                        Responsive Layout:
                        - Mobile: flex-col, overflow-y-auto (Vertical Accordion)
                        - Desktop: flex-row, overflow-x-auto (Horizontal Kanban)
                    */}
                    <motion.div 
                        ref={scrollContainerRef}
                        id="kanban-scroll-container"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className={cn(
                            'flex-1 min-h-0 flex',
                            // Mobile: Vertical layout, Y-scroll
                            'flex-col overflow-y-auto overflow-x-hidden px-4 pb-24',
                            // Desktop: Horizontal layout, X-scroll
                            'md:flex-row md:overflow-x-auto md:overflow-y-hidden md:gap-4 md:px-0 md:items-stretch md:pb-0',
                            
                            'no-scrollbar',
                            
                            // Snap: Only for Desktop horizontal scrolling
                            !isDragging && 'md:snap-x md:snap-mandatory',
                            
                            // iOS optimizations based on direction
                            'ios-scroll-y md:ios-scroll-x'
                        )}
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            // Scroll behavior
                            scrollBehavior: isDragging ? 'auto' : 'smooth',
                        }}
                    >
                        <SortableContext items={columnIds} strategy={sortableStrategy}>
                            <AnimatePresence mode="popLayout">
                                {columns.map((col, index) => (
                                    <motion.div
                                        key={col.id}
                                        variants={staggerItem}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <ColumnContainer
                                            column={col}
                                            deleteColumn={deleteColumn}
                                            updateColumn={updateColumn}
                                            createTask={createTask}
                                            deleteTask={deleteTask}
                                            updateTask={updateTask}
                                            tasks={tasksByColumn[col.id] || []}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </SortableContext>

                        {/* Add Column Button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={createColumn}
                            className={cn(
                                // Mobile: Full width
                                'h-[60px] w-full shrink-0 cursor-pointer rounded-xl p-4 flex gap-2 items-center justify-center touch-target',
                                // Desktop: Fixed width
                                'md:min-w-[350px] md:w-[350px] md:self-start',
                                
                                'border-2 border-dashed transition-all',
                                !isDragging && 'md:snap-center',
                                isDark
                                    ? 'bg-white/5 border-white/10 hover:border-gray-500 text-gray-500 hover:text-white hover:bg-white/10'
                                    : 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            )}
                        >
                            <Plus size={20} />
                            <span className="font-medium">Add Column</span>
                        </motion.button>
                    </motion.div>

                    {/* Mobile Teleport Dock */}
                    {createPortal(
                        <ColumnDock 
                            columns={columns} 
                            isDragging={isDragging} 
                            activeTaskId={activeTask?.id}
                        />,
                        document.body
                    )}

                    {/* Drag Overlay - rendered in portal for z-index */}
                    {createPortal(
                        <DragOverlay
                            dropAnimation={{
                                duration: 200,
                                easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                            }}
                            style={{ zIndex: 9999 }}
                        >
                            {activeColumn && (
                                <ColumnContainer
                                    column={activeColumn}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    tasks={tasksByColumn[activeColumn.id] || []}
                                />
                            )}
                            {activeTask && (
                                <TaskCard
                                    task={activeTask}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    isOverlay={true}
                                />
                            )}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>

            {/* Keyboard Shortcuts Hint (Desktop only) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={cn(
                    'hidden md:flex items-center gap-4 px-8 py-3 text-xs',
                    isDark ? 'text-gray-600' : 'text-slate-400'
                )}
            >
                <div className="flex items-center gap-1.5">
                    <Keyboard size={14} />
                    <span>Shortcuts:</span>
                </div>
                <div className="flex items-center gap-4">
                    <span><kbd className="px-1.5 py-0.5 rounded border border-current/20">N</kbd> New Task</span>
                    <span><kbd className="px-1.5 py-0.5 rounded border border-current/20">/</kbd> Search</span>
                    <span><kbd className="px-1.5 py-0.5 rounded border border-current/20">B</kbd> Sidebar</span>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default KanbanBoard;
