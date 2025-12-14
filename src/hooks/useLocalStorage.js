import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for syncing state with localStorage
 * Provides automatic persistence with optimistic updates
 * 
 * @param {string} key - localStorage key
 * @param {*} initialValue - initial/fallback value
 * @returns {[*, Function, Function]} - [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
    // Store initialValue in a ref to avoid re-renders when it changes reference
    const initialValueRef = useRef(initialValue);
    
    // Track previous key to detect changes
    const prevKeyRef = useRef(key);
    
    // Get initial value from localStorage or use fallback
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : initialValueRef.current;
        } catch (error) {
            console.warn(`[useLocalStorage] Error reading "${key}":`, error);
            return initialValueRef.current;
        }
    });

    // Re-read from localStorage ONLY when key actually changes
    useEffect(() => {
        if (prevKeyRef.current !== key) {
            prevKeyRef.current = key;
            try {
                const item = localStorage.getItem(key);
                const newValue = item !== null ? JSON.parse(item) : initialValueRef.current;
                setStoredValue(newValue);
            } catch (error) {
                console.warn(`[useLocalStorage] Error reading "${key}":`, error);
                setStoredValue(initialValueRef.current);
            }
        }
    }, [key]);

    // Persist to localStorage whenever value changes
    // Use a ref to track the current key to avoid stale writes
    const keyRef = useRef(key);
    useEffect(() => {
        keyRef.current = key;
    }, [key]);

    useEffect(() => {
        try {
            localStorage.setItem(keyRef.current, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`[useLocalStorage] Error saving "${keyRef.current}":`, error);
        }
    }, [storedValue]);

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
            setStoredValue(initialValueRef.current);
        } catch (error) {
            console.error(`[useLocalStorage] Error removing "${key}":`, error);
        }
    }, [key]);

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
