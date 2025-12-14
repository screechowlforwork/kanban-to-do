import { createPortal } from 'react-dom';
import { useDroppable } from '@dnd-kit/core';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils';
import { useEffect } from 'react';
import { Circle, Loader2, CheckCircle2, KanbanSquare, Plus } from 'lucide-react';

/**
 * Helper to get icon based on column ID or Title
 */
const getColumnIcon = (column) => {
    const id = column.id;
    
    // Default columns get special icons
    if (id === 'todo') return <Circle size={24} />;
    if (id === 'doing') return <Loader2 size={24} className="animate-spin-slow" />;
    if (id === 'done') return <CheckCircle2 size={24} />;
    
    // Custom columns get initials for better identification
    return <span className="text-sm font-bold tracking-tight">{column.title.slice(0, 2).toUpperCase()}</span>;
};

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

    // RENDER: Navigation Mode
    if (mode === 'nav') {
        return (
            <div 
                onClick={handleNavClick}
                className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform p-1.5 shrink-0"
            >
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all border border-white/5",
                    isDark ? "bg-[#252529] text-gray-400" : "bg-white text-slate-500",
                    "hover:scale-105 active:scale-95"
                )}>
                    {getColumnIcon(column)}
                </div>
            </div>
        );
    }

    // RENDER: Drop Zone Mode (Extended Hit Area)
    return (
        <div
            ref={setNodeRef}
            className={cn(
                'relative flex flex-col items-center justify-end group shrink-0',
                // Extended invisible hit area
                'h-28 -mt-10 w-20', 
                'transition-all duration-200'
            )}
        >
            <div
                className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 border border-white/10 z-10',
                    isOver 
                        ? cn(activeColor, 'scale-125 -translate-y-6 text-white shadow-xl ring-2 ring-white/50', glowColor)
                        : isDark ? 'bg-white/10 text-gray-300' : 'bg-white/20 text-slate-700 backdrop-blur-md'
                )}
            >
                {getColumnIcon(column)}
            </div>
            
            {/* Tooltip Label */}
            <div
                className={cn(
                    'absolute -top-4 bg-black/80 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap transition-opacity duration-200 pointer-events-none',
                    isOver ? 'opacity-100' : 'opacity-0'
                )}
            >
                {column.title}
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
export default function ColumnDock({ columns, isDragging, addColumn }) {
    const { isDark } = useTheme();
    const mode = isDragging ? 'drop' : 'nav';

    // Render via Portal to ensure fixed positioning works correctly
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={cn(
                'fixed z-[9999] transition-all duration-300 lg:hidden flex items-center justify-center gap-2',
                // Safe area padding for notched devices
                'bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 right-4',
                // Mode Switching Styles
                mode === 'drop' 
                    ? cn(
                        'h-28', // Taller for drop zone
                        'rounded-3xl border backdrop-blur-xl shadow-2xl px-4 overflow-x-auto',
                        isDark ? 'bg-[#1A1A1E]/95 border-white/10' : 'bg-black/80 border-white/20'
                    )
                    : cn(
                        'min-h-[5rem] h-auto py-2', // Allow height to grow
                        'rounded-[2rem] border backdrop-blur-xl shadow-xl px-4 shadow-slate-500/10',
                        isDark ? 'bg-[#1A1A1E]/90 border-white/10' : 'bg-white/80 border-white/40' // Crystalline feel
                    )
            )}
        >
            <div className={cn(
                "flex items-center gap-2 w-full max-w-lg mx-auto transition-all",
                mode === 'nav' 
                    ? "flex-wrap justify-center py-1" 
                    : "justify-start overflow-x-auto no-scrollbar"
            )}>
                {columns.map(col => (
                    <DockItem 
                        key={col.id} 
                        column={col} 
                        isDark={isDark}
                        mode={mode}
                    />
                ))}
                
                {/* Add Column Button (Only in Nav Mode) */}
                {mode === 'nav' && addColumn && (
                    <div 
                        onClick={() => addColumn()}
                        className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform p-1.5 shrink-0"
                    >
                         <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all border border-dashed",
                            isDark 
                                ? "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white" 
                                : "bg-white/40 border-slate-300 text-slate-500 hover:bg-white/80 hover:text-slate-700",
                        )}>
                            <Plus size={24} />
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
