import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Keyboard, Plus } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    pointerWithin,
    MeasuringStrategy,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';

import ColumnContainer from './ColumnContainer';
import ColumnDock from './ColumnDock';
import TaskCard from './TaskCard';
import ThemeSwitcher from './ThemeSwitcher';
import ProgressBar from './ProgressBar';
import { useKanban, useAppShortcuts } from '../hooks';
import { cn } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import { DND_CONFIG } from '../lib/constants';
import { staggerItem } from '../lib/animations';

/**
 * Main Kanban Board component
 * Supports Drag and Drop with responsive layout
 */
function KanbanBoard({ projectId, onToggleSidebar }) {
    const searchInputRef = useRef(null);
    const { themeConfig, isDark, theme } = useTheme();

    // Use custom hook for Kanban logic
    const {
        columns,
        tasksByColumn,
        activeColumn,
        activeTask,
        columnIds,
        stats,
        searchQuery,
        // Actions
        createTask,
        updateTask,
        deleteTask,
        updateColumn,
        deleteColumn,
        createColumn,
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

    // Detect mobile for conditional logic (1024px = lg breakpoint)
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Dynamic Sortable Strategy
    const sortableStrategy = isMobile 
        ? verticalListSortingStrategy 
        : horizontalListSortingStrategy;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            measuring={measuringConfig}
            autoScroll={{
                enabled: true,
                layoutShiftCompensation: false,
                acceleration: 0, // Must be 0 to prevent scroll runaway during drag
                interval: 10
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
        >
            <div className="flex flex-col h-full w-full overflow-hidden relative">
                {/* Header Bar - Fixed Top */}
                <header 
                    className={cn(
                        'flex-none z-40',
                        'backdrop-blur-xl border-b transition-colors',
                        isDark 
                            ? 'bg-[#0F0F12]/90 border-white/5' 
                            : 'bg-white/90 border-slate-200'
                    )}
                >
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-4 lg:px-8 py-3"
                    >
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    'p-2 rounded-lg transition-colors lg:hidden touch-target shrink-0',
                                    themeConfig.ghostButton
                                )}
                                onClick={onToggleSidebar}
                                aria-label="Toggle sidebar"
                            >
                                <Menu size={24} />
                            </motion.button>
                            
                            {/* Mobile Theme Switcher */}
                            <div className="lg:hidden">
                                <ThemeSwitcher isInline />
                            </div>

                            <div className="flex-1 lg:flex-none">
                                <ProgressBar stats={stats} />
                            </div>
                        </div>
                        
                        {/* Search Input */}
                        <div className="relative w-full lg:w-[300px] shrink-0">
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
                                    'w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all duration-300',
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
                                'absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-xs',
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
                </header>

                {/* Main Content - Scrollable Area */}
                <main 
                    id="kanban-scroll-container"
                    className={cn(
                        "flex-1 w-full relative overscroll-y-contain",
                        // SCROLL LOCK LOGIC: Disable native scroll during drag to prevent interference
                        isDragging ? "overflow-hidden touch-none" : "overflow-y-auto overflow-x-hidden lg:overflow-y-hidden lg:overflow-x-auto"
                    )}
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <div className="flex flex-col min-h-full px-4 lg:px-8 py-6 pb-32 lg:pb-6">
                        {/* Columns Grid */}
                        <div className={cn(
                            'flex gap-4 lg:gap-6',
                            'flex-col', // Mobile: Vertical
                            'lg:flex-row lg:items-start', // Desktop: Horizontal
                        )}>
                            <SortableContext items={columnIds} strategy={sortableStrategy}>
                                <AnimatePresence mode="popLayout">
                                    {columns.map((col) => (
                                        <motion.div
                                            key={col.id}
                                            variants={staggerItem}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="w-full lg:w-[350px] shrink-0"
                                        >
                                            <ColumnContainer
                                                column={col}
                                                tasks={tasksByColumn[col.id] || []}
                                                activeTask={activeTask}
                                                createTask={createTask}
                                                updateTask={updateTask}
                                                deleteTask={deleteTask}
                                                updateColumn={updateColumn}
                                                deleteColumn={deleteColumn}
                                                activeColumn={activeColumn}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </SortableContext>

                            {/* Add Column Button */}
                            <motion.button
                                layout
                                onClick={() => createColumn()}
                                className={cn(
                                    "min-w-full lg:min-w-[350px] lg:w-[350px] h-[60px] lg:h-auto lg:self-stretch rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0 mb-32 lg:mb-0",
                                    isDark 
                                        ? "border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white" 
                                        : "border-slate-300/50 hover:border-slate-400/80 bg-white/40 hover:bg-white/60 text-slate-500 hover:text-slate-700 backdrop-blur-sm"
                                )}
                            >
                                <Plus size={24} />
                                <span className="font-medium">Add Column</span>
                            </motion.button>
                        </div>
                    </div>
                </main>

                {/* Column Dock (Mobile Only) - Rendered via Portal */}
                <ColumnDock columns={columns} isDragging={isDragging} addColumn={createColumn} />

                {/* Keyboard Shortcuts Hint (Desktop only) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={cn(
                        'hidden lg:flex items-center gap-4 px-8 py-3 text-xs absolute bottom-6 left-6 pointer-events-none',
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
            </div>

            {/* Global Drag Overlay */}
            <DragOverlay dropAnimation={null} style={{ zIndex: 10000 }}>
                {activeColumn && (
                    <ColumnContainer
                        column={activeColumn}
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
            </DragOverlay>
        </DndContext>
    );
}

export default KanbanBoard;
