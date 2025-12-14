import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, FolderKanban, Pencil, Upload, Download, X } from 'lucide-react';
import { cn } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import { ConfirmDialog } from './ui';
import { fadeInOut } from '../lib/animations';
import { exportAllData, importData } from '../lib/storage';

/**
 * Project Sidebar component
 */
function ProjectSidebar({
    projects,
    activeProjectId,
    onSelectProject,
    onCreateProject,
    onDeleteProject,
    onRenameProject,
    isOpen,
    onClose
}) {
    const { themeConfig, isDark } = useTheme();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [deletingProject, setDeletingProject] = useState(null);

    const handleCreate = () => {
        if (!newProjectName.trim()) {
            setIsCreating(false);
            return;
        }
        onCreateProject(newProjectName);
        setNewProjectName('');
        setIsCreating(false);
    };

    const handleRename = (id) => {
        if (editingName.trim()) {
            onRenameProject(id, editingName);
        }
        setEditingProjectId(null);
        setEditingName('');
    };

    const handleExport = useCallback(() => {
        const data = exportAllData(projects);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [projects]);

    const handleImport = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (window.confirm('This will overwrite all current data. Continue?')) {
                    if (importData(data)) {
                        window.location.reload();
                    } else {
                        alert('Failed to import backup. Please check the file format.');
                    }
                }
            } catch (err) {
                alert('Failed to import backup: ' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }, []);

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        {...fadeInOut}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{
                    x: isOpen ? 0 : '-100%',
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col',
                    'w-[280px] h-[100dvh]',
                    'lg:relative lg:h-full lg:translate-x-0 lg:!transform-none lg:z-0',
                    'shadow-2xl lg:shadow-none',
                    themeConfig.sidebarBg,
                    themeConfig.borderColor,
                    'border-r'
                )}
            >
                {/* Header */}
                <div className={cn('p-5 flex items-center justify-between', themeConfig.borderColor, 'border-b')}>
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className={cn(
                                'p-2.5 rounded-xl',
                                isDark ? 'bg-gradient-to-br from-neon-red/20 to-neon-purple/20' : 'bg-gradient-to-br from-red-100 to-purple-100'
                            )}
                        >
                            <FolderKanban className={isDark ? 'text-neon-red' : 'text-red-500'} size={20} />
                        </motion.div>
                        <div>
                            <h1 className={cn('font-bold text-lg tracking-wide', themeConfig.textPrimary)}>Projects</h1>
                            <p className={cn('text-xs', themeConfig.textSecondary)}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    
                    {/* Close button (mobile) */}
                    <button
                        onClick={onClose}
                        className={cn(
                            'lg:hidden p-2 rounded-lg transition-colors',
                            isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-500'
                        )}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Project List - iOS scroll isolation */}
                <div className="flex-1 ios-scroll-y p-3 flex flex-col gap-1.5">
                    <AnimatePresence mode="popLayout">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => onSelectProject(project.id)}
                                className={cn(
                                    'p-3 rounded-xl cursor-pointer flex justify-between items-center group transition-all duration-200',
                                    project.id === activeProjectId
                                        ? isDark
                                            ? 'bg-gradient-to-r from-neon-purple/15 to-transparent text-neon-purple border border-neon-purple/20'
                                            : 'bg-gradient-to-r from-purple-100 to-transparent text-purple-700 border border-purple-200'
                                        : cn(
                                            themeConfig.textSecondary,
                                            isDark
                                                ? 'hover:bg-white/5 hover:text-gray-100'
                                                : 'hover:bg-slate-100 hover:text-slate-800',
                                            'border border-transparent'
                                        )
                                )}
                            >
                                {editingProjectId === project.id ? (
                                    <input
                                        autoFocus
                                        className={cn(
                                            'bg-transparent border-b outline-none w-full font-medium',
                                            isDark ? 'border-neon-purple text-white' : 'border-purple-500 text-slate-800'
                                        )}
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        onBlur={() => handleRename(project.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRename(project.id);
                                            if (e.key === 'Escape') setEditingProjectId(null);
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
                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingProjectId(project.id);
                                                setEditingName(project.name);
                                            }}
                                            className={cn(
                                                'p-1.5 rounded-lg transition-colors',
                                                isDark
                                                    ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                                                    : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                                            )}
                                        >
                                            <Pencil size={14} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingProject(project);
                                            }}
                                            className={cn(
                                                'p-1.5 rounded-lg transition-colors',
                                                isDark
                                                    ? 'hover:bg-neon-red/10 text-gray-400 hover:text-neon-red'
                                                    : 'hover:bg-red-100 text-slate-400 hover:text-red-500'
                                            )}
                                        >
                                            <Trash2 size={14} />
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* New Project */}
                    <AnimatePresence mode="wait">
                        {isCreating ? (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-2"
                            >
                                <input
                                    autoFocus
                                    className={cn(
                                        'w-full rounded-lg p-3 border outline-none transition-shadow',
                                        'text-[16px]', // iOS: Prevent zoom on focus
                                        isDark
                                            ? 'bg-white/5 text-white border-neon-purple/30 focus:shadow-[0_0_15px_rgba(184,51,255,0.2)]'
                                            : 'bg-white text-slate-800 border-purple-200 focus:shadow-md focus:border-purple-500'
                                    )}
                                    placeholder="Project name..."
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    onBlur={() => {
                                        if (!newProjectName.trim()) setIsCreating(false);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreate();
                                        if (e.key === 'Escape') setIsCreating(false);
                                    }}
                                />
                            </motion.div>
                        ) : (
                            <motion.button
                                key="button"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setIsCreating(true)}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mt-2',
                                    'border border-dashed',
                                    isDark
                                        ? 'border-white/10 text-gray-500 hover:text-neon-purple hover:border-neon-purple/30 hover:bg-neon-purple/5'
                                        : 'border-slate-200 text-slate-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50'
                                )}
                            >
                                <Plus size={18} />
                                <span className="font-medium text-sm">New Project</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer with Export/Import - iOS safe area bottom */}
                <div className={cn('p-4 flex gap-2 safe-area-bottom', themeConfig.borderColor, 'border-t')}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 text-xs py-2.5 rounded-lg transition-colors',
                            themeConfig.buttonBg,
                            themeConfig.buttonHover,
                            themeConfig.textSecondary,
                            themeConfig.borderColor,
                            'border'
                        )}
                    >
                        <Download size={14} />
                        Export
                    </motion.button>
                    <label className={cn(
                        'flex-1 flex items-center justify-center gap-2 text-xs py-2.5 rounded-lg transition-colors cursor-pointer',
                        themeConfig.buttonBg,
                        themeConfig.buttonHover,
                        themeConfig.textSecondary,
                        themeConfig.borderColor,
                        'border'
                    )}>
                        <Upload size={14} />
                        Import
                        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                    </label>
                </div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deletingProject}
                onClose={() => setDeletingProject(null)}
                onConfirm={() => onDeleteProject(deletingProject?.id)}
                title="Delete Project?"
                message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
                confirmText="Delete Project"
                variant="danger"
            />
        </>
    );
}

export default ProjectSidebar;
