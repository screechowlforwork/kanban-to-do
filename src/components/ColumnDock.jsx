import { createPortal } from 'react-dom';
import { useDroppable } from '@dnd-kit/core';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils';
import { useEffect } from 'react';

/**
 * Dock Item Component
 * Morphs between Navigation Link (Idle) and Drop Zone (Dragging)
 */
function DockItem({ column, isDark, mode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `dock-column-${column.id}`,
        data: { type: 'Column', column },
    });

    // Restore Haptic Feedback for Drop
    useEffect(() => {
        if (isOver && navigator.vibrate) {
            navigator.vibrate(20);
        }
    }, [isOver]);

    // Navigation Handler
    const handleNavClick = (e) => {
        if (mode === 'nav') {
            e.preventDefault();
            e.stopPropagation();
            
            const target = document.getElementById(`column-${column.id}`);
            
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (navigator.vibrate) navigator.vibrate(10);
            }
        }
    };

    // Style Calculation
    let activeColor = '';
    let glowColor = '';
    
    // ... [Color logic remains same] ...
    if (column.id === 'todo') {
        activeColor = isDark ? 'bg-gray-600' : 'bg-slate-200';
        glowColor = 'shadow-gray-500/50';
    } else if (column.id === 'doing') {
        activeColor = isDark ? 'bg-neon-blue' : 'bg-blue-500';
        glowColor = 'shadow-blue-500/50';
    } else if (column.id === 'done') {
        activeColor = isDark ? 'bg-neon-green' : 'bg-green-500';
        glowColor = 'shadow-green-500/50';
    } else {
        activeColor = isDark ? 'bg-neon-purple' : 'bg-purple-500';
        glowColor = 'shadow-purple-500/50';
    }

    const shortLabel = column.title.slice(0, 3).toUpperCase();

    // RENDER: Navigation Mode
    if (mode === 'nav') {
        return (
            <div 
                onClick={handleNavClick}
                className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform p-2 w-16"
            >
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors border border-white/5",
                    isDark ? "bg-[#252529] text-gray-300" : "bg-white text-gray-600",
                    // Highlight logic could be added here
                )}>
                    {shortLabel}
                </div>
            </div>
        );
    }

    // RENDER: Drop Zone Mode (Extended Hit Area)
    return (
        <div
            ref={setNodeRef}
            className={cn(
                'relative flex flex-col items-center justify-end group',
                // Extended invisible hit area
                'h-28 -mt-10 w-20', 
                'transition-all duration-200'
            )}
        >
            <div
                className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-200 border border-white/10 z-10',
                    isOver 
                        ? cn(activeColor, 'scale-125 -translate-y-4 text-white shadow-xl ring-2 ring-white/50', glowColor)
                        : isDark ? 'bg-white/10 text-gray-300' : 'bg-white/20 text-white'
                )}
            >
                {shortLabel}
            </div>
            
            {/* Tooltip Label */}
            <div
                className={cn(
                    'absolute -top-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap transition-opacity duration-200',
                    isOver ? 'opacity-100' : 'opacity-0'
                )}
            >
                Move to {column.title}
            </div>
        </div>
    );
}

/**
 * Mobile Navigation & Teleport Dock
 * - Idle: Bottom Navigation Bar to jump between columns
 * - Dragging: Floating Teleport Dock to move tasks
 * - Uses createPortal to escape parent overflow/transform constraints
 */
export default function ColumnDock({ columns, isDragging }) {
    const { isDark } = useTheme();
    const mode = isDragging ? 'drop' : 'nav';

    // Render via Portal to ensure fixed positioning works correctly
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={cn(
                'fixed z-[9999] transition-all duration-300 lg:hidden flex items-center justify-around',
                // Safe area padding for notched devices
                'bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4',
                // Mode Switching Styles
                mode === 'drop' 
                    ? cn(
                        'h-24', // Taller for drop zone
                        'rounded-2xl border backdrop-blur-xl shadow-2xl px-2',
                        isDark ? 'bg-[#1A1A1E]/95 border-white/10' : 'bg-black/80 border-white/20'
                    )
                    : cn(
                        'h-16', // Compact for nav
                        'rounded-full border backdrop-blur-md shadow-lg px-4',
                        isDark ? 'bg-[#1A1A1E]/80 border-white/5' : 'bg-white/80 border-slate-200'
                    )
            )}
        >
            {columns.map(col => (
                <DockItem 
                    key={col.id} 
                    column={col} 
                    isDark={isDark}
                    mode={mode}
                />
            ))}
        </div>,
        document.body
    );
}
