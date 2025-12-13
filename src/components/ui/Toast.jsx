import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';
import { toastAnimation } from '../../lib/animations';

// Toast types configuration
const TOAST_TYPES = {
    success: {
        icon: CheckCircle,
        colors: {
            dark: 'bg-neon-green/10 border-neon-green/30 text-neon-green',
            light: 'bg-green-50 border-green-200 text-green-600'
        }
    },
    error: {
        icon: AlertCircle,
        colors: {
            dark: 'bg-neon-red/10 border-neon-red/30 text-neon-red',
            light: 'bg-red-50 border-red-200 text-red-600'
        }
    },
    info: {
        icon: Info,
        colors: {
            dark: 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue',
            light: 'bg-blue-50 border-blue-200 text-blue-600'
        }
    }
};

/**
 * Single toast notification
 */
export function Toast({ id, type = 'info', message, onDismiss, duration = 4000 }) {
    const { isDark } = useTheme();
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const Icon = config.icon;
    const colorClass = isDark ? config.colors.dark : config.colors.light;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => onDismiss(id), duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onDismiss]);

    return (
        <motion.div
            layout
            {...toastAnimation}
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg min-w-[280px] max-w-[400px]',
                colorClass
            )}
        >
            <Icon size={20} className="shrink-0" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => onDismiss(id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

/**
 * Toast container that renders toasts via portal
 */
export function ToastContainer({ toasts, onDismiss }) {
    return createPortal(
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-[calc(1.5rem+env(safe-area-inset-right))] z-[9999] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>,
        document.body
    );
}

/**
 * Hook for managing toast notifications
 */
let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const success = (message, duration) => addToast(message, 'success', duration);
    const error = (message, duration) => addToast(message, 'error', duration);
    const info = (message, duration) => addToast(message, 'info', duration);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        ToastContainer: () => <ToastContainer toasts={toasts} onDismiss={removeToast} />
    };
}

export default Toast;
