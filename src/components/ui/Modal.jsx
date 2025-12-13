import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';
import { scaleFade, fadeInOut } from '../../lib/animations';

/**
 * Accessible modal/dialog component with animations
 */
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
}) {
    const { isDark } = useTheme();

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-[95vw] max-h-[95vh]',
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        {...fadeInOut}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeOnOverlayClick ? onClose : undefined}
                        aria-hidden="true"
                    />
                    
                    {/* Modal Content */}
                    <motion.div
                        {...scaleFade}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'modal-title' : undefined}
                        className={cn(
                            'relative w-full rounded-2xl p-6 shadow-2xl border',
                            sizeClasses[size],
                            isDark
                                ? 'bg-[#1A1A1E] border-white/10 text-gray-100'
                                : 'bg-white border-slate-200 text-slate-800'
                        )}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between mb-4">
                                {title && (
                                    <h2
                                        id="modal-title"
                                        className="text-xl font-bold"
                                    >
                                        {title}
                                    </h2>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className={cn(
                                            'p-2 rounded-lg transition-colors ml-auto',
                                            isDark
                                                ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                                                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                                        )}
                                        aria-label="Close"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Content */}
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

/**
 * Confirmation dialog with actions
 */
export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
}) {
    const { isDark } = useTheme();

    const variantStyles = {
        danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
        warning: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
        primary: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className={cn('text-sm mb-6', isDark ? 'text-gray-400' : 'text-slate-500')}>
                {message}
            </p>
            <div className="flex gap-3 justify-end">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className={cn(
                        'px-4 py-2.5 rounded-lg font-medium text-sm transition-colors',
                        isDark
                            ? 'hover:bg-white/10 text-gray-300'
                            : 'hover:bg-slate-100 text-slate-600'
                    )}
                >
                    {cancelText}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={cn(
                        'px-4 py-2.5 rounded-lg font-medium text-sm text-white shadow-lg transition-all',
                        variantStyles[variant]
                    )}
                >
                    {confirmText}
                </motion.button>
            </div>
        </Modal>
    );
}

export default Modal;
