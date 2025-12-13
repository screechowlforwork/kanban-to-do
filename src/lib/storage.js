/**
 * Storage utility module for localStorage operations
 * Provides type-safe JSON parsing with fallbacks and error handling
 */

export const STORAGE_KEYS = {
    PROJECTS: 'kanban-projects',
    ACTIVE_PROJECT: 'kanban-active-project',
    THEME: 'kanban-theme',
    COLUMNS: (projectId) => `kanban-columns-${projectId}`,
    TASKS: (projectId) => `kanban-tasks-${projectId}`,
};

/**
 * Safely parse JSON from localStorage
 * @param {string} key - localStorage key
 * @param {*} fallback - fallback value if parsing fails
 * @returns {*} parsed value or fallback
 */
export const getFromStorage = (key, fallback = null) => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return fallback;
        return JSON.parse(item);
    } catch (error) {
        console.warn(`[Storage] Failed to parse "${key}":`, error);
        return fallback;
    }
};

/**
 * Save value to localStorage as JSON
 * @param {string} key - localStorage key
 * @param {*} value - value to save
 */
export const setToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`[Storage] Failed to save "${key}":`, error);
    }
};

/**
 * Remove item from localStorage
 * @param {string} key - localStorage key
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`[Storage] Failed to remove "${key}":`, error);
    }
};

/**
 * Clear all kanban-related data from localStorage
 */
export const clearAllKanbanData = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('kanban-')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => removeFromStorage(key));
};

/**
 * Export all kanban data
 * @returns {Object} all kanban data
 */
export const exportAllData = (projects) => {
    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        projects,
        projectData: {}
    };

    projects.forEach(project => {
        data.projectData[project.id] = {
            columns: getFromStorage(STORAGE_KEYS.COLUMNS(project.id), []),
            tasks: getFromStorage(STORAGE_KEYS.TASKS(project.id), [])
        };
    });

    return data;
};

/**
 * Import kanban data from backup
 * @param {Object} data - backup data object
 * @returns {boolean} success status
 */
export const importData = (data) => {
    try {
        if (!data?.projects || !Array.isArray(data.projects)) {
            throw new Error('Invalid backup format: missing projects array');
        }

        // Save projects
        setToStorage(STORAGE_KEYS.PROJECTS, data.projects);
        
        // Save active project (or default to first)
        const activeId = data.activeProjectId || data.projects[0]?.id;
        if (activeId) {
            setToStorage(STORAGE_KEYS.ACTIVE_PROJECT, activeId);
        }

        // Save project-specific data
        if (data.projectData) {
            Object.entries(data.projectData).forEach(([projectId, projectData]) => {
                if (projectData.columns) {
                    setToStorage(STORAGE_KEYS.COLUMNS(projectId), projectData.columns);
                }
                if (projectData.tasks) {
                    setToStorage(STORAGE_KEYS.TASKS(projectId), projectData.tasks);
                }
            });
        }

        // Legacy format support
        if (data.columns && typeof data.columns === 'object') {
            Object.entries(data.columns).forEach(([projectId, columns]) => {
                setToStorage(STORAGE_KEYS.COLUMNS(projectId), columns);
            });
        }
        if (data.tasks && typeof data.tasks === 'object') {
            Object.entries(data.tasks).forEach(([projectId, tasks]) => {
                setToStorage(STORAGE_KEYS.TASKS(projectId), tasks);
            });
        }

        return true;
    } catch (error) {
        console.error('[Storage] Import failed:', error);
        return false;
    }
};
