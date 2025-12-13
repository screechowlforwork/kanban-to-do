import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS } from '../lib/constants';

/**
 * Custom hook for global keyboard shortcuts
 * 
 * @param {Object} handlers - map of shortcut keys to handler functions
 * @param {boolean} enabled - whether shortcuts are active
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        // Ignore if user is typing in an input/textarea
        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            // Only allow Escape in inputs
            if (event.key !== 'Escape') return;
        }

        const key = event.key.toLowerCase();
        const handler = handlers[key];

        if (handler) {
            event.preventDefault();
            handler(event);
        }
    }, [handlers, enabled]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Predefined app shortcuts hook
 * 
 * @param {Object} options - shortcut handler options
 */
export function useAppShortcuts({
    onNewTask,
    onSearch,
    onToggleSidebar,
    onToggleTheme,
    onEscape,
}) {
    const handlers = {};

    if (onNewTask) handlers[KEYBOARD_SHORTCUTS.NEW_TASK] = onNewTask;
    if (onSearch) handlers[KEYBOARD_SHORTCUTS.SEARCH] = onSearch;
    if (onToggleSidebar) handlers[KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR] = onToggleSidebar;
    if (onToggleTheme) handlers[KEYBOARD_SHORTCUTS.TOGGLE_THEME] = onToggleTheme;
    if (onEscape) handlers[KEYBOARD_SHORTCUTS.ESCAPE.toLowerCase()] = onEscape;

    useKeyboardShortcuts(handlers);
}
