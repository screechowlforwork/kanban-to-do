import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, CheckCircle } from "lucide-react";
import { cn } from "../utils";
import { useTheme } from "../contexts/ThemeContext";

const PRIORITY_STYLES_DARK = {
    High: {
        line: "bg-neon-red shadow-[0_0_10px_#FF3366]",
        badge: "bg-neon-red/10 text-neon-red border-neon-red/20",
        glow: "hover:shadow-neon-red/50 hover:border-neon-red/50",
    },
    Medium: {
        line: "bg-neon-purple shadow-[0_0_10px_#B833FF]",
        badge: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
        glow: "hover:shadow-neon-purple/50 hover:border-neon-purple/50",
    },
    Low: {
        line: "bg-neon-blue shadow-[0_0_10px_#33E1FF]",
        badge: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
        glow: "hover:shadow-neon-blue/50 hover:border-neon-blue/50",
    },
    default: {
        line: "bg-gray-500",
        badge: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        glow: "hover:shadow-white/20 hover:border-white/30",
    }
};

const PRIORITY_STYLES_LIGHT = {
    High: {
        line: "bg-red-500",
        badge: "bg-red-100 text-red-600 border-red-200",
        glow: "hover:shadow-md hover:border-red-300",
    },
    Medium: {
        line: "bg-purple-500",
        badge: "bg-purple-100 text-purple-600 border-purple-200",
        glow: "hover:shadow-md hover:border-purple-300",
    },
    Low: {
        line: "bg-blue-500",
        badge: "bg-blue-100 text-blue-600 border-blue-200",
        glow: "hover:shadow-md hover:border-blue-300",
    },
    default: {
        line: "bg-gray-400",
        badge: "bg-gray-100 text-gray-600 border-gray-200",
        glow: "hover:shadow-md hover:border-gray-300",
    }
};


function TaskCard({ task, deleteTask, updateTask }) {
    const { themeConfig, isDark } = useTheme();
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [flash, setFlash] = useState(false);
    const prevColumnId = useRef(task.columnId);
    
    // Detect completion (move to done)
    useEffect(() => {
        if (prevColumnId.current !== "done" && task.columnId === "done") {
            setFlash(true);
            const timer = setTimeout(() => setFlash(false), 600);
            return () => clearTimeout(timer);
        }
        prevColumnId.current = task.columnId;
    }, [task.columnId]);

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
            type: "Task",
            task,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
        setMouseIsOver(false);
    };

    const PRIORITY_STYLES = isDark ? PRIORITY_STYLES_DARK : PRIORITY_STYLES_LIGHT;
    const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.default;

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "relative flex flex-col p-4 w-full min-h-[120px] rounded-xl cursor-grab",
                    "bg-[#1A1A1E]/80 backdrop-blur-xl border border-white/10",
                    "shadow-2xl rotate-2 scale-105 z-50 ring-2 ring-neon-purple/50"
                )}
            >
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-200">{task.title}</h3>
                </div>
            </div>
        );
    }

    if (editMode) {
        // In edit mode, we do NOT attach drag listeners to allow full interaction
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                // Don't spread listeners here - allows select/input to work
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "relative flex flex-col p-4 w-full min-h-[120px] rounded-xl cursor-default",
                    "bg-[#1A1A1E] border border-neon-purple/50 shadow-lg"
                )}
            >
                 <div className="flex justify-between items-center mb-3 gap-2">
                    <select
                        className="bg-white/10 text-gray-100 text-xs rounded px-2 py-1 border border-white/20 outline-none cursor-pointer appearance-none pr-6"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                        value={task.priority || "Medium"}
                        onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <button
                        onClick={() => setEditMode(false)}
                        className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10"
                    >
                        Done
                    </button>
                </div>

                <input
                    className="bg-transparent text-gray-100 font-semibold text-lg mb-2 outline-none placeholder:text-gray-600 w-full"
                    value={task.title}
                    autoFocus
                    placeholder="Title"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            setEditMode(false);
                        }
                        if (e.key === "Escape") {
                            setEditMode(false);
                        }
                    }}
                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                />
                
                <textarea
                    className="bg-transparent text-gray-400 text-sm resize-none outline-none h-full min-h-[60px] placeholder:text-gray-700 w-full"
                    value={task.content}
                    placeholder="Details..."
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setEditMode(false);
                        }
                    }}
                    onChange={(e) => updateTask(task.id, { content: e.target.value })}
                />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={toggleEditMode}
            onMouseEnter={() => setMouseIsOver(true)}
            onMouseLeave={() => {
                setMouseIsOver(false);
                setIsDeleting(false);
            }}
            className={cn(
                "group relative flex flex-col p-4 w-full min-h-[120px] rounded-xl cursor-grab",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:scale-[1.02]",
                isDark 
                    ? "bg-white/5 backdrop-blur-md border border-white/5" 
                    : "bg-white border border-slate-200 shadow-sm",
                pStyle.glow,
                flash && (isDark 
                    ? "animate-pulse ring-2 ring-neon-green shadow-[0_0_30px_rgba(50,255,150,0.5)] bg-neon-green/10"
                    : "animate-pulse ring-2 ring-green-400 shadow-lg bg-green-50")
            )}
        >
            {/* Priority Line */}
            <div className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-colors", pStyle.line)} />

            <div className="flex justify-between items-start mb-3 pl-2">
                <h3 className={cn("font-medium leading-snug pr-6 text-[15px]", themeConfig.textPrimary)}>
                    {task.title}
                </h3>
                {task.priority && (
                    <span className={cn(
                        "text-[10px] px-2 py-1 rounded-full font-medium border uppercase tracking-wider",
                        pStyle.badge
                    )}>
                        {task.priority}
                    </span>
                )}
            </div>

            <div className="pl-2 mt-auto">
                 <p className={cn("text-sm line-clamp-3 leading-relaxed font-light whitespace-pre-wrap", themeConfig.textSecondary)}>
                    {task.content}
                </p>
            </div>

            {/* Actions */}
            {mouseIsOver && (
                <div className="absolute right-2 top-2 z-10 fade-in zoom-in duration-200">
                    {isDeleting ? (
                       <div className="flex gap-2 p-1 bg-black/50 rounded-lg backdrop-blur-sm border border-red-500/30">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="text-red-400 hover:text-white text-xs font-bold px-2"
                            >
                                Delete
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDeleting(false);
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-white text-xs px-2"
                            >
                                Cancel
                            </button>
                       </div> 
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleting(true);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )}
            
            {/* Completion Feedback Overlay */}
            {flash && (
                <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-300">
                    <div className="bg-neon-green/20 p-3 rounded-full shadow-[0_0_20px_rgba(51,255,153,0.5)] animate-in zoom-in duration-300">
                        <CheckCircle size={32} className="text-neon-green" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskCard;
