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
                borderColor: "border-slate-300/30",
                cardBorder: "border-white/30",
                cardHover: "hover:border-slate-400/50 hover:shadow-lg",
                isDark: false,
            };
        case "day":
            return {
                background: "bg-gradient-to-br from-cyan-300 via-blue-300 to-indigo-400",
                metaThemeColor: "#A5F3FC",
                cardBg: "bg-white/40 backdrop-blur-xl",
                textPrimary: "text-slate-800",
                textSecondary: "text-slate-600",
                textMuted: "text-slate-500",
                sidebarBg: "bg-white/30 backdrop-blur-xl border-r border-white/30",
                inputBg: "bg-white/40 backdrop-blur-md border border-slate-300/50 text-slate-800 placeholder:text-slate-500",
                buttonBg: "bg-white/30",
                buttonHover: "hover:bg-white/50",
                borderColor: "border-slate-300/30",
                cardBorder: "border-white/30",
                cardHover: "hover:border-slate-400/50 hover:shadow-lg",
                isDark: false,
            };
        case "sunset":
            return {
                background: "bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500",
                metaThemeColor: "#FDBA74",
                cardBg: "bg-white/30 backdrop-blur-xl",
                textPrimary: "text-white",
                textSecondary: "text-white/80",
                textMuted: "text-white/60",
                sidebarBg: "bg-black/20 backdrop-blur-xl border-r border-white/20",
                inputBg: "bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60",
                buttonBg: "bg-white/20",
                buttonHover: "hover:bg-white/30",
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
                cardBg: "bg-black/30 backdrop-blur-xl",
                textPrimary: "text-gray-100",
                textSecondary: "text-gray-400",
                textMuted: "text-gray-500",
                sidebarBg: "bg-black/30 backdrop-blur-xl border-r border-white/10",
                inputBg: "bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/50",
                buttonBg: "bg-white/10",
                buttonHover: "hover:bg-white/20",
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
        cardBg: "bg-white/5 backdrop-blur-md",
        cardBorder: "border-white/5",
        cardHover: "hover:border-white/20",
        textPrimary: "text-gray-100",
        textSecondary: "text-gray-400",
        textMuted: "text-gray-600",
        sidebarBg: "bg-[#0F0F12]",
        inputBg: "bg-white/5 border border-white/5 text-gray-200 placeholder:text-gray-500",
        buttonBg: "bg-white/5",
        buttonHover: "hover:bg-white/10",
        borderColor: "border-white/5",
        isDark: true,
    },
    light: {
        background: "bg-slate-50",
        metaThemeColor: "#FDFCF8",
        cardBg: "bg-white",
        cardBorder: "border-slate-200",
        cardHover: "hover:border-slate-300 hover:shadow-md",
        textPrimary: "text-slate-800",
        textSecondary: "text-slate-500",
        textMuted: "text-slate-400",
        sidebarBg: "bg-[#FDFCF8] border-r border-slate-200",
        inputBg: "bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400",
        buttonBg: "bg-slate-100",
        buttonHover: "hover:bg-slate-200",
        borderColor: "border-slate-200",
        isDark: false,
    },
    // Gradient theme is computed dynamically from getGradientByTime()
    // No static config needed here
};

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
