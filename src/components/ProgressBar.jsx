import { cn } from "../utils";
import { useTheme } from "../contexts/ThemeContext";

function ProgressBar({ tasks }) {
    const { themeConfig, isDark } = useTheme();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.columnId === "done").length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="mb-2 flex-1 min-w-[300px]">
            {/* Label */}
            <div className="flex items-center justify-between mb-2">
                <span className={cn(
                    "text-sm font-medium",
                    isDark ? "text-gray-400" : "text-slate-500"
                )}>
                    Project Progress
                </span>
                <span className="text-sm">
                    <span className={cn(
                        "font-bold",
                        themeConfig.textPrimary
                    )}>{percentage}%</span>
                    <span className="text-gray-500 ml-2 text-xs">
                        ({completedTasks}/{totalTasks} tasks)
                    </span>
                </span>
            </div>
            
            {/* Progress Bar Container */}
            <div className={cn(
                "w-full h-2 rounded-full overflow-hidden backdrop-blur-sm",
                isDark ? "bg-gray-700/30" : "bg-slate-200"
            )}>
                {/* Progress Fill */}
                <div
                    className={cn(
                        "h-full rounded-full",
                        isDark 
                            ? "bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red shadow-[0_0_15px_rgba(184,51,255,0.6)]"
                            : "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 shadow-sm",
                        "transition-all duration-700 ease-out"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default ProgressBar;
