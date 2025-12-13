/**
 * Utility functions for the Kanban app
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * @param {...any} inputs - Class values to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Safely parse JSON from localStorage
 * @param {string} key - localStorage key
 * @param {*} fallback - fallback value if parsing fails
 * @returns {*} parsed value or fallback
 */
export const safeJSONParse = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return fallback;
    }
};

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Generate a unique ID (simpler than UUID for display purposes)
 * @returns {string} Short unique ID
 */
export function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(date));
}

/**
 * Check if device is touch-enabled
 * @returns {boolean}
 */
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if reduced motion is preferred
 * @returns {boolean}
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
