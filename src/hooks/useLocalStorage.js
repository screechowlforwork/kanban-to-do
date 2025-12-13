import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for syncing state with localStorage
 * Provides automatic persistence with optimistic updates
 * 
 * @param {string} key - localStorage key
 * @param {*} initialValue - initial/fallback value
 * @returns {[*, Function, Function]} - [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
    // Get initial value from localStorage or use fallback
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`[useLocalStorage] Error reading "${key}":`, error);
            return initialValue;
        }
    });

    // Persist to localStorage whenever value changes
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`[useLocalStorage] Error saving "${key}":`, error);
        }
    }, [key, storedValue]);

    // Update state and localStorage
    const setValue = useCallback((value) => {
        setStoredValue(prev => {
            const newValue = typeof value === 'function' ? value(prev) : value;
            return newValue;
        });
    }, []);

    // Remove from localStorage
    const removeValue = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`[useLocalStorage] Error removing "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing project-specific data with automatic key generation
 * 
 * @param {string} projectId - current project ID
 * @param {string} dataType - 'columns' or 'tasks'
 * @param {*} defaultValue - default value
 * @returns {[*, Function]} - [value, setValue]
 */
export function useProjectStorage(projectId, dataType, defaultValue) {
    const key = `kanban-${dataType}-${projectId}`;
    return useLocalStorage(key, defaultValue);
}
