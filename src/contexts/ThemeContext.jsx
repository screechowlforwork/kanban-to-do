import { createContext, useContext, useState, useEffect, useMemo } from "react";

// Theme types
const THEMES = {
    dark: "dark",
    light: "light",
    gradient: "gradient",
};

// Time-based gradient logic
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return "morning";
    if (hour >= 10 && hour < 16) return "day";
    if (hour >= 16 && hour < 19) return "sunset";
    return "night";
}

// Get gradient classes based on time
function getGradientByTime() {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
        case "morning":
            return {
                background: "bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300",
                metaThemeColor: "#C7D2FE",
                cardBg: "bg-white/40 backdrop-blur-xl",
                textPrimary: "text-slate-800",
                textSecondary: "text-slate-600",
                textMuted: "text-slate-500",
                sidebarBg: "bg-white/30 backdrop-blur-xl border-r border-white/30",
                inputBg: "bg-white/40 backdrop-blur-md border border-slate-300/50 text-slate-800 placeholder:text-slate-500",
                buttonBg: "bg-white/30",
                buttonHover: "hover:bg-white/50",
                // Harmonized with Indigo/Pink morning
                addTaskButton: "border-2 border-dashed border-indigo-200/50 bg-indigo-50/30 text-indigo-800 hover:bg-white/60 hover:border-indigo-300 hover:shadow-[0_0_15px_rgba(165,180,252,0.4)] transition-all duration-300",
                themeSwitcher: {
                    container: "bg-white/30 backdrop-blur-xl border border-white/50 shadow-lg shadow-indigo-500/10",
                    button: "text-indigo-900/60 hover:text-indigo-900 hover:bg-white/40",
                    activeButton: "bg-white/60 text-indigo-900 shadow-sm border border-white/60 backdrop-blur-md"
                },
                ghostButton: "text-indigo-800 hover:bg-indigo-50/30 hover:text-indigo-950 backdrop-blur-sm",
                // Tinted Glass: Morning Mist (Lavender tint)
                taskCard: "bg-white/60 backdrop-blur-md border border-white/50 shadow-sm hover:bg-white/80 hover:shadow-md hover:border-indigo-100 transition-all duration-200",
                borderColor: "border-indigo-200/30",
                cardBorder: "border-white/40",
                cardHover: "hover:border-indigo-200/50 hover:shadow-lg",
                isDark: false,
            };
        case "day":
            return {
                background: "bg-gradient-to-br from-cyan-300 via-blue-300 to-indigo-400",
                metaThemeColor: "#A5F3FC",
                // Column Background: Tinted Azure Glass
                cardBg: "bg-blue-50/30 backdrop-blur-xl border border-white/40",
                textPrimary: "text-slate-800",
                textSecondary: "text-slate-600",
                textMuted: "text-slate-500",
                sidebarBg: "bg-white/30 backdrop-blur-xl border-r border-white/30",
                inputBg: "bg-white/50 backdrop-blur-md border border-blue-100/50 text-slate-800 placeholder:text-blue-900/40",
                buttonBg: "bg-white/30",
                buttonHover: "hover:bg-white/50",
                // Harmonized Add Task: Sky Tint
                addTaskButton: "border-2 border-dashed border-sky-200/50 bg-sky-50/30 text-sky-900 hover:bg-white/60 hover:border-sky-300 hover:shadow-[0_0_15px_rgba(186,230,253,0.4)] transition-all duration-300",
                // Tinted Theme Switcher
                themeSwitcher: {
                    container: "bg-white/30 backdrop-blur-xl border border-white/50 shadow-lg shadow-sky-500/10",
                    button: "text-sky-900/60 hover:text-sky-900 hover:bg-white/40",
                    activeButton: "bg-white/60 text-sky-950 shadow-sm border border-white/60 backdrop-blur-md"
                },
                ghostButton: "text-sky-900 hover:bg-sky-50/30 hover:text-sky-950 backdrop-blur-sm",
                // Tinted Glass: Clear Sky (Azure tint), removing grayness
                taskCard: "bg-sky-50/60 backdrop-blur-md border border-white/60 shadow-sm hover:bg-white/90 hover:shadow-md hover:border-sky-200 transition-all duration-200",
                borderColor: "border-sky-200/30",
                cardBorder: "border-white/40",
                cardHover: "hover:border-sky-200/50 hover:shadow-lg",
                isDark: false,
            };
        case "sunset":
            return {
                background: "bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500",
                metaThemeColor: "#FDBA74",
                cardBg: "bg-rose-950/10 backdrop-blur-xl border border-white/20",
                textPrimary: "text-white",
                textSecondary: "text-white/90",
                textMuted: "text-white/70",
                sidebarBg: "bg-black/10 backdrop-blur-xl border-r border-white/20",
                inputBg: "bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60",
                buttonBg: "bg-white/20",
                buttonHover: "hover:bg-white/30",
                addTaskButton: "border-2 border-dashed border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300",
                themeSwitcher: {
                    container: "bg-rose-950/20 backdrop-blur-md border border-white/20 shadow-lg",
                    button: "text-white/60 hover:text-white hover:bg-white/10",
                    activeButton: "bg-white/20 text-white border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                },
                ghostButton: "text-white/80 hover:bg-white/20 hover:text-white",
                // Tinted Glass: Sunset
                taskCard: "bg-rose-950/20 backdrop-blur-md border border-white/20 shadow-sm hover:bg-rose-900/30 hover:border-white/30 transition-all duration-200",
                borderColor: "border-white/20",
                cardBorder: "border-white/20",
                cardHover: "hover:border-white/40 hover:shadow-lg",
                isDark: true, // Sunset is dark enough for white text
            };
        case "night":
        default:
            return {
                background: "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900",
                metaThemeColor: "#111827",
                cardBg: "bg-indigo-950/30 backdrop-blur-xl",
                textPrimary: "text-indigo-50",
                textSecondary: "text-indigo-200",
                textMuted: "text-indigo-300",
                sidebarBg: "bg-black/30 backdrop-blur-xl border-r border-white/10",
                inputBg: "bg-indigo-950/30 backdrop-blur-md border border-white/10 text-white placeholder:text-indigo-300/50",
                buttonBg: "bg-white/10",
                buttonHover: "hover:bg-white/20",
                addTaskButton: "border-indigo-300/20 text-indigo-300/60 hover:text-indigo-100 hover:border-indigo-300/40 hover:bg-indigo-500/10 border-dashed",
                themeSwitcher: {
                    container: "bg-indigo-950/40 backdrop-blur-md border border-white/10 shadow-lg",
                    button: "text-indigo-400 hover:text-indigo-100 hover:bg-white/10",
                    activeButton: "bg-neon-purple text-white shadow-[0_0_15px_rgba(184,51,255,0.5)] border border-indigo-500/30"
                },
                ghostButton: "text-indigo-300 hover:bg-white/10 hover:text-white",
                // Tinted Glass: Deep Space
                taskCard: "bg-indigo-950/40 backdrop-blur-md border border-white/10 shadow-sm hover:bg-indigo-900/50 hover:border-white/20 transition-all duration-200",
                borderColor: "border-white/10",
                cardBorder: "border-white/10",
                cardHover: "hover:border-white/30 hover:shadow-lg",
                isDark: true,
            };
    }
}

// Theme configurations
const themeConfigs = {
    dark: {
        background: "bg-deepblack",
        metaThemeColor: "#0F0F12",
        cardBg: "bg-[#18181b] border border-white/5",
        textPrimary: "text-gray-100",
        textSecondary: "text-gray-400",
        textMuted: "text-gray-500",
        sidebarBg: "bg-[#18181b] border-r border-white/5",
        inputBg: "bg-white/5 border border-white/10 text-white placeholder:text-gray-500",
        buttonBg: "bg-white/5",
        buttonHover: "hover:bg-white/10",
        addTaskButton: "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300 hover:bg-white/5 active:bg-white/10 border-dashed",
        themeSwitcher: {
            container: "bg-black/40 backdrop-blur-md border border-white/10 shadow-lg",
            button: "text-gray-400 hover:text-white hover:bg-white/10",
            activeButton: "bg-neon-purple text-white shadow-[0_0_15px_rgba(184,51,255,0.5)] border border-white/10"
        },
        ghostButton: "text-gray-400 hover:bg-white/10 hover:text-white",
        taskCard: "bg-[#27272a] border border-white/5 shadow-sm hover:bg-[#3f3f46] hover:border-white/10 transition-all duration-200",
        borderColor: "border-white/10",
        cardBorder: "border-white/5",
        cardHover: "hover:border-white/20 hover:bg-white/10",
        isDark: true,
    },
    light: {
        background: "bg-slate-50",
        metaThemeColor: "#F8FAFC",
        cardBg: "bg-white",
        textPrimary: "text-slate-800",
        textSecondary: "text-slate-600",
        textMuted: "text-slate-400",
        sidebarBg: "bg-white border-r border-slate-200",
        inputBg: "bg-slate-100 border-transparent text-slate-800 placeholder:text-slate-400",
        buttonBg: "bg-slate-100",
        buttonHover: "hover:bg-slate-200",
        addTaskButton: "border-2 border-dashed border-slate-300 bg-white/50 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-white hover:shadow-md transition-all duration-300",
        themeSwitcher: {
            container: "bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg",
            button: "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
            activeButton: "bg-white text-slate-800 shadow-md border border-slate-100"
        },
        ghostButton: "text-slate-500 hover:bg-slate-200 hover:text-slate-800",
        taskCard: "bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200",
        borderColor: "border-slate-200",
        cardBorder: "border-slate-100 shadow-sm",
        cardHover: "hover:shadow-md hover:border-slate-300",
        isDark: false,
    },
};
// Gradient theme is computed dynamically from getGradientByTime()
// No static config needed here

// Create context
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("kanban-theme");
        return saved && Object.keys(THEMES).includes(saved) ? saved : "dark";
    });

    const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());

    // Persist theme to localStorage
    useEffect(() => {
        localStorage.setItem("kanban-theme", theme);
    }, [theme]);

    // Update time of day every minute for gradient mode
    useEffect(() => {
        if (theme !== "gradient") return;

        const interval = setInterval(() => {
            setTimeOfDay(getTimeOfDay());
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [theme]);

    // Compute current theme config
    const themeConfig = useMemo(() => {
        if (theme === "gradient") {
            // Return the complete gradient config for current time
            return getGradientByTime();
        }
        return themeConfigs[theme];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, timeOfDay]);

    // Update meta theme color
    useEffect(() => {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor && themeConfig.metaThemeColor) {
            metaThemeColor.setAttribute('content', themeConfig.metaThemeColor);
        }
    }, [themeConfig.metaThemeColor]);

    const value = {
        theme,
        setTheme,
        themeConfig,
        themes: THEMES,
        isDark: themeConfig.isDark,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

export { THEMES, getGradientByTime, getTimeOfDay };
