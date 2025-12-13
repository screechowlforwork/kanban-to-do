import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme, THEMES } from "../contexts/ThemeContext";
import { cn } from "../utils";

function ThemeSwitcher() {
    const { theme, setTheme, themeConfig } = useTheme();

    const buttons = [
        { id: THEMES.dark, icon: Moon, label: "Dark" },
        { id: THEMES.light, icon: Sun, label: "Light" },
        { id: THEMES.gradient, icon: Sparkles, label: "Dynamic" },
    ];

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-50",
            "flex items-center gap-1 p-1.5 rounded-full",
            "backdrop-blur-xl shadow-lg",
            themeConfig.isDark 
                ? "bg-black/40 border border-white/10" 
                : "bg-white/80 border border-slate-200"
        )}>
            {buttons.map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    onClick={() => setTheme(id)}
                    title={label}
                    className={cn(
                        "p-2.5 rounded-full transition-all duration-300",
                        theme === id
                            ? themeConfig.isDark
                                ? "bg-neon-purple text-white shadow-[0_0_15px_rgba(184,51,255,0.5)]"
                                : "bg-slate-800 text-white shadow-md"
                            : themeConfig.isDark
                                ? "text-gray-400 hover:text-white hover:bg-white/10"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    )}
                >
                    <Icon size={18} />
                </button>
            ))}
        </div>
    );
}

export default ThemeSwitcher;
