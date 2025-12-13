import { useState, useEffect } from "react";
import KanbanBoard from './components/KanbanBoard'
import ProjectSidebar from './components/ProjectSidebar'
import ThemeSwitcher from './components/ThemeSwitcher'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { v4 as uuidv4 } from "uuid";
import { safeJSONParse, cn } from "./utils";

const DEFAULT_PROJECTS = [
    { id: "default", name: "Default Project" }
];

function AppContent() {
    const { themeConfig, theme } = useTheme();
    
    const [projects, setProjects] = useState(() => {
        const parsed = safeJSONParse("kanban-projects", DEFAULT_PROJECTS);
        return Array.isArray(parsed) ? parsed : DEFAULT_PROJECTS;
    });

    const [activeProjectId, setActiveProjectId] = useState(() => {
        const saved = localStorage.getItem("kanban-active-project");
        // Ensure active project exists
        const projectExists = projects?.find(p => p.id === saved);
        return projectExists ? saved : projects?.[0]?.id || "default";
    });

    useEffect(() => {
        localStorage.setItem("kanban-projects", JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem("kanban-active-project", activeProjectId);
    }, [activeProjectId]);

    const handleCreateProject = (name) => {
        const newProject = {
            id: uuidv4(),
            name
        };
        setProjects([...projects, newProject]);
        setActiveProjectId(newProject.id);
    };

    const handleDeleteProject = (id) => {
        const newProjects = projects.filter(p => p.id !== id);
        setProjects(newProjects);
        if (activeProjectId === id) {
            setActiveProjectId(newProjects[0]?.id || "");
        }
        // Optional: Clean up localStorage for that project
        localStorage.removeItem(`kanban-columns-${id}`);
        localStorage.removeItem(`kanban-tasks-${id}`);
    };

    const handleRenameProject = (id, newName) => {
        const newProjects = projects.map(p => {
            if (p.id === id) return { ...p, name: newName };
            return p;
        });
        setProjects(newProjects);
    };

    return (
        <div className={cn(
            "flex h-screen w-full overflow-hidden transition-colors duration-500 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
            themeConfig.background,
            themeConfig.textPrimary,
            theme === "gradient" && "animate-gradient-slow"
        )}>
            <ProjectSidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={setActiveProjectId}
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
                onRenameProject={handleRenameProject}
            />
            <main className="flex-1 h-full overflow-hidden relative">
                <KanbanBoard key={activeProjectId} projectId={activeProjectId} />
            </main>
            <ThemeSwitcher />
        </div>
    )
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App
