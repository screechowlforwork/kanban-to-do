import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "../utils";
import { useTheme } from "../contexts/ThemeContext";

const COLUMN_THEMES_DARK = {
    todo: {
        borderColor: "border-gray-600",
        textColor: "text-gray-400",
        underline: "decoration-gray-600",
        glow: "shadow-[0_0_15px_rgba(75,85,99,0.3)]"
    },
    doing: {
        borderColor: "border-neon-blue",
        textColor: "text-neon-blue",
        underline: "decoration-neon-blue",
        glow: "shadow-[0_0_15px_rgba(51,225,255,0.3)]"
    },
    done: {
        borderColor: "border-neon-green",
        textColor: "text-neon-green",
        underline: "decoration-neon-green",
        glow: "shadow-[0_0_15px_rgba(51,255,153,0.3)]"
    },
    default: {
        borderColor: "border-neon-purple",
        textColor: "text-neon-purple",
        underline: "decoration-neon-purple",
        glow: "shadow-[0_0_15px_rgba(184,51,255,0.3)]"
    }
};

const COLUMN_THEMES_LIGHT = {
    todo: {
        borderColor: "border-slate-400",
        textColor: "text-slate-600",
        underline: "decoration-slate-400",
        glow: ""
    },
    doing: {
        borderColor: "border-blue-500",
        textColor: "text-blue-600",
        underline: "decoration-blue-500",
        glow: ""
    },
    done: {
        borderColor: "border-green-500",
        textColor: "text-green-600",
        underline: "decoration-green-500",
        glow: ""
    },
    default: {
        borderColor: "border-purple-500",
        textColor: "text-purple-600",
        underline: "decoration-purple-500",
        glow: ""
    }
};

function ColumnContainer({
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
}) {
    const { isDark, theme: appTheme } = useTheme();
    const [editMode, setEditMode] = useState(false);

    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };
    
    // Determine theme based on ID and dark/light mode
    const COLUMN_THEMES = isDark ? COLUMN_THEMES_DARK : COLUMN_THEMES_LIGHT;
    const theme = COLUMN_THEMES[column.id] || COLUMN_THEMES.default;

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "min-w-[85vw] md:min-w-[350px] md:w-[350px] h-[500px] max-h-[80vh] rounded-xl flex flex-col opacity-60",
                    "border-2 border-dashed border-gray-600 bg-black/20"
                )}
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "min-w-[85vw] max-w-[85vw] md:max-w-none md:min-w-[350px] md:w-[350px] snap-center shrink-0 h-[500px] max-h-[80vh] rounded-xl flex flex-col",
                "transition-colors duration-200"
            )}
        >
            {/* Column Header */}
            <div
                {...attributes}
                {...listeners}
                onClick={() => setEditMode(true)}
                className={cn(
                    "h-[60px] cursor-grab rounded-t-xl p-4 flex items-center justify-between",
                    "group transition-colors duration-500",
                    isDark 
                        ? "bg-[#0F0F12]/50 backdrop-blur-sm border-b border-white/5" 
                        : "bg-white/80 backdrop-blur-sm border-b border-slate-200"
                )}
            >
                <div className="flex gap-3 items-center">
                    <div className={cn(
                        "flex justify-center items-center px-2 py-0.5 text-xs rounded-full font-bold",
                        isDark ? "bg-white/5" : "bg-slate-100",
                        theme.textColor
                    )}>
                        {tasks.length}
                    </div>
                    
                    {!editMode && (
                        <h2 className={cn(
                            "font-bold text-lg tracking-wide border-b-2 border-transparent pb-0.5 transition-all",
                            theme.textColor,
                            // "hover:border-current"
                        )}>
                            {column.title}
                        </h2>
                    )}
                    
                    {editMode && (
                        <input
                            className={cn(
                                "bg-black/50 focus:border-neon-purple border border-white/10 rounded outline-none px-2 py-1 text-white text-base md:text-sm",
                            )}
                            value={column.title}
                            onChange={(e) => updateColumn(column.id, e.target.value)}
                            autoFocus
                            onBlur={() => setEditMode(false)}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                setEditMode(false);
                            }}
                        />
                    )}
                </div>
                
                <button
                    onClick={() => deleteColumn(column.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500 rounded p-1 hover:bg-white/5"
                >
                    <Trash2 size={18} />
                </button>
            </div>
            
            {/* Decorative Line under header (Neon Glow effect) */}
            <div className={cn("h-[2px] w-full mt-1", theme.borderColor.replace('border-', 'bg-'), theme.glow)}></div>

            {/* Column Task Container */}
            <div className={cn(
                "flex flex-grow flex-col gap-4 p-3 overflow-x-hidden overflow-y-auto",
                 "scrollbar-hide hover:scrollbar-default" // Helper classes if available or custom css
                 // We added custom scrollbar in global css so it should be fine
            )}>
                <SortableContext items={tasksIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    ))}
                    {tasks.length === 0 && !isOver && (
                         <div className={cn(
                             "flex flex-col items-center justify-center p-8 mt-4 border border-dashed rounded-xl text-sm",
                             isDark 
                                 ? "border-white/10 bg-white/5 text-gray-500" 
                                 : "border-slate-300 bg-slate-50 text-slate-400"
                         )}>
                             <p>Drop items here</p>
                        </div>
                    )}
                </SortableContext>
            </div>

            {/* Column Footer / Add Button */}
            <div className="p-3 pt-0">
                <button
                    className={cn(
                        "flex gap-2 items-center justify-center w-full py-3 rounded-lg",
                        "border border-dashed transition-all duration-200 bg-transparent",
                        "font-medium text-sm",
                        appTheme === "gradient"
                            ? "border-white/40 text-white/60 hover:bg-white/10 hover:text-white"
                            : isDark
                                ? "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                                : "border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                    )}
                    onClick={() => createTask(column.id)}
                >
                    <Plus size={18} />
                    Add Task
                </button>
            </div>
        </div>
    );
}

export default ColumnContainer;
