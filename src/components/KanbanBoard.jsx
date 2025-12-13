import { useMemo, useState, useEffect, useRef } from "react";
import { Plus, Menu } from "lucide-react";
import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    pointerWithin,
    MeasuringStrategy,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";
import ProgressBar from "./ProgressBar";
import { v4 as uuidv4 } from "uuid";
import { safeJSONParse, cn } from "../utils";
import { TASK_COLORS, getRandomColor } from "../constants";
import { useTheme } from "../contexts/ThemeContext";

const defaultCols = [
    {
        id: "todo",
        title: "Todo",
    },
    {
        id: "doing",
        title: "In Progress",
    },
    {
        id: "done",
        title: "Done",
    },
];

const defaultTasks = [
    {
        id: "1",
        columnId: "todo",
        title: "Admin APIs",
        content: "List admin APIs for dashboard",
        color: TASK_COLORS.yellow,
        priority: "High",
    },
    {
        id: "2",
        columnId: "todo",
        title: "User Registration",
        content: "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation",
        color: TASK_COLORS.green,
        priority: "High",
    },
    {
        id: "3",
        columnId: "doing",
        title: "Security Testing",
        content: "Conduct security testing",
        color: TASK_COLORS.blue,
        priority: "High",
    },
    {
        id: "4",
        columnId: "doing",
        title: "Competitor Analysis",
        content: "Analyze competitors",
        color: TASK_COLORS.pink,
        priority: "Medium",
    },
    {
        id: "5",
        columnId: "done",
        title: "UI Kit Docs",
        content: "Create UI kit documentation",
        color: TASK_COLORS.orange,
        priority: "Low",
    },
    {
        id: "6",
        columnId: "done",
        title: "Meeting",
        content: "Dev meeting",
        color: TASK_COLORS.purple,
        priority: "Medium",
    },
    {
        id: "7",
        columnId: "done",
        title: "Dashboard Prototype",
        content: "Deliver dashboard prototype",
        color: TASK_COLORS.yellow,
        priority: "High",
    },
    {
        id: "8",
        columnId: "todo",
        title: "Performance",
        content: "Optimize application performance",
        color: TASK_COLORS.green,
        priority: "Medium",
    },
    {
        id: "9",
        columnId: "todo",
        title: "Data Validation",
        content: "Implement data validation",
        color: TASK_COLORS.blue,
        priority: "Medium",
    },
    {
        id: "10",
        columnId: "todo",
        title: "DB Schema",
        content: "Design database schema",
        color: TASK_COLORS.pink,
        priority: "High",
    },
    {
        id: "11",
        columnId: "todo",
        title: "SSL Certs",
        content: "Integrate SSL web certificates into workflow",
        color: TASK_COLORS.orange,
        priority: "Low",
    },
    {
        id: "12",
        columnId: "doing",
        title: "Logging",
        content: "Implement error logging and monitoring",
        color: TASK_COLORS.purple,
        priority: "Medium",
    },
    {
        id: "13",
        columnId: "doing",
        title: "Responsive UI",
        content: "Design and implement responsive UI",
        color: TASK_COLORS.yellow,
        priority: "High",
    },
];

function KanbanBoard({ projectId, onToggleSidebar }) {
    const { themeConfig, isDark, theme } = useTheme();
    const [columns, setColumns] = useState(() => {
        const saved = safeJSONParse(`kanban-columns-${projectId}`, null);
        if (Array.isArray(saved)) return saved;

        // Migration for default project
        if (projectId === "default") {
            const legacy = safeJSONParse("kanban-columns", null);
            if (Array.isArray(legacy)) return legacy;
        }

        return defaultCols;
    });

    const [tasks, setTasks] = useState(() => {
        const saved = safeJSONParse(`kanban-tasks-${projectId}`, null);
        if (Array.isArray(saved)) return saved;

        // Migration for default project
        if (projectId === "default") {
            const legacy = safeJSONParse("kanban-tasks", null);
            if (Array.isArray(legacy)) return legacy;
            return defaultTasks;
        }

        return [];
    });

    const columnsId = columns.map((col) => col.id);

    const [activeColumn, setActiveColumn] = useState(null);
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    // Measuring configuration for smoother drag calculations
    const measuringConfig = {
        droppable: {
            strategy: MeasuringStrategy.Always,
        },
    };
    
    // Track if we should fire confetti (set in onDragOver, fired in onDragEnd)
    const shouldFireConfetti = useRef(false);

    // Celebration confetti effect
    const triggerConfetti = () => {
        // First burst
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF3366', '#33E1FF', '#33FF99', '#B833FF', '#FFD700'],
            disableForReducedMotion: true,
        });
        // Second burst for more impact
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FF3366', '#33E1FF', '#33FF99', '#B833FF'],
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FF3366', '#33E1FF', '#33FF99', '#B833FF'],
            });
        }, 150);
    };

    useEffect(() => {
        localStorage.setItem(`kanban-columns-${projectId}`, JSON.stringify(columns));
    }, [columns, projectId]);

    useEffect(() => {
        localStorage.setItem(`kanban-tasks-${projectId}`, JSON.stringify(tasks));
    }, [tasks, projectId]);

    const [searchQuery, setSearchQuery] = useState("");

    const filteredTasks = useMemo(() => {
        if (!searchQuery) return tasks;
        return tasks.filter(
            (task) =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tasks, searchQuery]);

    const tasksByColumn = useMemo(() => {
        const groups = {};
        columns.forEach(col => { groups[col.id] = []; });
        filteredTasks.forEach(task => {
            if (groups[task.columnId]) {
                groups[task.columnId].push(task);
            } else {
                // Handle tasks that might belong to deleted columns or initial state quirks
                // by skipping them or putting them in a default
            }
        });
        return groups;
    }, [filteredTasks, columns]);

    function createTask(columnId) {
        const newTask = {
            id: uuidv4(),
            columnId,
            title: `Task ${tasks.length + 1}`,
            content: "",
            color: getRandomColor(),
            priority: "Medium",
        };
        setTasks([...tasks, newTask]);
    }

    function deleteTask(id) {
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
    }

    function updateTask(id, updates) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, ...updates };
        });
        setTasks(newTasks);
    }

    function createNewColumn() {
        const columnToAdd = {
            id: uuidv4(),
            title: `Column ${columns.length + 1}`,
        };
        setColumns([...columns, columnToAdd]);
    }

    function deleteColumn(id) {
        const filteredColumns = columns.filter((col) => col.id !== id);
        setColumns(filteredColumns);

        const newTasks = tasks.filter((t) => t.columnId !== id);
        setTasks(newTasks);
    }

    function updateColumn(id, title) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });
        setColumns(newColumns);
    }

    function onDragStart(event) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(10);
        }
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function onDragEnd(event) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([10, 30, 10]);
        }
        setActiveColumn(null);
        setActiveTask(null);

        // Fire confetti if a task was just moved to done
        if (shouldFireConfetti.current) {
            triggerConfetti();
            shouldFireConfetti.current = false;
        }

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        // Task Sorting (Same Column) - Finalize order here
        if (isActiveTask && isOverTask && activeId !== overId) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);
                if (activeIndex !== -1 && overIndex !== -1 && tasks[activeIndex].columnId === tasks[overIndex].columnId) {
                    return arrayMove(tasks, activeIndex, overIndex);
                }
                return tasks;
            });
        }

        const isActiveColumn = active.data.current?.type === "Column";
        if (!isActiveColumn) return;

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
            const overColumnIndex = columns.findIndex((col) => col.id === overId);
            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }

    function onDragOver(event) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;
        
        // Get the task being dragged
        const activeTask = active.data.current?.task;
        const wasInDone = activeTask?.columnId === "done";

        // Im dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            const overTask = over.data.current?.task;
            const targetColumnId = overTask?.columnId;
            
            // Check if moving TO done from somewhere else
            if (!wasInDone && targetColumnId === "done") {
                shouldFireConfetti.current = true;
            }
            
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (activeIndex === -1 || overIndex === -1) return tasks;

                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = { ...newTasks[activeIndex], columnId: newTasks[overIndex].columnId };
                    return arrayMove(newTasks, activeIndex, overIndex - 1);
                }

                // Skip re-rendering for same-column moves during drag (handled visually by dnd-kit, committed onDragEnd)
                return tasks; 
            });
        }

        const isOverColumn = over.data.current?.type === "Column";

        // Im dropping a Task over a column
        if (isActiveTask && isOverColumn) {
            // Check if moving TO done from somewhere else
            if (!wasInDone && overId === "done") {
                shouldFireConfetti.current = true;
            }
            
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                if (activeIndex === -1) return tasks;

                const newTasks = [...tasks];
                newTasks[activeIndex].columnId = overId;
                return arrayMove(newTasks, activeIndex, activeIndex);
            });
        }
    }

    return (
        <div
            className="h-full w-full flex flex-col overflow-hidden"
        >
            <div className="flex-1 min-h-0 w-full flex flex-col p-4 md:p-8 gap-4 md:gap-6">
                {/* Header */}
                <div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                    <div className="flex items-center gap-2 flex-1 w-full">
                        <button
                            className={cn(
                                "md:hidden p-2 rounded-lg transition-colors shrink-0",
                                isDark ? "text-gray-400 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            )}
                            onClick={onToggleSidebar}
                        >
                            <Menu size={24} />
                        </button>
                        <ProgressBar tasks={tasks} />
                    </div>
                    <input
                        className={cn(
                            "p-3 rounded-lg outline-none w-full md:w-[300px] shrink-0 transition-all duration-300",
                            themeConfig.inputBg,
                            isDark 
                                ? "focus:border-neon-purple focus:shadow-[0_0_15px_rgba(184,51,255,0.2)]"
                                : theme === "gradient"
                                    ? "focus:border-white/50 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                    : "focus:border-purple-500 focus:shadow-md focus:ring-1 focus:ring-purple-200"
                        )}
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <DndContext
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    measuring={measuringConfig}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                >
                    <div className="flex-1 min-h-0 flex flex-row overflow-x-auto overflow-y-hidden gap-4 px-2 md:px-0 items-stretch no-scrollbar">
                        <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    tasks={tasksByColumn[col.id] || []}
                                />
                            ))}
                        </SortableContext>
                        
                        <button
                            onClick={() => {
                                createNewColumn();
                            }}
                            className={cn(
                                "h-[60px] min-w-[85vw] md:min-w-[350px] md:w-[350px] shrink-0 snap-center cursor-pointer rounded-xl p-4 flex gap-2 items-center justify-center self-start",
                                "border-2 border-dashed transition-all",
                                isDark
                                    ? "bg-white/5 border-white/10 hover:border-gray-500 text-gray-500 hover:text-white hover:bg-white/10"
                                    : "bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            <Plus />
                            Add Column
                        </button>
                    </div>

                    {createPortal(
                        <DragOverlay
                            dropAnimation={{
                                duration: 200,
                                easing: 'ease-out',
                            }}
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
                                <div 
                                    className="rotate-2 scale-105"
                                    style={{
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <TaskCard
                                        task={activeTask}
                                        deleteTask={deleteTask}
                                        updateTask={updateTask}
                                    />
                                </div>
                            )}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </div>
    );
}

export default KanbanBoard;
