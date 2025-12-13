import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_PROJECT } from '../lib/constants';
import { STORAGE_KEYS, removeFromStorage } from '../lib/storage';

/**
 * Custom hook for managing projects
 * Handles project CRUD operations and active project selection
 * 
 * @returns {Object} project management API
 */
export function useProjects() {
    const [projects, setProjects] = useLocalStorage(
        STORAGE_KEYS.PROJECTS, 
        [DEFAULT_PROJECT]
    );
    
    const [activeProjectId, setActiveProjectId] = useLocalStorage(
        STORAGE_KEYS.ACTIVE_PROJECT,
        DEFAULT_PROJECT.id
    );

    // Validate and fix active project if needed
    useEffect(() => {
        const projectExists = projects.some(p => p.id === activeProjectId);
        if (!projectExists && projects.length > 0) {
            setActiveProjectId(projects[0].id);
        }
    }, [projects, activeProjectId, setActiveProjectId]);

    // Get active project object
    const activeProject = useMemo(() => 
        projects.find(p => p.id === activeProjectId) || projects[0],
        [projects, activeProjectId]
    );

    // Create new project
    const createProject = useCallback((name) => {
        const newProject = {
            id: uuidv4(),
            name: name.trim() || 'Untitled Project',
            createdAt: new Date().toISOString(),
        };
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
        return newProject;
    }, [setProjects, setActiveProjectId]);

    // Delete project
    const deleteProject = useCallback((id) => {
        if (projects.length <= 1) {
            console.warn('[useProjects] Cannot delete last project');
            return false;
        }

        setProjects(prev => prev.filter(p => p.id !== id));
        
        // Clean up project data
        removeFromStorage(STORAGE_KEYS.COLUMNS(id));
        removeFromStorage(STORAGE_KEYS.TASKS(id));

        // Switch to another project if active was deleted
        if (activeProjectId === id) {
            const remaining = projects.filter(p => p.id !== id);
            setActiveProjectId(remaining[0]?.id || '');
        }

        return true;
    }, [projects, activeProjectId, setProjects, setActiveProjectId]);

    // Rename project
    const renameProject = useCallback((id, newName) => {
        setProjects(prev => prev.map(p => 
            p.id === id 
                ? { ...p, name: newName.trim() || p.name, updatedAt: new Date().toISOString() }
                : p
        ));
    }, [setProjects]);

    // Select project
    const selectProject = useCallback((id) => {
        if (projects.some(p => p.id === id)) {
            setActiveProjectId(id);
        }
    }, [projects, setActiveProjectId]);

    return {
        projects,
        activeProjectId,
        activeProject,
        createProject,
        deleteProject,
        renameProject,
        selectProject,
        setActiveProjectId,
    };
}
