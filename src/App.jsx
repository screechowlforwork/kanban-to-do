import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanBoard from './components/KanbanBoard';
import ProjectSidebar from './components/ProjectSidebar';
import ThemeSwitcher from './components/ThemeSwitcher';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useProjects, useAppShortcuts } from './hooks';
import { cn } from './utils';

/**
 * Main App Content with all providers applied
 */
function AppContent() {
    const { themeConfig, theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Use projects hook for all project management
    const {
        projects,
        activeProjectId,
        createProject,
        deleteProject,
        renameProject,
        selectProject,
    } = useProjects();

    // Global keyboard shortcuts
    useAppShortcuts({
        onToggleSidebar: () => setIsSidebarOpen(prev => !prev),
        onEscape: () => setIsSidebarOpen(false),
    });

    const handleSelectProject = (id) => {
        selectProject(id);
        setIsSidebarOpen(false);
    };

    // Get inline gradient style for gradient theme
    const getGradientStyle = () => {
        if (theme !== 'gradient') return {};
        // Apply gradient directly via inline style to avoid Tailwind conflicts
        const hour = new Date().getHours();
        let gradient;
        if (hour >= 5 && hour < 10) {
            gradient = 'linear-gradient(to bottom right, #a5b4fc, #c4b5fd, #f9a8d4)'; // morning
        } else if (hour >= 10 && hour < 16) {
            gradient = 'linear-gradient(to bottom right, #67e8f9, #93c5fd, #a5b4fc)'; // day
        } else if (hour >= 16 && hour < 19) {
            gradient = 'linear-gradient(to bottom right, #fb923c, #fb7185, #a855f7)'; // sunset
        } else {
            gradient = 'linear-gradient(to bottom right, #111827, #581c87, #5b21b6)'; // night
        }
        return {
            background: gradient,
            backgroundSize: '400% 400%',
            animation: 'gradient-shift 15s ease infinite',
        };
    };

    return (
        <div
            className={cn(
                'flex w-full overflow-hidden transition-colors duration-500',
                // iOS: Use 100dvh for proper viewport height on iOS Safari
                'h-[100dvh]',
                // iOS: Safe area padding
                'safe-area-padding',
                // Only apply Tailwind background for non-gradient themes
                theme !== 'gradient' && themeConfig.background,
                themeConfig.textPrimary
            )}
            style={{
                ...getGradientStyle(),
                // iOS: Additional fallback for height
                minHeight: '-webkit-fill-available',
            }}
        >
            {/* Sidebar */}
            <ProjectSidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={handleSelectProject}
                onCreateProject={createProject}
                onDeleteProject={deleteProject}
                onRenameProject={renameProject}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 w-full h-full overflow-hidden relative z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeProjectId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                    >
                        <KanbanBoard
                            projectId={activeProjectId}
                            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Theme Switcher */}
            <ThemeSwitcher />
        </div>
    );
}

/**
 * Root App component with providers
 */
function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
