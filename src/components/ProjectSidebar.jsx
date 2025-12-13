import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, FolderKanban, Pencil } from "lucide-react";
import { cn } from "../utils";
import { useTheme } from "../contexts/ThemeContext";

function ProjectSidebar({ projects, activeProjectId, onSelectProject, onCreateProject, onDeleteProject, onRenameProject }) {
    const { themeConfig, isDark } = useTheme();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editingName, setEditingName] = useState("");
    const [deletingProject, setDeletingProject] = useState(null);

    const handleCreate = () => {
        if (!newProjectName.trim()) {
            setIsCreating(false);
            return;
        }
        onCreateProject(newProjectName);
        setNewProjectName("");
        setIsCreating(false);
    };

    const handleRename = (id) => {
        if (editingName.trim()) {
            onRenameProject(id, editingName);
        }
        setEditingProjectId(null);
        setEditingName("");
    };

    const handleExport = () => {
        const data = {
            projects,
            activeProjectId,
            columns: {},
            tasks: {}
        };

        // Gather all project data
        projects.forEach(p => {
            const cols = localStorage.getItem(`kanban-columns-${p.id}`);
            const tasks = localStorage.getItem(`kanban-tasks-${p.id}`);
            if (cols) data.columns[p.id] = JSON.parse(cols);
            if (tasks) data.tasks[p.id] = JSON.parse(tasks);
        });

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!data.projects || !Array.isArray(data.projects)) throw new Error("Invalid backup file");

                if (window.confirm("This will overwrite all current data. Continue?")) {
                    // Restore global state
                    localStorage.setItem("kanban-projects", JSON.stringify(data.projects));
                    localStorage.setItem("kanban-active-project", data.activeProjectId || data.projects[0].id);

                    // Restore project specific data
                    Object.keys(data.columns).forEach(pid => {
                        localStorage.setItem(`kanban-columns-${pid}`, JSON.stringify(data.columns[pid]));
                    });
                    Object.keys(data.tasks).forEach(pid => {
                        localStorage.setItem(`kanban-tasks-${pid}`, JSON.stringify(data.tasks[pid]));
                    });

                    window.location.reload();
                }
            } catch (err) {
                alert("Failed to import backup: " + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className={cn(
            "w-[260px] min-w-[260px] flex flex-col h-screen z-20 transition-colors duration-500",
            themeConfig.sidebarBg,
            themeConfig.borderColor
        )}>
            <div className={cn("p-6 flex items-center gap-3", themeConfig.borderColor, "border-b")}>
                <div className={cn(
                    "p-2 rounded-lg",
                    isDark ? "bg-neon-red/10" : "bg-red-100"
                )}>
                    <FolderKanban className={cn(
                        isDark ? "text-neon-red" : "text-red-500"
                    )} size={20} />
                </div>
                <h1 className={cn("font-bold text-lg tracking-wide", themeConfig.textPrimary)}>Projects</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => onSelectProject(project.id)}
                        className={cn(
                            "p-3 rounded-xl cursor-pointer flex justify-between items-center group transition-all duration-200",
                            project.id === activeProjectId
                                ? isDark
                                    ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20 shadow-[0_0_15px_rgba(184,51,255,0.1)]"
                                    : "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm"
                                : cn(
                                    themeConfig.textSecondary,
                                    isDark 
                                        ? "hover:bg-white/5 hover:text-gray-100" 
                                        : "hover:bg-slate-100 hover:text-slate-800",
                                    "border border-transparent"
                                )
                        )}
                    >
                        {editingProjectId === project.id ? (
                            <input
                                autoFocus
                                className={cn(
                                    "bg-transparent border-b outline-none w-full",
                                    isDark ? "border-neon-purple text-white" : "border-purple-500 text-slate-800"
                                )}
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={() => handleRename(project.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename(project.id);
                                    if (e.key === "Escape") setEditingProjectId(null);
                                }}
                            />
                        ) : (
                            <span
                                className="truncate font-medium flex-1"
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProjectId(project.id);
                                    setEditingName(project.name);
                                }}
                            >
                                {project.name}
                            </span>
                        )}

                        {projects.length > 1 && editingProjectId !== project.id && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingProjectId(project.id);
                                        setEditingName(project.name);
                                    }}
                                    className={cn(
                                        "p-1.5 rounded-md transition-colors",
                                        isDark 
                                            ? "hover:bg-white/10 text-gray-400 hover:text-white" 
                                            : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                                    )}
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingProject(project);
                                    }}
                                    className={cn(
                                        "p-1.5 rounded-md transition-colors",
                                        isDark 
                                            ? "hover:bg-neon-red/10 text-gray-400 hover:text-neon-red" 
                                            : "hover:bg-red-100 text-slate-400 hover:text-red-500"
                                    )}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {isCreating ? (
                    <div className="p-2">
                        <input
                            autoFocus
                            className={cn(
                                "w-full rounded-lg p-2 border outline-none transition-shadow",
                                isDark 
                                    ? "bg-black/40 text-white border-neon-purple focus:shadow-[0_0_10px_rgba(184,51,255,0.3)]" 
                                    : "bg-white text-slate-800 border-purple-300 focus:shadow-md focus:border-purple-500"
                            )}
                            placeholder="Project Name"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onBlur={() => setIsCreating(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreate();
                                if (e.key === "Escape") setIsCreating(false);
                            }}
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mt-2 border border-transparent",
                            isDark 
                                ? "text-gray-500 hover:text-neon-purple hover:bg-neon-purple/5 hover:border-neon-purple/20" 
                                : "text-slate-400 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200"
                        )}
                    >
                        <div className={cn(
                            "p-1 rounded-md",
                            isDark ? "bg-white/5" : "bg-slate-100"
                        )}>
                           <Plus size={16} />
                        </div>
                        <span className="font-medium text-sm">New Project</span>
                    </button>
                )}
            </div>

            <div className={cn("p-4 flex gap-2", themeConfig.borderColor, "border-t")}>
                <button
                    onClick={handleExport}
                    className={cn(
                        "flex-1 text-xs py-2.5 rounded-lg transition-colors",
                        themeConfig.buttonBg,
                        themeConfig.buttonHover,
                        themeConfig.textSecondary,
                        themeConfig.borderColor,
                        "border"
                    )}
                >
                    Export
                </button>
                <label className={cn(
                    "flex-1 text-xs py-2.5 rounded-lg transition-colors text-center cursor-pointer",
                    themeConfig.buttonBg,
                    themeConfig.buttonHover,
                    themeConfig.textSecondary,
                    themeConfig.borderColor,
                    "border"
                )}>
                    Import
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
            </div>
            {deletingProject && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setDeletingProject(null)}>
                    <div 
                        className={cn(
                            "w-full max-w-sm rounded-2xl p-6 shadow-2xl border scale-100 animate-in zoom-in-95 duration-200",
                            isDark 
                                ? "bg-[#1A1A1E] border-white/10 text-gray-100" 
                                : "bg-white border-slate-200 text-slate-800"
                        )}
                        onClick={e => e.stopPropagation()}
                    >
                         <h3 className="text-xl font-bold mb-2">Delete Project?</h3>
                         <p className={cn("text-sm mb-6", isDark ? "text-gray-400" : "text-slate-500")}>
                            Are you sure you want to delete <span className="font-bold">"{deletingProject.name}"</span>?
                            This action cannot be undone.
                         </p>
                         <div className="flex gap-3 justify-end">
                             <button 
                                onClick={() => setDeletingProject(null)}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                                    isDark ? "hover:bg-white/10 text-gray-300" : "hover:bg-slate-100 text-slate-600"
                                )}
                             >
                                Cancel
                             </button>
                             <button 
                                onClick={() => {
                                    onDeleteProject(deletingProject.id);
                                    setDeletingProject(null);
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium text-sm text-white shadow-lg transition-all",
                                    "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                                )}
                             >
                                Delete Project
                             </button>
                         </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default ProjectSidebar;
