import { useState, useCallback, useMemo, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';
import { useProjectStorage } from './useLocalStorage';
import { DEFAULT_COLUMNS, SAMPLE_TASKS, getRandomColor, PRIORITIES, ANIMATION } from '../lib/constants';

/**
 * Triggers celebration confetti animation
 */
const triggerConfetti = () => {
    const colors = ['#FF3366', '#33E1FF', '#33FF99', '#B833FF', '#FFD700'];
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors,
        disableForReducedMotion: true,
    });

    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
        });
    }, ANIMATION.CONFETTI_DELAY);
};

/**
 * Vibrate device if supported
 * @param {number|number[]} pattern - vibration pattern
 */
const vibrate = (pattern) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

/**
 * Custom hook for managing kanban board state
 * Handles columns, tasks, drag and drop, and search
 * 
 * @param {string} projectId - current project ID
 * @returns {Object} kanban board management API
 */
export function useKanban(projectId) {
    // Check if this is a fresh project or has existing data
    const isDefaultProject = projectId === 'default';
    
    // Columns state
    const [columns, setColumns] = useProjectStorage(
        projectId, 
        'columns', 
        isDefaultProject ? DEFAULT_COLUMNS : DEFAULT_COLUMNS
    );
    
    // Tasks state
    const [tasks, setTasks] = useProjectStorage(
        projectId, 
        'tasks', 
        isDefaultProject ? SAMPLE_TASKS : []
    );

    // DnD state
    const [activeColumn, setActiveColumn] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    
    // Confetti trigger ref
    const shouldFireConfetti = useRef(false);

    // Column IDs for DnD context
    const columnIds = useMemo(() => columns.map(col => col.id), [columns]);

    // Filtered tasks based on search
    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return tasks;
        const query = searchQuery.toLowerCase();
        return tasks.filter(task => 
            task.title.toLowerCase().includes(query) ||
            task.content.toLowerCase().includes(query)
        );
    }, [tasks, searchQuery]);

    // Tasks grouped by column
    const tasksByColumn = useMemo(() => {
        const groups = {};
        columns.forEach(col => { groups[col.id] = []; });
        filteredTasks.forEach(task => {
            if (groups[task.columnId]) {
                groups[task.columnId].push(task);
            }
        });
        return groups;
    }, [filteredTasks, columns]);

    // === Column Operations ===
    
    const createColumn = useCallback((title) => {
        const newColumn = {
            id: uuidv4(),
            title: title?.trim() || `Column ${columns.length + 1}`,
        };
        setColumns(prev => [...prev, newColumn]);
        return newColumn;
    }, [columns.length, setColumns]);

    const updateColumn = useCallback((id, title) => {
        setColumns(prev => prev.map(col => 
            col.id === id ? { ...col, title } : col
        ));
    }, [setColumns]);

    const deleteColumn = useCallback((id) => {
        setColumns(prev => prev.filter(col => col.id !== id));
        setTasks(prev => prev.filter(task => task.columnId !== id));
    }, [setColumns, setTasks]);

    // === Task Operations ===

    const createTask = useCallback((columnId, initialData = {}) => {
        const newTask = {
            id: uuidv4(),
            columnId,
            title: initialData.title || `Task ${tasks.length + 1}`,
            content: initialData.content || '',
            color: initialData.color || getRandomColor(),
            priority: initialData.priority || PRIORITIES.MEDIUM,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [...prev, newTask]);
        return newTask;
    }, [tasks.length, setTasks]);

    const updateTask = useCallback((id, updates) => {
        setTasks(prev => prev.map(task => 
            task.id === id 
                ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                : task
        ));
    }, [setTasks]);

    const deleteTask = useCallback((id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    }, [setTasks]);

    const moveTask = useCallback((taskId, targetColumnId) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId 
                ? { ...task, columnId: targetColumnId }
                : task
        ));
    }, [setTasks]);

    // === Drag and Drop Handlers ===

    const handleDragStart = useCallback((event) => {
        vibrate(10);
        
        const { active } = event;
        const type = active.data.current?.type;

        if (type === 'Column') {
            setActiveColumn(active.data.current.column);
        } else if (type === 'Task') {
            setActiveTask(active.data.current.task);
        }
    }, []);

    const handleDragEnd = useCallback((event) => {
        vibrate([10, 30, 10]);
        
        setActiveColumn(null);
        setActiveTask(null);

        // Fire confetti if task was moved to done
        if (shouldFireConfetti.current) {
            triggerConfetti();
            shouldFireConfetti.current = false;
        }

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isActiveColumn = active.data.current?.type === 'Column';

        // Teleport Dock Drop Logic
        if (isActiveTask && String(over.id).startsWith('dock-column-')) {
            const targetColumnId = String(over.id).replace('dock-column-', '');
            const activeTaskId = active.id;

            setTasks(prev => {
                const activeIndex = prev.findIndex(t => t.id === activeTaskId);
                if (activeIndex === -1) return prev;
                // Update column ID
                const newTasks = [...prev];
                newTasks[activeIndex] = { ...newTasks[activeIndex], columnId: targetColumnId };
                
                // Fire confetti if done
                if (targetColumnId === 'done') triggerConfetti();
                
                return newTasks;
            });
            return; // Exit after dock drop
        }

        // Task reordering within same column
        if (isActiveTask && isOverTask) {
            setTasks(prev => {
                const activeIndex = prev.findIndex(t => t.id === active.id);
                const overIndex = prev.findIndex(t => t.id === over.id);
                
                if (activeIndex !== -1 && overIndex !== -1 && 
                    prev[activeIndex].columnId === prev[overIndex].columnId) {
                    return arrayMove(prev, activeIndex, overIndex);
                }
                return prev;
            });
        }

        // Column reordering
        if (isActiveColumn) {
            setColumns(prev => {
                const activeIndex = prev.findIndex(col => col.id === active.id);
                const overIndex = prev.findIndex(col => col.id === over.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    }, [setTasks, setColumns]);

    const handleDragOver = useCallback((event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveTask) return;

        const activeTask = active.data.current?.task;
        const wasInDone = activeTask?.columnId === 'done';

        // Extract actual column ID
        const getActualColumnId = (overId) => {
            const id = String(overId);
            if (id.startsWith('column-drop-')) {
                return id.replace('column-drop-', '');
            }
            return id;
        };
        
        // CRITICAL: Ignore dock drops in DragOver to prevent list jumping
        if (String(over.id).startsWith('dock-column-')) return;

        // Dropping task over another task
        if (isActiveTask && isOverTask) {
            const overTask = over.data.current?.task;
            const targetColumnId = overTask?.columnId;

            // Check if moving TO done
            if (!wasInDone && targetColumnId === 'done') {
                shouldFireConfetti.current = true;
            }

            setTasks(prev => {
                const activeIndex = prev.findIndex(t => t.id === active.id);
                const overIndex = prev.findIndex(t => t.id === over.id);

                if (activeIndex === -1 || overIndex === -1) return prev;

                if (prev[activeIndex].columnId !== prev[overIndex].columnId) {
                    const newTasks = [...prev];
                    newTasks[activeIndex] = { 
                        ...newTasks[activeIndex], 
                        columnId: newTasks[overIndex].columnId 
                    };
                    return arrayMove(newTasks, activeIndex, overIndex - 1);
                }
                return prev;
            });
        }

        // Dropping task over column (empty area or column header)
        if (isActiveTask && isOverColumn) {
            const targetColumnId = getActualColumnId(over.data.current?.column?.id || over.id);
            
            if (!wasInDone && targetColumnId === 'done') {
                shouldFireConfetti.current = true;
            }

            setTasks(prev => {
                const activeIndex = prev.findIndex(t => t.id === active.id);
                if (activeIndex === -1) return prev;
                
                // Only update if actually changing column
                if (prev[activeIndex].columnId === targetColumnId) return prev;

                const newTasks = [...prev];
                newTasks[activeIndex] = { ...newTasks[activeIndex], columnId: targetColumnId };
                return newTasks;
            });
        }
    }, [setTasks]);

    // === Statistics ===

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.columnId === 'done').length;
        const inProgress = tasks.filter(t => t.columnId === 'doing').length;
        const todo = tasks.filter(t => t.columnId === 'todo').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, inProgress, todo, percentage };
    }, [tasks]);

    return {
        // State
        columns,
        tasks,
        filteredTasks,
        tasksByColumn,
        columnIds,
        activeColumn,
        activeTask,
        searchQuery,
        stats,
        
        // Column operations
        createColumn,
        updateColumn,
        deleteColumn,
        
        // Task operations
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        
        // Search
        setSearchQuery,
        
        // DnD handlers
        handleDragStart,
        handleDragEnd,
        handleDragOver,
    };
}
